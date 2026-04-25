import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastFetchedAt: timestamp("last_fetched_at"), // Just not adding .notNull() makes it nullable
});

export const feedFollows = pgTable("feed_follows", {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    feedId: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
}, (table) => ({
    userFeedUnique: unique().on(table.userId, table.feedId),
}));

export const posts = pgTable("posts", {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    title: text("title"), // Some RSS items might not have a title, so I'm making this nullable
    url: text("url").notNull().unique(),
    description: text("description"), // Some RSS items might not have a description, so I'm making this nullable
    publishedAt: timestamp("published_at"), // Some RSS items might not have a parseable published_at, so I'm making this nullable
    feedId: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
});

// Update: Fixed mixed camelCase + snake_case and fixed snake_case to camelCase for posts.ts.
// Selected camelCase for the TypeScript side and snake_case for the database side, which is a common convention. This means that in the database, the columns will be created_at, updated_at, published_at, etc., but in the TypeScript code, we can use createdAt, updatedAt, publishedAt, etc. This is achieved by specifying the column names in the pgTable definitions.