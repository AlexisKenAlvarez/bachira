import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { followership, users } from "@/server/db/schema";
import { signupSchema } from "@/lib/zodSchema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.users.findMany({});

    if (data[0]) {
      return data;
    }
    return null;
  }),
  getUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.users.findMany({
        where: (users, { eq }) => eq(users.username, input.username),
        with: {
          follower: true,
          following: true,
        },
      });

      if (data) {
        return data;
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
  followUser: publicProcedure
    .input(
      z.object({
        followerId: z.string(),
        followingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const followPrepare = ctx.db
        .insert(followership)
        .values({
          follower_id: sql.placeholder("follower_id"),
          following_id: sql.placeholder("following_id"),
        })
        .prepare();

      await followPrepare.execute({
        follower_id: input.followerId,
        following_id: input.followingId,
      });

      return {
        success: true,
      };
    }),
  unfollowUser: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletePrepare = ctx.db
        .delete(followership)
        .where(eq(followership.follower_id, sql.placeholder("user_id")))
        .prepare();

      const query = await deletePrepare.execute({
        user_id: input.user_id,
      });
      console.log(query);

      return query;
    }),
});

export type UserRouter = typeof userRouter;