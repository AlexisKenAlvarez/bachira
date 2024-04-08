import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  countNotifications: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        seen: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { count, error } = await ctx.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("notificationFor", input.userId)
        .eq("seen", input.seen);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching notifications",
        });
      }

      return count;
    }),
  seenNotifications: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("notifications")
        .update({ seen: true })
        .eq("notificationFor", input.userId);
    }),
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


      if (input.cursor) {
        console.log("MAY CURSOR");
        const { data: notifications } = await ctx.supabase
          .from("notifications")
          .select(`*, notificationFor:user ( * ), notificationFrom:user ( * )`)
          .eq("notificationFor", input.userId)
          .lt("id", input.cursor ?? 0)
          .order("id", { ascending: false })
          .limit(limit + 1);

        let nextCursor;

        if (notifications!.length > limit) {
          const nextItem = notifications?.pop(); // return the last item from the array
          nextCursor = nextItem?.id;
        }
        return {
          notifications,
          nextCursor,
        };
      } else {
        const { data: notifications } = await ctx.supabase
          .from("notifications")
          .select(`*, notificationFor:user ( * ), notificationFrom:user ( * )`)
          .eq("notificationFor", input.userId)
          .gt("id", input.cursor ?? 0)
          .order("id", { ascending: false })
          .limit(limit + 1)

 

        let nextCursor;

        return {
          notifications,
          nextCursor,
        };
      }
    }),
  readNotifications: privateProcedure
    .input(
      z.object({
        notificationId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("notifications")
        .update({ status: "READ" })
        .eq("id", input.notificationId);
    }),
});

export type NotificationRouter = typeof notificationRouter;
