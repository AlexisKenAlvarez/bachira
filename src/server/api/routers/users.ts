import {
  createTRPCRouter,
  privateProcedure
} from "@/server/api/trpc";
import { followership, notification, users } from "@/server/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "10 s"),
});

export const userRouter = createTRPCRouter({
  getUsers: privateProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.users.findMany({});

    if (data[0]) {
      return data;
    }
    return null;
  }),
  getUser: privateProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userSelect = await ctx.db
        .select({
          id: users.id,
        })
        .from(users)
        .where(eq(users.username, input.username));

      if (userSelect[0]) {
        const data = await ctx.db.query.users.findMany({
          where: (users, { eq }) => eq(users.username, input.username),
          extras: {
            followers:
              sql`(SELECT count(*) from ${followership} WHERE following_id = ${userSelect[0].id})`.as(
                "followers",
              ),

            following:
              sql`(SELECT count(*) from ${followership} WHERE follower_id = ${userSelect[0].id})`.as(
                "following",
              ),
          },
        });

        return data;
      }
      return null;
    }),
  checkFollowing: privateProcedure
    .input(
      z.object({
        user_id: z.string(),
        following_id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.user_id),
        with: {
          follower: true,
        },
      });

      if (data) {
        const isFollowing = data.follower.filter(
          (val) => val.following_id === input.following_id,
        );
        console.log(isFollowing);
        return {
          isFollowing: isFollowing.length > 0,
        };
      }

      return null;
    }),
  updateUsername: privateProcedure
    .input(
      z.object({
        email: z.string(),
        username: z
          .string()
          .min(3, "Must be 3 characters or more")
          .max(20, "Must not be more than 20 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ username: input.username.trim() })
        .where(eq(users.email, input.email));

      return {
        success: true,
      };
    }),
  followUser: privateProcedure
    .input(
      z.object({
        followerName: z.string().optional(),
        followerId: z.string(),
        followingId: z.string().optional(),
        action: z.enum(["follow", "unfollow"]),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      
      const { success } = await rateLimiter.limit(ctx.session.user.id);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
      const followPrepare = ctx.db
        .insert(followership)
        .values({
          follower_id: sql.placeholder("follower_id"),
          following_id: sql.placeholder("following_id"),
  
        })
        .prepare();

      const notificationPrepare = ctx.db
        .insert(notification)
        .values({
          notificationFrom: sql.placeholder("notificationFrom"),
          notificationFor: sql.placeholder("notificationFor"),
          type: "FOLLOW",
        })
        .prepare();

      const deletePrepare = ctx.db
        .delete(followership)
        .where(
          and(
            eq(followership.follower_id, sql.placeholder("user_id")),
            eq(followership.following_id, sql.placeholder("followingId")),
          ),
        )
        .prepare();

      const deleteNotifPrepare = ctx.db
        .delete(notification)
        .where(
          and(
            eq(notification.notificationFrom, sql.placeholder("user_id")),
            eq(notification.notificationFor, sql.placeholder("followingId")),
            eq(notification.type, sql.placeholder("type")),
          ),
        )
        .prepare();

      if (input.action === "follow") {
        await followPrepare.execute({
          follower_id: input.followerId,
          following_id: input.followingId,
        });

        await notificationPrepare.execute({
          notificationFrom: input.followerId,
          notificationFor: input.followingId,
        });

        pusherServer.trigger(
          toPusherKey(`user:${input.followingId}:incoming_follow`),
          "incoming_follow",
          {
            notificationFrom: input.followerName,
            type: "FOLLOW",
            image: input.image,
          },
        );

        return {
          success: true,
        };
      } else if (input.action === "unfollow") {
        await deletePrepare.execute({
          user_id: input.followerId,
          followingId: input.followingId,
        });

        await deleteNotifPrepare.execute({
          user_id: input.followerId,
          followingId: input.followingId,
          type: "FOLLOW",
        });
      }

      return {
        success: true,
      };
    }),
  getFollowers: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
        type: z.enum(["followers", "following"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;

      const followers = await ctx.db.query.followership.findMany({
        where: (followership, { eq, gt, and }) =>
          and(
            eq(
              input.type === "followers"
                ? followership.following_id
                : followership.follower_id,
              input.userId,
            ),
            gt(followership.id, input.cursor ?? 0),
          ),
        orderBy: asc(followership.id),
        limit: limit + 1,
        with: {
          follower: true,
          following: true,
        },
      });

      let nextCursor;

      if (followers.length > limit) {
        const nextItem = followers.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        followers,
        nextCursor,
      };
    }),
});

export type UserRouter = typeof userRouter;
