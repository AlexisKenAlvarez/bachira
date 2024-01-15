import { signupSchema } from "../../lib/zodSchema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { users } from "@bachira/db/schema/schema";
import { z } from "zod";

export const authenticationRouter = createTRPCRouter({
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
});

export type authenticationRouter = typeof authenticationRouter;
