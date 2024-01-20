import { relations } from "drizzle-orm";
import { followership, notification, users, postComments, postLikes, posts, postReports, userReports } from "./schema";

export const postRelations = relations(posts, ({many, one}) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
    relationName: "user_posts",
  }),
  comments: many(postComments, { relationName: "postComments" }),
  likes: many(postLikes, { relationName: "postLikes" }),

}))

export const postReportRelations = relations(postReports, ({ one }) => ({
  post: one(posts, {
    fields: [postReports.postId],
    references: [posts.id],
    relationName: "postReports",
  })
}))

export const userReportRelations = relations(userReports, ({ one }) => ({
  user: one(users, {
    fields: [userReports.userId],
    references: [users.id],
    relationName: "userReports",
  })
}))

export const postCommentRelations = relations(postComments, ({ one }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
    relationName: "postComments",
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
    relationName: "user_postComments",
  }),
}))

export const postLikeRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
    relationName: "postLikes",
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
    relationName: "user_postLikes",
  }),
}))

export const userRelations = relations(users, ({ many }) => ({
  follower: many(followership, { relationName: "user_follower" }),
  following: many(followership, { relationName: "user_following" }),
  notificationFor: many(notification, { relationName: "user_notificationFor" }),
  notificationFrom: many(notification, {
    relationName: "user_notificationFrom",
  }),
  posts: many(posts, { relationName: "user_posts" }),
  postComments: many(postComments, { relationName: "user_postComments" }),
  postLikes: many(postLikes, { relationName: "user_postLikes" })
}));

export const followRelations = relations(followership, ({ one }) => ({
  following: one(users, {
    fields: [followership.following_id],
    references: [users.id],
    relationName: "user_following",
  }),
  follower: one(users, {
    fields: [followership.follower_id],
    references: [users.id],
    relationName: "user_follower",
  }),
}));

export const notificationRelationship = relations(notification, ({ one }) => ({
  notificationFor: one(users, {
    fields: [notification.notificationFor],
    references: [users.id],
    relationName: "user_notificationFor",
  }),
  notificationFrom: one(users, {
    fields: [notification.notificationFrom],
    references: [users.id],
    relationName: "user_notificationFrom",
  }),
}));
