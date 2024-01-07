import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import {
  followership,
  notification,
  postComments,
  postLikes,
  posts,
} from "@/server/db/schema/schema";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, "10 s"),
});

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        text: z.string(),
        privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        userId: input.userId,
        text: input.text,
        privacy: input.privacy,
      });
    }),
  getPosts: privateProcedure
    .input(
      z.object({
        postId: z.number().nullish(),
        userId: z.string(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { postId, cursor, userId } = input;

      const limit = input.limit ?? 10;

      const postData = await ctx.db.query.posts.findMany({
        where: (posts, { gt, lt, eq }) =>
          postId
            ? eq(posts.id, postId)
            : input.cursor
            ? lt(posts.id, cursor ?? 0)
            : gt(posts.id, cursor ?? 0),

        with: {
          user: true,
          likes: {
            with: {
              user: {
                columns: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: desc(posts.id),
        limit: limit + 1,
      });

      const userFollowing = await ctx.db.query.followership.findMany({
        where: (followership, { eq }) => eq(followership.follower_id, userId),
      });

      let nextCursor;
      const newData: typeof postData = postData.filter((post) => {
        if (post.privacy === "FOLLOWERS") {
          if (userFollowing.some((user) => user.following_id === post.userId)) {
            return post;
          } else if (post.userId === userId) {
            return post;
          }
        } else if (post.privacy === "PRIVATE") {
          if (post.userId === userId) {
            return post;
          }
        } else {
          return post;
        }
      });

      if (newData.length > limit) {
        const nextItem = newData.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        postData: newData,
        userFollowing,
        nextCursor,
      };
    }),
  likePost: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        authorId: z.string(),
        postId: z.number(),
        action: z.enum(["LIKE", "UNLIKE"]),
        username: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await rateLimiter.limit(ctx.session.user.id);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const { authorId, postId, userId, action, username } = input;
      if (action === "LIKE") {
        await ctx.db.insert(postLikes).values({
          userId: userId,
          postId: postId,
        });

        if (userId !== authorId) {
          await ctx.db.insert(notification).values({
            notificationFrom: userId,
            notificationFor: authorId,
            postId,
            type: "LIKE",
          });

          pusherServer.trigger(
            toPusherKey(`user:${input.authorId}:incoming_notification`),
            "incoming_notification",
            {
              notificationFrom: username,
              type: "LIKE",
              image: input.image,
              postId,
            },
          );
        }
      } else {
        await ctx.db
          .delete(postLikes)
          .where(
            and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)),
          );

        if (userId !== authorId) {
          await ctx.db
            .delete(notification)
            .where(
              and(
                eq(notification.notificationFrom, userId),
                eq(notification.notificationFor, authorId),
                eq(notification.type, "LIKE"),
              ),
            );
        }
      }
    }),
  addComment: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        postId: z.number(),
        text: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(postComments).values({
        userId: input.userId,
        postId: input.postId,
        text: input.text,
      });

      return {
        success: true,
      };
    }),
  deleteComment: privateProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      await ctx.db.delete(postComments).where(eq(postComments.id, commentId));
    }),
  getComments: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        singlePage: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const commentData = await ctx.db.query.postComments.findMany({
        where: (postComments, { gt, lt, eq, and }) =>
          and(
            gt(postComments.id, input.cursor ?? 0),
            eq(postComments.postId, input.postId),
          ),

        with: {
          user: {
            columns: {
              countId: true,
              id: true,
              username: true,
              coverPhoto: true,
              email: true,
              image: true,
              name: true,
            },
          },
        },
        orderBy: input.singlePage ? asc(postComments.id) : desc(postComments.id),
        limit: limit + 1
      });

      let nextCursor;

      if (commentData.length > limit) {
        let nextItem

        for (let i = 0; i < commentData.length; i++) {
          if (i === commentData.length - 1) {
            nextItem = commentData[i]
          }
        }

        nextCursor = nextItem?.id;
      }

      return {
        commentData,
        nextCursor,
      };
    }),
  getLikes: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { postId, limit: inputLimit, cursor } = input;
      const limit = inputLimit ?? 10;

      const likeData = await ctx.db.query.postLikes.findMany({
        where: (postLikes, { gt, lt, eq }) =>
          input.cursor
            ? lt(postLikes.id, cursor ?? 0) && eq(postLikes.postId, postId)
            : gt(postLikes.id, cursor ?? 0) && eq(postLikes.postId, postId),
        with: {
          user: {
            columns: {
              countId: true,
              id: true,
              username: true,
              coverPhoto: true,
              email: true,
              image: true,
              name: true,
            },
          },
        },
        orderBy: desc(postComments.id),
        limit: limit + 1,
      });
      console.log("🚀 ~ file: posts.ts:256 ~ ).query ~ likeData:", likeData);

      let nextCursor;

      if (likeData.length > limit) {
        const nextItem = likeData.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        likeData,
        nextCursor,
      };
    }),
  deletePost: privateProcedure
    .input(
      z.object({
        postId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(posts).where(eq(posts.id, input.postId));
      await ctx.db.delete(postLikes).where(eq(postLikes.postId, input.postId));
      await ctx.db
        .delete(postComments)
        .where(eq(postComments.postId, input.postId));
      await ctx.db
        .delete(notification)
        .where(eq(notification.postId, input.postId));

      return {
        success: true,
      };
    }),
});

export type PostRouter = typeof postRouter;
