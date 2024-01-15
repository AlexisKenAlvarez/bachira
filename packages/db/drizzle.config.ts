
import type { Config } from "drizzle-kit";

// import { env } from "@/env.mjs";
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

export default {
  schema: "./schema/*",
  out: "./migrations",
  driver: "mysql2",

  dbCredentials: {
    uri: process.env.DATABASE_URL!,
  },
  tablesFilter: ["bachira_*"],
} satisfies Config;
