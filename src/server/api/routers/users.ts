import { signupSchema } from "@/lib/zodSchema";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { followership, users } from "@/server/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

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
  checkEmail: publicProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });

      if (data) {
        return true;
      }

      return null;
    }),
  addUser: publicProcedure
    .input(signupSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({ ...input });
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
        .set({ username: input.username })
        .where(eq(users.email, input.email));

      return {
        success: true,
      };
    }),
  followUser: privateProcedure
    .input(
      z.object({
        followerId: z.string(),
        followingId: z.string().optional(),
        action: z.enum(["follow", "unfollow"]),
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

      const deletePrepare = ctx.db
        .delete(followership)
        .where(eq(followership.follower_id, sql.placeholder("user_id")))
        .prepare();

      if (input.action === "follow") {
        await followPrepare.execute({
          follower_id: input.followerId,
          following_id: input.followingId,
        });

        return {
          success: true,
        };
      } else if (input.action === "unfollow") {
        await deletePrepare.execute({
          user_id: input.followerId,
        });

        return {
          success: true,
        };
      }
    }),
  getFollowers: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;

      const followers = await ctx.db
        .select()
        .from(followership)
        .where(
          and(
            eq(followership.following_id, input.userId),
            gt(followership.id, input.cursor ?? 0),
          ),
        )
        .limit(limit + 1);

        let nextCursor

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
