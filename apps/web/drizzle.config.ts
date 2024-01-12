import { type Config } from "drizzle-kit";

// import { env } from "@/env.mjs";
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

export default {
  schema: "./src/server/db/schema/*",
  out: "./src/server/db/migrations",
  driver: "mysql2",

  dbCredentials: {
    connectionString: process.env.DATABASE_URL as string,
  },
  tablesFilter: ["bachira_*"],
} satisfies Config;
