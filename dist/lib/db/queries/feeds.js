/*
 * TODO: scrapeFeeds
  * It should:
  * Get the next feed to fetch from the DB.
  * Mark it as fetched.
  * Fetch the feed using the URL (we already wrote this function)
  * Iterate over the items in the feed and print their titles to the console.
 */
import { db } from "../index.js";
import { feeds, users } from "../schema.js";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
export async function createFeed(name, url, userId) {
    const [inserted] = await db.insert(feeds).values({ name, url, user_id: userId }).returning();
    return inserted;
}
export async function getFeeds() {
    const feedsWithUsers = await db
        .select({
        feed: feeds,
        user: users,
    })
        .from(feeds)
        .innerJoin(users, eq(feeds.user_id, users.id));
    return feedsWithUsers.map(({ feed, user }) => ({
        feed,
        user,
    }));
}
export async function getFeedByURL(url) {
    const feed = await db
        .select()
        .from(feeds)
        .where(eq(feeds.url, url))
        .limit(1);
    return feed.length > 0 ? feed[0] : undefined;
}
export async function getNextFeedToFetch() {
    const feed = await db
        .select()
        .from(feeds)
        .orderBy(sql `${feeds.last_fetched_at} ASC NULLS FIRST`)
        .limit(1);
    return feed.length > 0 ? feed[0] : undefined;
}
export async function markFeedFetched(feedId) {
    await db
        .update(feeds)
        .set({ last_fetched_at: new Date() })
        .where(eq(feeds.id, feedId));
}
