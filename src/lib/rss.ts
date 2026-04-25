import { XMLParser } from 'fast-xml-parser';

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      'User-Agent': 'gator',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
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

export function parseFeed(text: string): any {
  const options = {
    ignoreNameSpace: true,
    ignoreAttribute: false,
    allowBooleanAttributes: false,
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: true,
    stopAtFirstTagMismatch: true,
    processEntities: false,
  };
  const parser = new XMLParser(options);
  const raw = parser.parse(text);

  // Try RSS format first (raw.rss.channel)
  let channel = raw.rss?.channel;
  
  // If not RSS, try Atom format (raw.feed)
  if (!channel && raw.feed) {
    const atomFeed = raw.feed;
    const getAtomLink = (links: any): string => {
      if (typeof links === 'string') return links;
      if (Array.isArray(links)) {
        const href = links.find((l: any) => l['@_href'])?.['@_href'] || links[0]?.['@_href'];
        return href || '';
      }
      return links?.['@_href'] || '';
    };
    
    const entries = Array.isArray(atomFeed.entry) ? atomFeed.entry : [atomFeed.entry];
    channel = {
      title: atomFeed.title || "Untitled",
      link: getAtomLink(atomFeed.link) || "",
      description: atomFeed.subtitle || atomFeed.summary || "",
      item: entries.filter((e: any) => e).map((entry: any) => ({
        title: entry.title,
        link: getAtomLink(entry.link) || "",
        description: entry.summary || entry.content || "",
        pubDate: entry.updated || entry.published,
      })) || [],
    };
  }

  // Validate that channel exists
  if (!channel) {
    throw new Error('Invalid feed format: neither RSS nor Atom found');
  }

  // Normalize channel.item into an array if needed
  const items = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

  // Build a new array of valid RSSItem objects
  const validItems = items.map((item: any) => {
    if (!item || !item.link) {
      return null;
    }
    return {
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    };
  }).filter((item: any) => item !== null);

  // Return a brand-new RSSFeed object
  return {
    channel: {
      title: channel.title || "Untitled",
      link: channel.link || "",
      description: channel.description || "",
      item: validItems,
    },
  };
}

export function validateFeed(feed: any): RSSFeed | null {
  if (!feed.channel) {
    throw new Error('Feed is missing channel');
  }

  const { channel } = feed;

  // More lenient validation
  if (!channel.title && !channel.link) {
    throw new Error('Channel is missing required fields');
  }

  const items = channel.item || [];

  // Ensure items is an array
  const itemArray = Array.isArray(items) ? items : [items];

  // Filter out items without links
  channel.item = itemArray.filter((item: any) => item && item.link);

  return {
    channel: channel,
    item: channel.item,
  } as RSSFeed;
}

export default fetchFeed;