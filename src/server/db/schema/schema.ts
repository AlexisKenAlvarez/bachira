// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration


import { sql } from "drizzle-orm";
import {
  index,
  int,
  mysqlEnum,
  mysqlTableCreator,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `gchat_${name}`);

const NOTIFICATION_TYPE = ["FOLLOW", "LIKE", "COMMENT", "REPLY"] as const;
const NOTIFICATION_STATUS = ["READ", "UNREAD"] as const;

const updatedAt = timestamp("updatedAt")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`)
  .onUpdateNow();

const createdAt = timestamp("createdAt")
.default(sql`CURRENT_TIMESTAMP`)
.notNull()

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  bio: varchar("bio", { length: 100 }),
  username: varchar("username", { length: 50 }),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  created_at: createdAt,
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).defaultNow(),
  image: varchar("image", { length: 255 }),
  updatedAt,
});

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
  notificationFor: varchar("userId", { length: 100 }).notNull(),
  notificationFrom: varchar("notificationFrom", { length: 100 }).notNull(),
  type: mysqlEnum("type", NOTIFICATION_TYPE).notNull(),
  status: mysqlEnum("status", NOTIFICATION_STATUS).default("UNREAD")
});
