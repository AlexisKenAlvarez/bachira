import Post from "@/components/user/Post";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { postComments, postLikes, posts } from "@/server/db/schema/schema";
import { and, desc, eq, sql } from "drizzle-orm";
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
                }
              }
            },
            limit: 1,
          },
          likes: {
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
                }
              }
            },
            limit: 1,
          },
        },
        orderBy: desc(posts.id),
        limit: limit + 1,
      });
      console.log("🚀 ~ file: posts.ts:77 ~ .query ~ postData:", postData[0]?.likes)

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
        postId: z.number(),
        action: z.enum(["LIKE", "UNLIKE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.action === "LIKE") {
        await ctx.db.insert(postLikes).values({
          userId: input.userId,
          postId: input.postId,
        });
      } else {
        await ctx.db
          .delete(postLikes)
          .where(
            and(
              eq(postLikes.userId, input.userId),
              eq(postLikes.postId, input.postId),
            ),
          );
      }

      return {
        success: true
      }
    }),
  addComment: privateProcedure.input(
    z.object({
      userId: z.string(),
      postId: z.number(),
      text: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    await ctx.db.insert(postComments).values({
      userId: input.userId,
      postId: input.postId,
      text: input.text,

    })

    return {
      success: true
    }
  })
});

export type PostRouter = typeof postRouter;
