import { db } from "../index.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createUser(name) {
    const [inserted] = await db.insert(users).values({ name }).returning();
    return inserted;
}
export async function getUserByName(name) {
    const rows = await db.select().from(users).where(eq(users.name, name)).limit(1);
    return rows[0];
}
export async function resetUsers() {
    await db.delete(users);
}
export async function getUsers() {
    return await db.select().from(users);
}
