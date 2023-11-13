import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { notification } from "@/server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const notificationRouter = createTRPCRouter({
  getNotifications: privateProcedure
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

      const notifications = await ctx.db.query.notification.findMany({
        where: (notification, { eq, and, gt }) =>
          and(
            eq(notification.notificationFor, input.userId),
            gt(notification.id, input.cursor ?? 0),
          ),
        with: {
          notificationFrom: true,
        },
        orderBy: desc(notification.id),
        limit: limit + 1,
      });

      let nextCursor;

      if (notifications.length > limit) {
        const nextItem = notifications.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  countNotifications: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(["UNREAD", "READ"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const count = await ctx.db.execute(
      //   sql`(SELECT count(*) as count from ${notification} WHERE notificationFor = ${input.userId} AND STATUS = ${input.type})`.as(
      //     "count",
      //   ),
      // );

      const count = await ctx.db.select({ count: sql`COUNT(*)` })
      .from(notification)
      .where(and(
        eq(notification.notificationFor, input.userId),
        eq(notification.status, input.type)
      ))

      return count;
    }),
});

export type NotificationRouter = typeof notificationRouter;
