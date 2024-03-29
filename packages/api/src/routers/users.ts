import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { and, asc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";

import type { User } from "@bachira/db/schema/schema";
import {
  bans,
  followership,
  notification,
  USER_REPORT_TYPE,
  users,
} from "@bachira/db/schema/schema";

import { editProfileSchema, pusherServer, toPusherKey } from "../../lib/pusher";
import { utapi } from "../../lib/uploadthing";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { DURATION_TYPE } from "@bachira/db/schema/schema"


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, "10 s"),
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
        const data = await ctx.db.query.users.findFirst({
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

        return data as User & {
          following: number;
          followers: number;
        };
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

      if (data && data !== null) {
        const isFollowing = data.follower.filter(
          (val: { following_id: string }) =>
            val.following_id === input.following_id,
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
      const existing = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, input.username),
      });

      if (existing) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      }

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

        await pusherServer.trigger(
          toPusherKey(`user:${input.followingId}:incoming_notification`),
          "incoming_notification",
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
  searchUser: privateProcedure
    .input(
      z.object({
        searchValue: z.string(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;

      const searchedUsers = await ctx.db.query.users.findMany({
        where: (users, { like, gt, and }) =>
          and(
            like(users.username, `${input.searchValue}%`),
            gt(users.countId, input.cursor ?? 0),
          ),
        orderBy: asc(users.countId),
        limit: limit + 1,
      });

      let nextCursor;

      if (searchedUsers.length > limit) {
        const nextItem = searchedUsers.pop(); // return the last item from the array
        nextCursor = nextItem?.countId;
      }

      return {
        searchedUsers,
        nextCursor,
      };
    }),
  uploadCover: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ coverPhoto: input.image })
        .where(eq(users.id, input.userId));

      return {
        success: true,
      };
    }),
  deleteImage: privateProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        imageKey: z.string(),
        deleteFromDb: z.boolean(),
        deleteFrom: z.enum(["cover", "profile"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deleteIfUtf = async (imageUrl: string) => {
        const newUrl = new URL(imageUrl);

        if (
          newUrl.hostname === "utfs.io" ||
          newUrl.hostname === "uploadthing.com"
        ) {
          const filekey = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
          await utapi.deleteFiles(filekey);
        }
      };

      if (input.deleteFromDb && input.userId) {
        await ctx.db
          .update(users)
          .set(
            input.deleteFrom === "cover"
              ? { coverPhoto: null }
              : { image: null },
          )
          .where(eq(users.id, input.userId));

        await deleteIfUtf(input.imageKey);

        return {
          sucess: true,
        };
      } else {
        await deleteIfUtf(input.imageKey);

        return {
          sucess: true,
        };
      }
    }),

  saveProfile: privateProcedure
    .input(
      z.object({
        id: z.string(),
        userData: editProfileSchema,
        newData: editProfileSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userData, newData, id } = input;

      if (userData.bio !== newData.bio) {
        await ctx.db
          .update(users)
          .set({ bio: newData.bio })
          .where(eq(users.id, id));
      }

      if (userData.gender !== newData.gender) {
        await ctx.db
          .update(users)
          .set({ gender: newData.gender })
          .where(eq(users.id, id));
      }

      if (userData.website !== newData.website) {
        await ctx.db
          .update(users)
          .set({ website: newData.website })
          .where(eq(users.id, id));
      }

      return {
        success: true,
      };
    }),
  mentionUser: privateProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const searchedUsers = await ctx.db
        .select({
          username: sql<string>`(${users.username})`.as("display"),
          id: users.id,
          image: users.image,
          countId: users.countId,
        })
        .from(users)
        .orderBy(asc(users.countId))
        .limit(8)
        .where(and(like(users.username, `${input.username}%`)));

      return {
        searchedUsers,
      };
    }),
  postFollowing: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userFollowing = await ctx.db.query.followership.findMany({
        where: (followership, { eq }) =>
          eq(followership.follower_id, input.userId),
      });

      return {
        userFollowing,
      };
    }),
  banUser: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.enum([...USER_REPORT_TYPE]),
        duration: z.number().min(1).max(100),
        durationType: z.enum([...DURATION_TYPE]), // TODO: add duration type
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const durationType = input.durationType
      const currentDate = new Date();
      const duration = new Date(currentDate);

      if (durationType === "MINUTES") {
        duration.setMinutes(duration.getMinutes() + input.duration);
      } else if (durationType === "HOURS") {
        duration.setHours(duration.getHours() + input.duration);
      } else if (durationType === "DAYS") {
        duration.setDate(duration.getDate() + input.duration);
      } else if (durationType === "WEEKS") {
        duration.setDate(duration.getDate() + input.duration * 7);
      } else if (durationType === "MONTHS") {
        duration.setMonth(duration.getMonth() + input.duration);
      } else if (durationType === "YEARS") {
        duration.setFullYear(duration.getFullYear() + input.duration);
      }

      await ctx.db.insert(bans).values({
        userId: input.userId,
        reason: input.reason,
        duration: duration,
      })
      return {
        success: true,
      };
    }),
  getBannedUser: privateProcedure.input(z.object({
    userId: z.string(),
  })).mutation(async ({ ctx, input }) => {

    const data = await ctx.db.query.bans.findFirst({
      where: (bans, {eq}) => eq(bans.userId, input.userId)
    })

    return {
      bannedUser: data
    }
  })
});

export type UserRouter = typeof userRouter;
