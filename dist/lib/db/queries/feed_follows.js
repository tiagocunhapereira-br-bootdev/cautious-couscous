/*
TODO:
Create feed follow database queries for this Boot.dev lesson.

Requirements:
- Import db from "...js"
- Import feedFollows, feeds, and users from "../schema.js"
- Import eq and and from "drizzle-orm" if needed

Implement exactly one async function for now:

1. createFeedFollow(userId: string, feedId: string)
- Insert a new row into the feedFollows table with:
  - user_id = userId
  - feed_id = feedId
- Use .returning() and get the first inserted row
- Then run a SELECT query that returns:
  - all feed follow fields
  - the joined feed name
  - the joined user name
- Join:
  - feedFollows.feed_id to feeds.id
  - feedFollows.user_id to users.id
- Return the joined result for the newly created feed follow

Important:
- Do not use raw SQL
- Do not add extra functions yet
- Return a single joined record, not an array
*/
/*
ALSO THE TODO:
Add a query to get all feed follows for a given user.

Requirements:
- Implement:
  getFeedFollowsForUser(userId: string)

Behavior:
- Query the feedFollows table
- Join to feeds and users
- Filter so only follows for the given userId are returned
- Return enough data to print:
  - feed follow fields if desired
  - feed name
  - user name

Join rules:
- feedFollows.feed_id -> feeds.id
- feedFollows.user_id -> users.id

Important:
- Use Drizzle ORM
- Do not use raw SQL
- Return an array
- Do not remove createFeedFollow
*/
import { db } from "../index.js";
import { feedFollows, feeds, users } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createFeedFollow(userId, feedId) {
    const [inserted] = await db
        .insert(feedFollows)
        .values({ user_id: userId, feed_id: feedId })
        .returning();
    const joined = await db
        .select({
        feedFollow: feedFollows,
        feed: feeds,
        user: users,
    })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
        .innerJoin(users, eq(feedFollows.user_id, users.id))
        .where(eq(feedFollows.id, inserted.id))
        .limit(1);
    return joined[0];
}
export async function getFeedFollowsForUser(userId) {
    const joined = await db
        .select({
        feedFollow: feedFollows,
        feed: feeds,
        user: users,
    })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
        .innerJoin(users, eq(feedFollows.user_id, users.id))
        .where(eq(feedFollows.user_id, userId));
    return joined;
}
