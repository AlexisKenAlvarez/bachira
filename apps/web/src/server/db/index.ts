import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "@/env.mjs";
import * as schema1 from "./schema/schema";
import * as schema2 from "./schema/relations";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema: {...schema1, ...schema2} }
);
