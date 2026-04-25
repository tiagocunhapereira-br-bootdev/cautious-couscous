// Follow the TODO from schema.ts

import { eq, desc } from "drizzle-orm";
import { db } from "../index.js";
import { feedFollows, posts } from "../schema.js";

export async function createPost(post: {
    title: string | null;
    url: string;
    description: string | null;
    publishedAt: Date | null;
    feedId: string;
}) {
    const result = await db
        .insert(posts)
        .values(post)
        .onConflictDoNothing({ target: posts.url })
        .returning();
    
    if (result.length > 0) {
        return result[0];
    }
    
    // If insert was skipped due to conflict, fetch the existing post
    const existing = await db.select().from(posts).where(eq(posts.url, post.url)).limit(1);
    return existing[0];
}

export async function getPostsForUser(userId: string, limit: number = 2) {
    const rows = await db
        .select()
        .from(posts)
        .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
        .where(eq(feedFollows.userId, userId))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
    return rows;
}
/*
    Hey, that isn't in the TODO!
export async function resetPosts() {
    await db.delete(posts);
}
    We already have a reset function in src/index.ts!
*/