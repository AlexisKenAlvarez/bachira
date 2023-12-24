import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { posts } from "@/server/db/schema/schema";
import { desc } from "drizzle-orm";
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
        where: (posts, { gt, lt }) => input.cursor ? lt(posts.id, input.cursor ?? 0) : gt(posts.id, input.cursor ?? 0),
        with: {
          user: true,
          comments: true,
          likes: true,
        },
        orderBy: desc(posts.id),
        limit: limit + 1,
      });

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
});

export type PostRouter = typeof postRouter;
