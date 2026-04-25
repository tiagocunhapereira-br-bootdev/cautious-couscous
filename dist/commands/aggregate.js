import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds.js";
import { fetchFeed } from "../lib/rss.js";
export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        console.log("No feeds to fetch");
        return;
    }
    await markFeedFetched(feed.id);
    const fetchedFeed = await fetchFeed(feed.url);
    fetchedFeed.channel.item.forEach((item) => {
        console.log(item.title);
    });
}
