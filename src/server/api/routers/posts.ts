import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { notification } from "@/server/db/schema/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const notificationRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        text: z.string(),
        privacy: z.enum(["Public", "Private"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.query.posts.findMany({

      })
    }),
});

export type NotificationRouter = typeof notificationRouter;
