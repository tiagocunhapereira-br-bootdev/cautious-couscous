/*
TODO:
Create the Drizzle config for PostgreSQL migrations.

Requirements:
- Import defineConfig from "drizzle-kit"
- Import readConfig from the config file
- Read the database URL from readConfig().dbUrl
- Export default defineConfig({...})

The config object must include:
- schema: the path to the schema.ts file
- out: a path for generated migration files
- dialect: "postgresql"
- dbCredentials: { url: <db url from config> }

Important:
- Do not hard-code the database URL if readConfig() is available
- Use the actual relative path to schema.ts in this project
- Use a sensible output folder for generated migration files
*/

import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config.js";

export default defineConfig({
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: readConfig().dbUrl,
    },
});