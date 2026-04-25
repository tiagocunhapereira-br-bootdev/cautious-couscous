/*
 * TODO: scrapeFeeds
  * It should:
  * Get the next feed to fetch from the DB.
  * Mark it as fetched.
  * Fetch the feed using the URL (we already wrote this function)
  * Iterate over the items in the feed and print their titles to the console.
 */

import { fetchFeed } from "../../rss.js";
import { db } from "../index.js";
import { feeds, users } from "../schema.js";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export async function createFeed(name: string, url: string, userId: string) {
    const [inserted] = await db.insert(feeds).values({ name, url, userId }).returning();
    return inserted;
}

export async function getFeeds(): Promise<{ feed: Feed; user: User }[]> {
  const feedsWithUsers = await db
    .select({
      feed: feeds,
      user: users,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));

  return feedsWithUsers.map(({ feed, user }) => ({
    feed,
    user,
  }));
}

export async function getFeedByURL(url: string): Promise<Feed | undefined> {
  const feed = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url))
    .limit(1);

  return feed.length > 0 ? feed[0] : undefined;
}

export async function getNextFeedToFetch(): Promise<Feed | undefined> {
  const feed = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);
  return feed.length > 0 ? feed[0] : undefined;
}

export async function markFeedFetched(feedId: string): Promise<void> {
  await db
    .update(feeds)
    .set({ lastFetchedAt: new Date() })
    .where(eq(feeds.id, feedId));
}



