import { drizzle } from "drizzle-orm/postgres-js";
import * as postgres from "postgres";
import * as schema from "./schema.js";
import { readConfig } from "../../config.js";
const config = readConfig();
const conn = postgres.default(config.dbUrl);
export const db = drizzle(conn, { schema });
