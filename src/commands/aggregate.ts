import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds.js";
import { fetchFeed } from "../lib/rss.js";
import { createPost } from "../lib/db/queries/posts.js";

export async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds to fetch");
    return;
  }

  await markFeedFetched(feed.id);

  let fetchedFeed;
  try {
    fetchedFeed = await fetchFeed(feed.url);
  } catch (error) {
    console.error(`Failed to fetch feed "${feed.name}" (${feed.url}): ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  for (const item of fetchedFeed.channel.item || []) {
    // Parse pubDate safely; if missing or invalid, use null
    let publishedAt: Date | null = null;
    if (item.pubDate) {
      const date = new Date(item.pubDate);
      publishedAt = isNaN(date.getTime()) ? null : date;
    }

    const post = {
      title: item.title || null,
      url: item.link,
      description: item.description || null,
      publishedAt,
      feedId: feed.id,
    };

    await createPost(post);
  }
}