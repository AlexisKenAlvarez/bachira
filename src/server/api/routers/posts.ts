import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import {
  notification,
  postComments,
  postLikes,
  posts,
} from "@/server/db/schema/schema";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { and, desc, eq } from "drizzle-orm";
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
        privacy: z.enum(["PUBLIC", "PRIVATE"]),
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
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;

      const postData = await ctx.db.query.posts.findMany({
        where: (posts, { gt, lt }) =>
          input.cursor
            ? lt(posts.id, input.cursor ?? 0)
            : gt(posts.id, input.cursor ?? 0),
        with: {
          user: true,
          comments: {
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
            limit: 2,
          },
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
      console.log("🚀 ~ file: posts.ts:70 ~ .query ~ postData:", postData);

      let nextCursor;

      if (postData.length > limit) {
        const nextItem = postData.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        postData,
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
        image: z.string()
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
            type: "LIKE",
          });

          pusherServer.trigger(
            toPusherKey(`user:${input.authorId}:incoming_notification`),
            "incoming_notification",
            {
              notificationFrom: input.username,
              type: "LIKE",
              image: input.image,
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
  deleteComment: privateProcedure.input(z.object({
    commentId: z.number()
  })).mutation(async ({ ctx, input }) => {
    const { commentId } = input
    await ctx.db.delete(postComments).where(eq(postComments.id, commentId))
  })
});

export type PostRouter = typeof postRouter;
