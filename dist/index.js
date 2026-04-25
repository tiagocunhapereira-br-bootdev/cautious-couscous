/*
TODO:
The agg command!
It needs to:

Take time_between_reqs as an argument
Parse it into milliseconds
Print a startup message
Call scrapeFeeds once immediately, then on an interval
Handle SIGINT to shut down cleanly
*/
import { readConfig, setUser } from "./config.js";
import { createUser, getUserByName, resetUsers, getUsers } from "./lib/db/queries/users.js";
import { createFeed, getFeeds, getFeedByURL } from "./lib/db/queries/feeds.js";
import { feedFollows } from "./lib/db/schema.js";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follows.js";
import { eq, and } from "drizzle-orm";
import { db } from "./lib/db/index.js";
import { scrapeFeeds } from "./commands/aggregate.js";
function middlewareLoggedIn(handler) {
    if (typeof handler !== "function") {
        throw new Error("Handler must be a function");
    }
    return async (cmdName, ...args) => {
        const config = readConfig();
        if (!config.currentUserName) {
            throw new Error("You must be logged in to use this command");
        }
        const user = await getUserByName(config.currentUserName);
        if (!user) {
            throw new Error("Current user not found in database");
        }
        await handler(cmdName, user, ...args);
    };
}
async function handlerRegister(cmdName, ...args) {
    if (args.length === 0) {
        throw new Error("A username is required");
    }
    const username = args[0];
    const existingUser = await getUserByName(username);
    if (existingUser) {
        throw new Error(`User ${username} already exists`);
    }
    const createdUser = await createUser(username);
    setUser(username);
    console.log(`User ${username} created`);
    console.log(createdUser);
}
// Of course make a handler for agg, but wait, do we have a agg command?
// Dang it! We do. We'll edit the handler then.
function printFeed(feed, user) {
    console.log(`Feed ID: ${feed.id}`);
    console.log(`Created At: ${feed.createdAt}`);
    console.log(`Updated At: ${feed.updatedAt}`);
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User ID: ${user.id}`);
    console.log(`User Name: ${user.name}`);
}
async function handlerAddFeed(cmdName, user, ...args) {
    if (args.length !== 2) {
        throw new Error("Exactly 2 arguments are required: feed name and feed url");
    }
    const feedName = args[0];
    const feedUrl = args[1];
    const currentUser = await getUserByName(user.name);
    let newFeed = await getFeedByURL(feedUrl);
    if (!newFeed) {
        newFeed = await createFeed(feedName, feedUrl, currentUser.id);
    }
    const newFeedFollow = await createFeedFollow(currentUser.id, newFeed.id);
    printFeed(newFeedFollow.feed, newFeedFollow.user);
}
export async function handlerFeeds(cmdName, ...args) {
    if (args.length !== 0) {
        throw new Error("Command 'feeds' takes no arguments.");
    }
    const feeds = await getFeeds();
    for (const feed of feeds) {
        printFeed(feed.feed, feed.user);
    }
}
async function handlerFollow(cmdName, user, ...args) {
    if (args.length !== 1) {
        throw new Error("Exactly 1 argument is required: feed URL");
    }
    const url = args[0];
    const feed = await getFeedByURL(url);
    if (!feed) {
        throw new Error("Feed not found");
    }
    const follows = await getFeedFollowsForUser(user.id);
    const alreadyFollowing = follows.some((follow) => follow.feed.id === feed.id);
    if (alreadyFollowing) {
        console.log(`You are already following ${feed.name}`);
        return;
    }
    const result = await createFeedFollow(user.id, feed.id);
    printFeed(result.feed, result.user);
}
async function handlerUnfollow(cmdName, user, ...args) {
    if (args.length !== 1) {
        throw new Error("Exactly 1 argument is required: feed URL");
    }
    const url = args[0];
    const feed = await getFeedByURL(url);
    if (!feed) {
        throw new Error("Feed not found");
    }
    const follows = await getFeedFollowsForUser(user.id);
    const alreadyFollowing = follows.some((follow) => follow.feed.id === feed.id);
    if (!alreadyFollowing) {
        console.log(`You are not following ${feed.name}`);
        return;
    }
    await removeFeedFollow(user.id, feed.id);
    console.log(`Unfollowed ${feed.name}`);
}
async function removeFeedFollow(userId, feedId) {
    await db
        .delete(feedFollows)
        .where(and(eq(feedFollows.user_id, userId), eq(feedFollows.feed_id, feedId)));
}
async function handlerFollowing(cmdName, user, ...args) {
    if (args.length !== 0) {
        throw new Error("Command 'following' takes no arguments.");
    }
    const feedFollows = await getFeedFollowsForUser(user.id);
    for (const feedFollow of feedFollows) {
        console.log(feedFollow.feed.name);
    }
}
async function handlerUsers(cmdName, ...args) {
    const users = await getUsers();
    const currentConfig = readConfig();
    for (const user of users) {
        console.log(`* ${user.name} ${user.name === currentConfig.currentUserName ? "(current)" : ""}`);
    }
}
async function handlerLogin(cmdName, ...args) {
    if (args.length === 0) {
        throw new Error("A username is required");
    }
    const username = args[0];
    const existingUser = await getUserByName(username);
    if (!existingUser) {
        throw new Error(`User ${username} does not exist`);
    }
    setUser(username);
    console.log(`Logged in as ${username}`);
}
async function handlerReset(cmdName, ...args) {
    await resetUsers();
    console.log("Users reset successfully!");
}
function formatTimeFromMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    if (seconds > 0)
        parts.push(`${seconds}s`);
    return parts.length > 0 ? parts.join("") : "0s";
}
function parseTimeToMs(timeStr) {
    const match = timeStr.match(/^(\d+)([smh])$/);
    if (!match) {
        throw new Error(`Invalid time format: ${timeStr} (use format like '5s', '1m', '2h')`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        default:
            throw new Error(`Unknown time unit: ${unit}`);
    }
}
async function handlerAgg(cmdName, ...args) {
    if (args.length === 0) {
        throw new Error("time_between_reqs is required (e.g., '5s', '1m', '2h')");
    }
    const timeStr = args[0];
    const timeMs = parseTimeToMs(timeStr);
    if (timeMs <= 0) {
        throw new Error("time_between_reqs must be a positive duration");
    }
    const readableTime = formatTimeFromMs(timeMs);
    console.log(`Collecting feeds every ${readableTime}`);
    // Call scrapeFeeds immediately
    await scrapeFeeds();
    // Set up interval for subsequent calls
    const intervalId = setInterval(async () => {
        await scrapeFeeds();
    }, timeMs);
    // Handle SIGINT for clean shutdown - wrapped in a Promise
    await new Promise((resolve) => {
        process.on("SIGINT", () => {
            console.log("\nShutting down feed aggregation...");
            clearInterval(intervalId);
            resolve();
        });
    });
}
function registerCommand(registry, cmdName, handler) {
    if (typeof cmdName !== "string" || cmdName.trim() === "") {
        throw new Error("cmdName must be a non-empty string");
    }
    if (typeof handler !== "function") {
        throw new Error("handler must be a function");
    }
    registry[cmdName] = handler;
}
async function runCommand(registry, cmdName, ...args) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}
async function main() {
    const registry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("No command provided");
        return process.exit(1);
    }
    const [cmdName, ...commandArgs] = args;
    try {
        await runCommand(registry, cmdName, ...commandArgs);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(error);
        }
        return process.exit(1);
    }
    return process.exit(0);
}
main();
