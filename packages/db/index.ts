import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as schema1 from './schema/schema'
import * as schema2 from './schema/relations'

const connection = connect({ url: process.env.DATABASE_URL });

export const db = drizzle(connection, { schema: {...schema1, ...schema2} });

export * from "drizzle-orm";