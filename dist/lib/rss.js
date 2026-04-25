import { XMLParser } from 'fast-xml-parser';
export async function fetchFeed(feedURL) {
    const response = await fetch(feedURL, {
        headers: {
            'User-Agent': 'gator',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch feed');
    }
    const text = await response.text();
    const parsedFeed = parseFeed(text);
    validateFeed(parsedFeed);
    return parsedFeed;
}
export function parseFeed(text) {
    const options = {
        ignoreNameSpace: true,
        ignoreAttribute: false,
        allowBooleanAttributes: false,
        parseTagValue: true,
        parseAttributeValue: true,
        trimValues: true,
        stopAtFirstTagMismatch: true,
    };
    const parser = new XMLParser();
    const raw = parser.parse(text);
    // Extract the channel from raw.rss.channel
    const channel = raw.rss?.channel;
    // Validate that raw.rss.channel exists
    if (!channel) {
        throw new Error('Invalid feed format');
    }
    // Validate that title, link, and description are strings
    if (typeof channel.title !== 'string' || typeof channel.link !== 'string' || typeof channel.description !== 'string') {
        throw new Error('Invalid feed format');
    }
    // Normalize raw.rss.channel.item into an array
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    // Build a new array of valid RSSItem objects
    const validItems = items.map((item) => {
        if (!item.title || !item.link || !item.description || !item.pubDate) {
            return null;
        }
        return {
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        };
    }).filter((item) => item !== null);
    // Return a brand-new RSSFeed object shaped like
    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: validItems,
        },
    };
}
export function validateFeed(feed) {
    if (!feed.channel) {
        throw new Error('Feed is missing channel');
    }
    const { channel } = feed;
    if (!channel.title || !channel.link || !channel.description) {
        throw new Error('Channel is missing required fields');
    }
    const items = channel.item;
    if (!Array.isArray(items)) {
        channel.item = [items];
    }
    channel.item = channel.item.map((item) => {
        if (!item.title || !item.link || !item.description || !item.pubDate) {
            return null;
        }
        return {
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
        };
    }).filter((item) => item !== null);
    if (channel.item.length === 0) {
        delete channel.item;
    }
    return {
        channel: channel,
        item: channel.item || [],
    };
}
export default fetchFeed;
