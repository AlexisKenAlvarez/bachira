// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  mysqlTableCreator,
  timestamp,
  varchar,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `gchat_${name}`);

const NOTIFICATION_TYPE = ["FOLLOW", "LIKE", "COMMENT", "REPLY"] as const;

const updated_at = timestamp("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`)
  .onUpdateNow();

export const users = mysqlTable("users", {
  id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),
  username: varchar("username", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 254 }).notNull(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  created_at: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  updated_at,
});

export const followership = mysqlTable("followership", {
  id: int("id").primaryKey().notNull().autoincrement(),
  follower_id: varchar("follower_id", { length: 256 }).notNull(),
  following_id: varchar("following_id", { length: 256 }).notNull(),
});

export const notification = mysqlTable("notifications", {
  id: int("id").primaryKey().notNull().autoincrement(),
  notificationFor: varchar("userId", { length: 100 }).notNull(),
  notificationFrom: varchar("notificationFrom", { length: 100 }).notNull(),
  type: mysqlEnum("type", NOTIFICATION_TYPE).notNull(),
});
