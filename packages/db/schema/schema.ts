// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `bachira_${name}`);

export const NOTIFICATION_TYPE = [
  "FOLLOW",
  "LIKE_POST",
  "LIKE_COMMENT",
  "LIKE_REPLY",
  "MENTION_POST",
  "MENTION_COMMENT",
  "COMMENT",
  "REPLY",
] as const;

export const POST_REPORT_TYPE = [
  "SEXUAL_CONTENT",
  "HATEFUL_CONTENT",
  "VIOLENT_CONTENT",
  "SPAM",
  "CHILD_ABUSE",
] as const;

export const USER_REPORT_TYPE = [
  "HATE_SPEECH",
  "SEXUAL_CONTENT",
  "VIOLENT_CONTENT",
  "HARASSMENT",
  "PRETENDING_TO_BE_SOMEONE",
] as const;

export const NOTIFICATION_STATUS = ["READ", "UNREAD"] as const;
export const GENDER = ["MALE", "FEMALE", "IDK"] as const;
export const PRIVACY = ["PUBLIC", "FOLLOWERS", "PRIVATE"] as const;

const updatedAt = timestamp("updatedAt", { mode: "date" })
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`)
  .onUpdateNow();

const createdAt = timestamp("createdAt", { mode: "date" })
  .default(sql`CURRENT_TIMESTAMP`)
  .notNull();

export const users = mysqlTable(
  "user",
  {
    countId: int("countId").notNull().autoincrement().primaryKey(),
    id: varchar("id", { length: 255 }).notNull(),
    bio: varchar("bio", { length: 160 }).default(""),
    coverPhoto: varchar("coverPhoto", { length: 255 }),
    username: varchar("username", { length: 50 }),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    website: varchar("website", { length: 255 }).default(""),
    gender: mysqlEnum("gender", GENDER).default("IDK"),
    created_at: createdAt,
    emailVerified: timestamp("emailVerified", {
      mode: "date",
      fsp: 3,
    }).defaultNow(),
    image: varchar("image", { length: 255 }),
    updatedAt,
  },
  (table) => {
    return {
      id: index("userid").on(table.id),
    };
  },
);

export const followership = mysqlTable(
  "followership",
  {
    id: int("id").primaryKey().notNull().autoincrement(),
    follower_id: varchar("follower_id", { length: 256 }).notNull(),
    following_id: varchar("following_id", { length: 256 }).notNull(),
  },
  (table) => {
    return {
      followerIdx: index("follower_idx").on(table.follower_id),
      followingIdx: index("following_idx").on(table.following_id),
    };
  },
);

export const notification = mysqlTable("notifications", {
  id: int("id").primaryKey().notNull().autoincrement(),
  notificationFor: varchar("notificationFor", { length: 100 }).notNull(),
  notificationFrom: varchar("notificationFrom", { length: 100 }).notNull(),
  type: mysqlEnum("type", NOTIFICATION_TYPE).notNull(),
  postId: int("postId"),
  status: mysqlEnum("status", NOTIFICATION_STATUS).default("UNREAD"),
  seen: boolean("seen").default(false),
  createdAt,
});

export const posts = mysqlTable("posts", {
  id: int("id").primaryKey().notNull().autoincrement(),
  userId: varchar("userId", { length: 100 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt,
  updatedAt,
  privacy: mysqlEnum("privacy", PRIVACY).default("PUBLIC"),
  commentPrivacy: mysqlEnum("commentPrivacy", PRIVACY).default("PUBLIC"),
});

export const postComments = mysqlTable(
  "postComments",
  {
    id: int("id").primaryKey().notNull().autoincrement(),
    postId: int("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 100 }).notNull(),
    text: text("text").notNull(),
  },
  (table) => {
    return {
      followerIdx: index("comments_post_idx").on(table.postId),
    };
  },
);

export const postLikes = mysqlTable(
  "postLikes",
  {
    id: int("id").primaryKey().notNull().autoincrement(),
    postId: int("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: varchar("userId", { length: 100 }).notNull(),
  },
  (table) => {
    return {
      followerIdx: index("likes_post_idx").on(table.postId),
    };
  },
);

export const postReports = mysqlTable("postReports", {
  id: int("id").primaryKey().notNull().autoincrement(),
  userId: varchar("userId", { length: 255 }).notNull(),
  postId: int("postId").notNull(),
  reportType: mysqlEnum("reportType", POST_REPORT_TYPE).notNull(),
  status: mysqlEnum("status", ["PENDING", "RESOLVED"]).default("PENDING"),
});

export const userReports = mysqlTable("userReports", {
  id: int("id").primaryKey().notNull().autoincrement(),
  userId: varchar("userId", { length: 255 }).notNull(),
  reportType: mysqlEnum("reportType", USER_REPORT_TYPE).notNull(),
  status: mysqlEnum("status", ["PENDING", "RESOLVED"]).default("PENDING"),
});

export type User = typeof users.$inferSelect;
export type Followership = typeof followership.$inferSelect;
export type Notification = typeof notification.$inferSelect;
export type Post = typeof posts.$inferSelect;
