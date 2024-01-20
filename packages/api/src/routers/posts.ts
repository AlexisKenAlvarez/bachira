import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  notification,
  POST_REPORT_TYPE,
  postComments,
  postLikes,
  postReports,
  posts,
} from "@bachira/db/schema/schema";

import { pusherServer, toPusherKey } from "../../lib/pusher";
import { FollowershipSchema } from "../../lib/zodSchema";
import { createTRPCRouter, privateProcedure } from "../trpc";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(6, "10 s"),
});

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        text: z.string(),
        privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
        toMention: z
          .array(
            z.object({
              username: z.string(),
              id: z.string(),
              image: z.string(),
            }),
          )
          .nullable(),
        authorImage: z.string().nullish(),
        username: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { toMention, userId, text, privacy, authorImage, username } = input;
      const postData = await ctx.db.insert(posts).values({
        userId: userId,
        text: text,
        privacy: privacy,
      });
      console.log(
        "🚀 ~ file: posts.ts:77 ~ mentioned.forEach ~ authorImage:",
        authorImage,
      );
      if (toMention) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        toMention.forEach(async (toMention) => {
          const user = await ctx.db.query.users.findFirst({
            where: (user, { eq }) => eq(user.username, toMention.username),
          });

          if (user) {
            await ctx.db.insert(notification).values({
              notificationFrom: userId,
              notificationFor: toMention.id,
              postId: +postData.insertId,
              type: "MENTION_POST",
            });

            await pusherServer.trigger(
              toPusherKey(`user:${user.id}:incoming_notification`),
              "incoming_notification",
              {
                notificationFrom: username,
                type: "MENTION_POST",
                image: authorImage,
                postId: +postData.insertId,
              },
            );
          }
        });
      }
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

      if (postData.length === 0 && input.postId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userFollowing = await ctx.db.query.followership.findMany({
        where: (followership, { eq }) =>
          eq(followership.follower_id, input.userId),
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
            type: "LIKE_POST",
          });

          await pusherServer.trigger(
            toPusherKey(`user:${input.authorId}:incoming_notification`),
            "incoming_notification",
            {
              notificationFrom: username,
              type: "LIKE_POST",
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
                eq(notification.type, "LIKE_POST"),
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
        username: z.string(),
        image: z.string(),
        authorId: z.string(),
        toMention: z
          .array(
            z.object({
              username: z.string(),
              id: z.string(),
              image: z.string(),
            }),
          )
          .nullable(),
        userFollowing: z.array(FollowershipSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { toMention } = input;
      let notifyAuthor = true;

      await ctx.db.insert(postComments).values({
        userId: input.userId,
        postId: input.postId,
        text: input.text,
      });

      const postPrivacy = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.postId),
        columns: {
          commentPrivacy: true,
        },
      });

      if (
        postPrivacy?.commentPrivacy === "FOLLOWERS" &&
        input.userFollowing.some(
          (user) => user.following_id !== input.authorId,
        ) === false
      ) {
        console.log("UNPORCS");
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      } else if (
        postPrivacy?.commentPrivacy === "PRIVATE" &&
        input.authorId !== input.userId
      ) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      }

      if (toMention) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-misused-promises
        toMention.forEach(async (value) => {
          if (value.id === input.authorId) {
            notifyAuthor = false;
          }
          const user = await ctx.db.query.users.findFirst({
            where: (user, { eq }) => eq(user.username, value.username),
          });

          if (user) {
            await ctx.db.insert(notification).values({
              notificationFrom: input.userId,
              notificationFor: value.id,
              postId: input.postId,
              type: "MENTION_COMMENT",
            });

            await pusherServer.trigger(
              toPusherKey(`user:${value.id}:incoming_notification`),
              "incoming_notification",
              {
                notificationFrom: input.username,
                type: "MENTION_COMMENT",
                image: value.image,
                postId: input.postId,
              },
            );
          }
        });
      }

      if (notifyAuthor && input.authorId !== input.userId) {
        await ctx.db.insert(notification).values({
          notificationFrom: input.userId,
          notificationFor: input.authorId,
          postId: input.postId,
          type: "COMMENT",
        });

        await pusherServer.trigger(
          toPusherKey(`user:${input.authorId}:incoming_notification`),
          "incoming_notification",
          {
            notificationFrom: input.username,
            type: "COMMENT",
            image: input.image,
            postId: input.postId,
          },
        );
      }

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
        where: (postComments, { gt, eq, and }) =>
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
        orderBy: input.singlePage
          ? asc(postComments.id)
          : desc(postComments.id),
        limit: limit + 1,
      });

      let nextCursor;

      if (commentData.length > limit) {
        let nextItem;

        for (let i = 0; i < commentData.length; i++) {
          if (i === commentData.length - 1) {
            nextItem = commentData[i];
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
  editPost: privateProcedure
    .input(
      z.object({
        originalPost: z.object({
          postId: z.number(),
          postText: z.string(),
          privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
          author: z.string(),
        }),
        editedPost: z.object({
          postText: z.string(),
          privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { originalPost, editedPost } = input;

      if (originalPost.postText !== editedPost.postText) {
        await ctx.db
          .update(posts)
          .set({
            text: editedPost.postText,
          })
          .where(eq(posts.id, originalPost.postId));
      } else if (originalPost.privacy !== editedPost.privacy) {
        await ctx.db
          .update(posts)
          .set({
            privacy: editedPost.privacy,
          })
          .where(eq(posts.id, originalPost.postId));
      }

      return {
        success: true,
      };
    }),
  editCommentPrivacy: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({
          commentPrivacy: input.privacy,
        })
        .where(eq(posts.id, input.postId));
    }),
  reportPost: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        userId: z.string(),
        type: z.enum([...POST_REPORT_TYPE]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(postReports).values({
        postId: input.postId,
        userId: input.userId,
        reportType: input.type,
      });
    }),
});

export type PostRouter = typeof postRouter;
