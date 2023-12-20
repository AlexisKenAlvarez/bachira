import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { posts } from "@/server/db/schema/schema";
import { z } from "zod";

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
        privacy: input.privacy
      })
    }),
});

export type PostRouter = typeof postRouter;
