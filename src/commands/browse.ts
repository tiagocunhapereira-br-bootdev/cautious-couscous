import { getPostsForUser } from "../lib/db/queries/posts.js";
import { User } from "../lib/db/queries/feeds.js";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]): Promise<void> {
  // Parse optional limit argument (default 2)
  let limit = 2;
  
  if (args.length > 0) {
    const parsedLimit = parseInt(args[0], 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = parsedLimit;
    } else {
      throw new Error(`Invalid limit: ${args[0]}. Must be a positive number.`);
    }
  }

  // Get posts for the user
  const rows = await getPostsForUser(user.id, limit);

  if (rows.length === 0) {
    console.log("No posts found.");
    return;
  }

  // Print posts in a readable format
  console.log(`\n📰 Latest ${rows.length} post${rows.length === 1 ? "" : "s"}:\n`);
  
  rows.forEach((row, index) => {
    const post = row.posts;
    const publishedDate = post.publishedAt ? new Date(post.publishedAt).toLocaleString() : "(unknown date)";
    
    console.log(`${index + 1}. ${post.title || "(no title)"}`);
    console.log(`   URL: ${post.url}`);
    console.log(`   Published: ${publishedDate}`);
    if (post.description) {
      const cleanDesc = stripHtml(post.description);
      console.log(`   ${cleanDesc}`);
    }
    console.log("");
  });
}
