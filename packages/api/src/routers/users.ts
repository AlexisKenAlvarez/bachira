import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { DURATION_TYPE, USER_REPORT_TYPE } from "@bachira/db/schema/schema";

import { editProfileSchema, pusherServer, toPusherKey } from "../../lib/pusher";
import { utapi } from "../../lib/uploadthing";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

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
    const { data } = await ctx.supabase.from("users").select("*");

    return data;
  }),
  getUser: privateProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: userSelect } = await ctx.supabase
        .from("user")
        .select(" id ")
        .eq("username", input.username);

      if (userSelect?.[0]) {
        const { data: userData } = await ctx.supabase
          .from("user")
          .select()
          .eq("username", input.username)
          .single();

        const { count: followersCount } = await ctx.supabase
          .from("followership")
          .select()
          .eq("following_id", userSelect[0].id);

        const { count: followingCount } = await ctx.supabase
          .from("followership")
          .select()
          .eq("follower_id", userSelect[0].id);

        const data = {
          ...userData,
          followers: followersCount,
          following: followingCount,
        };

        return data;
      }

      return null;
    }),
  isCreated: publicProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("user")
        .select()
        .eq("email", input.email)
        .single();

      if (data) {
        const { error } = await ctx.supabase.auth.updateUser({
          data: {
            username: data.username,
          },
        });

        if (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }

      return data;
    }),
  createUser: privateProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string(),
        email: z.string(),
        name: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from("user").insert({
        id: input.id,
        username: input.username,
        email: input.email,
        name: input.name,
        image: input.image,
      });

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return true;
    }),

  mentionUser: privateProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: searchedUsers } = await ctx.supabase
        .from("user")
        .select("username, id, image, countId")
        .ilike("username", `${input.username}%`)
        .limit(8);

      return {
        searchedUsers,
      };
    }),
  checkFollowing: privateProcedure
    .input(
      z.object({
        user_id: z.string(),
        following_id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("user")
        .select(`*, follower_id:followership ( * )`)
        .eq("id", input.user_id)
        .single();

      if (data && data !== null) {
        const isFollowing = data.follower_id.filter(
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
      const { data: existing } = await ctx.supabase
        .from("user")
        .select()
        .eq("username", input.username)
        .single();

      if (existing) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      }

      await ctx.supabase
        .from("user")
        .update({ username: input.username })
        .eq("email", input.email);

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
      const { success } = await rateLimiter.limit(ctx.user.id);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      if (input.action === "follow") {
        await ctx.supabase.from("followership").insert({
          follower_id: input.followerId,
          following_id: input.followingId!,
        });

        await ctx.supabase.from("notifications").insert({
          notificationFrom: input.followerId,
          notificationFor: input.followingId!,
          type: "FOLLOW",
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
        await ctx.supabase
          .from("followership")
          .delete()
          .eq("follower_id", input.followerId)
          .eq("following_id", input.followingId!);

        await ctx.supabase
          .from("notifications")
          .delete()
          .eq("notificationFrom", input.followerId)
          .eq("notificationFor", input.followingId!)
          .eq("type", "FOLLOW");
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

      async function getFollowers() {
        if (input.type === "followers") {
          const { data } = await ctx.supabase
            .from("followership")
            .select(`*, follower_id:user ( * ), following_id:user ( * ) `)
            .eq("following_id", input.userId)
            .order("id", { ascending: true })
            .limit(limit + 1);

          return data;
        } else {
          const { data } = await ctx.supabase
            .from("followership")
            .select(`*, follower_id:user ( * ), following_id:user ( * ) `)
            .eq("follower_id", input.userId)
            .order("id", { ascending: true })
            .limit(limit + 1);

          return data;
        }
      }

      const followers = await getFollowers();

      let nextCursor;

      if (followers) {
        if (followers.length > limit) {
          const nextItem = followers.pop(); // return the last item from the array
          nextCursor = nextItem?.id;
        }

        return {
          followers,
          nextCursor,
        };
      }
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

      const { data: searchedUsers } = await ctx.supabase
        .from("user")
        .select()
        .ilike("username", `${input.searchValue}%`)
        .gt("countId", input.cursor ?? 0)
        .limit(limit + 1);

      let nextCursor;

      if (searchedUsers) {
        if (searchedUsers.length > limit) {
          const nextItem = searchedUsers.pop(); // return the last item from the array
          nextCursor = nextItem?.countId;
        }

        return {
          searchedUsers,
          nextCursor,
        };
      }
    }),
  uploadCover: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("user")
        .update({
          coverPhoto: input.image,
        })
        .eq("id", input.userId);

      return {
        success: true,
      };
    }),
  uploadProfile: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("user")
        .update({
          image: input.image,
        })
        .eq("id", input.userId);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return true
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
        if (input.deleteFrom === "cover") {
          await ctx.supabase
            .from("user")
            .update({
              coverPhoto: null,
            })
            .eq("id", input.userId);
        } else {
          await ctx.supabase
            .from("user")
            .update({
              image: undefined,
            })
            .eq("id", input.userId);
        }

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
      if (input.userData.bio !== input.newData.bio) {
        await ctx.supabase
          .from("user")
          .update({
            bio: input.newData.bio,
          })
          .eq("id", input.id);
      }

      if (input.userData.gender !== input.newData.gender) {
        await ctx.supabase
          .from("user")
          .update({
            gender: input.newData.gender,
          })
          .eq("id", input.id);
      }

      if (input.userData.website !== input.newData.website) {
        await ctx.supabase
          .from("user")
          .update({
            website: input.newData.website,
          })
          .eq("id", input.id);
      }

      return {
        success: true,
      };
    }),
  postFollowing: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: userFollowing } = await ctx.supabase
        .from("followership")
        .select()
        .eq("follower_id", input.userId);

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
      const durationType = input.durationType;
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

      await ctx.supabase.from("bans").insert({
        userId: input.userId,
        reason: input.reason,
        duration: duration.toISOString(), // Convert duration to string
      });
      return {
        success: true,
      };
    }),
  getBannedUser: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("bans")
        .select()
        .eq("userId", input.userId)
        .single();

      return {
        bannedUser: data,
      };
    }),
});

export type UserRouter = typeof userRouter;
