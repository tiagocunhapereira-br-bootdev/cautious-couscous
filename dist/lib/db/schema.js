// Add a nullable last_fetched_at column to the feeds table to track when a feed was last fetched.
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
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    last_fetched_at: timestamp("last_fetched_at"), // Just not adding .notNull() makes it nullable
});
export const feedFollows = pgTable("feed_follows", {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    feed_id: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
}, (table) => ({
    userFeedUnique: unique().on(table.user_id, table.feed_id),
}));
