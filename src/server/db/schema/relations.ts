import { relations } from "drizzle-orm";
import { followership, notification, users } from "./schema";

export const userRelations = relations(users, ({ many }) => ({
  follower: many(followership, { relationName: "user_follower" }),
  following: many(followership, { relationName: "user_following" }),
  notificationFor: many(notification, { relationName: "user_notificationFor" }),
  notificationFrom: many(notification, {
    relationName: "user_notificationFrom",
  }),
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
