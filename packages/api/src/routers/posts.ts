/* eslint-disable @typescript-eslint/no-misused-promises */
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { POST_REPORT_TYPE } from "@bachira/db/schema/schema";

import { pusherServer, toPusherKey } from "../../lib/pusher";
import { FollowershipSchema } from "../../lib/zodSchema";
import { createTRPCRouter, privateProcedure } from "../trpc";

// import { sql } from "@bachira/db";
// import {
//   notification,
//   POST_REPORT_TYPE,
//   postComments,
//   postLikes,
//   postReports,
//   posts,
// } from "@bachira/db/schema/schema";

// import { pusherServer, toPusherKey } from "../../lib/pusher";
// import { FollowershipSchema } from "../../lib/zodSchema";
// import { createTRPCRouter, privateProcedure } from "../trpc";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(6, "10 s"),
});

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        text: z.string(),
        privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
        toMention: z
          .array(
            z.object({
              username: z.string(),
              id: z.string(),
              image: z.string(),
            }),
          )
          .nullable(),
        authorImage: z.string().nullish(),
        username: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: postData } = await ctx.supabase
        .from("posts")
        .insert({
          author: input.userId,
          text: input.text,
          privacy: input.privacy,
        })
        .select("id");

      if (input.toMention && postData) {
        input.toMention.forEach(async (toMentionUser) => {
          const { data: user } = await ctx.supabase
            .from("user")
            .select("*")
            .eq("username", toMentionUser.username)
            .single();

          if (user?.id !== input.userId) {
            await ctx.supabase.from("notifications").insert({
              notificationFrom: input.userId,
              notificationFor: toMentionUser.id,
              postId: postData[0]?.id,
              type: "MENTION_POST",
            });

            await pusherServer.trigger(
              toPusherKey(`user:${user?.id}:incoming_notification`),
              "incoming_notification",
              {
                notificationFrom: input.username,
                type: "MENTION_POST",
                image: input.authorImage,
                postId: postData[0]?.id,
              },
            );
          }
        });
      }
    }),
  editPost: privateProcedure
    .input(
      z.object({
        originalPost: z.object({
          postId: z.number(),
          postText: z.string(),
          privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
          author: z.string(),
        }),
        editedPost: z.object({
          postText: z.string(),
          privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.originalPost.postText !== input.editedPost.postText) {
        await ctx.supabase
          .from("posts")
          .update({
            text: input.editedPost.postText,
          })
          .eq("id", input.originalPost.postId);
      } else {
        await ctx.supabase
          .from("posts")
          .update({
            privacy: input.editedPost.privacy,
          })
          .eq("id", input.originalPost.postId);
      }

      return {
        success: true,
      };
    }),
  getPosts: privateProcedure
    .input(
      z.object({
        postId: z.number().nullish(),
        userId: z.string(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;

      async function getPostData() {
        if (input.postId) {
          const { data } = await ctx.supabase
            .from("posts")
            .select(
              `*, author:user ( * ), likes:postLikes ( postId, user ( id, username ) )`,
            )
            .eq("id", input.postId)
            .eq("isDeleted", false)
            .order("id", { ascending: false })
            .limit(limit + 1);

          return data;
        }

        if (input.cursor) {

          const { data } = await ctx.supabase
            .from("posts")
            .select(
              `*, author:user ( * ), likes:postLikes ( postId, user ( id, username ) )`,
            )

            .lt("id", input.cursor)
            .eq("isDeleted", false)
            .order("id", { ascending: false })
            .limit(limit + 1);

          return data;
        } else {
          console.log("SA ELSE");
          const { data } = await ctx.supabase
            .from("posts")
            .select(
              `*, author:user ( * ), likes:postLikes ( postId, user ( id, username ) )`,
            )

            .gt("id", input.cursor ?? 0)
            // .eq("isDeleted", false)
            .order("id", { ascending: false })
            .limit(limit + 1);
          return data;
        }
      }

      const postData = (await getPostData()) ?? [];


      if (postData.length === 0 && input.postId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { data: userFollowing } = await ctx.supabase
        .from("followership")
        .select("*")
        .eq("follower_id", input.userId);

      const { data: postReports } = await ctx.supabase
        .from("postReports")
        .select("*")
        .eq("reportedById", input.userId);

      let nextCursor;

      const newData: typeof postData = postData.filter((post) => {
        if (postReports?.some((report) => report.postId === post.id)) {
          return false;
        }

        if (post.privacy === "FOLLOWERS") {
          if (
            userFollowing?.some((user) => user.following_id === post.author.id)
          ) {
            return post;
          } else if (post.author.id === input.userId) {
            return post;
          }
        } else if (post.privacy === "PRIVATE") {
          if (post.author.id === input.userId) {
            return post;
          }
        } else {
          return post;
        }
      });

      if (postData.length > limit) {
        const nextItem = postData.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        postData: newData,
        userFollowing,
        nextCursor,
      };
    }),
  likePost: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        authorId: z.string(),
        postId: z.number(),
        action: z.enum(["LIKE", "UNLIKE"]),
        username: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await rateLimiter.limit(ctx.user.id);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      if (input.action === "LIKE") {
        await ctx.supabase.from("postLikes").insert({
          user: input.userId,
          postId: input.postId,
        });

        if (input.userId !== input.authorId) {
          await ctx.supabase.from("notifications").insert({
            notificationFor: input.authorId,
            notificationFrom: input.userId,
            postId: input.postId,
            type: "LIKE_POST",
          });

          await pusherServer.trigger(
            toPusherKey(`user:${input.authorId}:incoming_notification`),
            "incoming_notification",
            {
              notificationFrom: input.username,
              type: "LIKE_POST",
              image: input.image,
              postId: input.postId,
            },
          );
        }
      } else {
        await ctx.supabase
          .from("postLikes")
          .delete()
          .eq("userId", input.userId)
          .eq("postId", input.postId);

        if (input.userId !== input.authorId) {
          await ctx.supabase
            .from("notifications")
            .delete()
            .eq("notificationFrom", input.userId)
            .eq("notificationFor", input.authorId)
            .eq("type", "LIKE_POST");
        }
      }
    }),

  addComment: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        postId: z.number(),
        text: z.string(),
        username: z.string(),
        image: z.string(),
        authorId: z.string(),
        toMention: z
          .array(
            z.object({
              username: z.string(),
              id: z.string(),
              image: z.string(),
            }),
          )
          .nullable(),
        userFollowing: z.array(FollowershipSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { toMention } = input;
      let notifyAuthor = true;

      await ctx.supabase.from("postComments").insert({
        user: input.userId,
        postId: input.postId,
        text: input.text,
      });

      const { data: postPrivacy } = await ctx.supabase
        .from("posts")
        .select("comment_privacy")
        .eq("id", input.postId)
        .single();

      if (
        postPrivacy?.comment_privacy === "FOLLOWERS" &&
        input.userFollowing.some(
          (user) => user.following_id !== input.authorId,
        ) === false
      ) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      } else if (
        postPrivacy?.comment_privacy === "PRIVATE" &&
        input.authorId !== input.userId
      ) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      }

      if (toMention) {
        toMention.forEach(async (value) => {
          if (value.id === input.authorId) {
            notifyAuthor = false;
          }

          const user = await ctx.supabase
            .from("user")
            .select("*")
            .eq("username", value.username)
            .single();

          if (user) {
            await ctx.supabase.from("notifications").insert({
              notificationFor: value.id,
              notificationFrom: input.userId,
              postId: input.postId,
              type: "MENTION_COMMENT",
            });

            await pusherServer.trigger(
              toPusherKey(`user:${value.id}:incoming_notification`),
              "incoming_notification",
              {
                notificationFrom: input.username,
                type: "MENTION_COMMENT",
                image: value.image,
                postId: input.postId,
              },
            );
          }
        });
      }

      if (notifyAuthor && input.authorId !== input.userId) {
        await ctx.supabase.from("notifications").insert({
          notificationFrom: input.userId,
          notificationFor: input.authorId,
          postId: input.postId,
          type: "COMMENT",
        });

        await pusherServer.trigger(
          toPusherKey(`user:${input.authorId}:incoming_notification`),
          "incoming_notification",
          {
            notificationFrom: input.username,
            type: "COMMENT",
            image: input.image,
            postId: input.postId,
          },
        );
      }

      return {
        success: true,
      };
    }),
  deleteComment: privateProcedure
    .input(
      z.object({
        commentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;

      await ctx.supabase.from("postComments").delete().eq("id", commentId);
    }),
  getComments: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        singlePage: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;

      async function getCommentData() {
        if (input.singlePage) {
          const { data } = await ctx.supabase
            .from("postComments")
            .select(`*, user ( * )`)
            .eq("postId", input.postId)
            .gt("id", input.cursor ?? 0)
            .order("id", { ascending: true })
            .limit(limit + 1);

          return data;
        }

        const { data } = await ctx.supabase
          .from("postComments")
          .select(`*, user ( * )`)
          .eq("postId", input.postId)
          .gt("id", input.cursor ?? 0)
          .order("id", { ascending: false })
          .limit(limit + 1);

        return data;
      }

      const comData = await getCommentData();

      let nextCursor;

      if (comData!.length > limit) {
        let nextItem;

        for (let i = 0; i < comData!.length; i++) {
          if (i === comData!.length - 1) {
            nextItem = comData![i];
          }
        }

        nextCursor = nextItem?.id;
      }

      return {
        commentData: comData!,
        nextCursor,
      };
    }),
  getLikes: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().min(1).max(10).nullish(),
        cursor: z.number().nullish(),
        offset: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;


      async function getLikeData() {
        if (input.cursor) {
          const { data } = await ctx.supabase
            .from("postLikes")
            .select(`*, user ( * )`)
            .lt("id", input.cursor)
            .eq("postId", input.postId)
            .order("id", { ascending: false })
            .limit(limit + 1);

          return data;
        }

        const { data } = await ctx.supabase
          .from("postLikes")
          .select(`*, user ( * )`)
          .gt("id", input.cursor ?? 0)
          .eq("postId", input.postId)
          .order("id", { ascending: false })
          .limit(limit + 1);

        return data;
      }

      const likeData = await getLikeData();

      let nextCursor;

      if (likeData!.length > limit) {
        const nextItem = likeData!.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      return {
        likeData,
        nextCursor,
      };
    }),
  deletePost: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        fromReport: z.boolean().nullish(),
        ban: z.boolean().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase.from("posts").delete().eq("id", input.postId);
      await ctx.supabase.from("postLikes").delete().eq("postId", input.postId);
      await ctx.supabase
        .from("postComments")
        .delete()
        .eq("postId", input.postId);
      await ctx.supabase
        .from("notifications")
        .delete()
        .eq("postId", input.postId);

      return {
        success: true,
      };
    }),
  adminAction: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        ban: z.boolean().nullish(),
        type: z.enum(["DELETE", "DISMISS"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === "DELETE") {
        await ctx.supabase
          .from("posts")
          .update({
            isDeleted: true,
          })
          .eq("id", input.postId);

        await ctx.supabase
          .from("notifications")
          .delete()
          .eq("postId", input.postId);
      }

      await ctx.supabase
        .from("postReports")
        .update({
          status: "RESOLVED",
        })
        .eq("postId", input.postId);

      return {
        success: true,
      };
    }),
  editCommentPrivacy: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        privacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("posts")
        .update({
          comment_privacy: input.privacy,
        })
        .eq("id", input.postId);

      if (error) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
      }
    }),

  reportPost: privateProcedure
    .input(
      z.object({
        postId: z.number(),
        userId: z.string(),
        type: z.enum([...POST_REPORT_TYPE]).nullish(),
        reportedById: z.string(),
        action: z.enum(["REPORT", "UNDO"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.action === "REPORT") {
        await ctx.supabase.from("postReports").insert({
          postId: input.postId,
          userId: input.userId,
          reportedById: input.reportedById,
          report_type: input.type!,
        });
      } else {
        await ctx.supabase
          .from("postReports")
          .delete()
          .eq("postId", input.postId)
          .eq("reportedById", input.reportedById);
      }

      return {
        action: input.action,
      };
    }),

  getReports: privateProcedure
    .input(
      z.object({
        offset: z.number().nullish(),
        limit: z.number().nullish(),
        status: z.string().nullish(),
        reason: z.enum([...POST_REPORT_TYPE]).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = input.offset ?? 0;
      const status = (input.status as "PENDING" | "RESOLVED") ?? "PENDING";

      async function getPostReports() {
        if (input.reason && input.status) {
          const { data } = await ctx.supabase
            .from("postReports")
            .select(
              `*, 
        user ( username ),
        posts ( text )
        `,
            )
            .eq("report_type", input.reason)
            .eq("status", status)
            .range(
              offset - 1 < 0 ? 0 : offset - 1,
              input.limit ? input.limit + offset : 7,
            );

          return data;
        } else if (input.reason) {
          const { data } = await ctx.supabase
            .from("postReports")
            .select(
              `*, 
        user ( username ),
        posts ( text )
        `,
            )
            .eq("report_type", input.reason)
            .range(
              offset - 1 < 0 ? 0 : offset - 1,
              input.limit ? input.limit + offset : 7,
            );
          return data;
        } else if (input.status) {
          const { data } = await ctx.supabase
            .from("postReports")
            .select(
              `*, 
      user ( username ),
      posts ( text )
      `,
            )
            .eq("status", input.status)
            .range(
              offset - 1 < 0 ? 0 : offset - 1,
              input.limit ? input.limit + offset : 7,
            );
          return data;
        }
      }

      const data = await getPostReports();

      return {
        reportData: data,
      };
    }),
  countReports: privateProcedure
    .input(
      z.object({
        status: z.string().nullish(),
        reason: z.enum([...POST_REPORT_TYPE]).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const status = (input.status as "PENDING" | "RESOLVED") ?? "PENDING";

      async function getPostCount() {
        if (input.reason && input.status) {
          const { count } = await ctx.supabase
            .from("postReports")
            .select("*", { count: "exact", head: true })
            .eq("status", status)
            .eq("report_type", input.reason);

          return count;
        }

        if (input.reason) {
          const { count } = await ctx.supabase
            .from("postReports")
            .select("*", { count: "exact", head: true })
            .eq("report_type", input.reason);
          return count;
        }

        if (input.status) {
          const { count } = await ctx.supabase
            .from("postReports")
            .select("*", { count: "exact", head: true })
            .eq("status", status);

          return count;
        }
      }

      const count = await getPostCount();

      return count;
    }),
});
export type PostRouter = typeof postRouter;
