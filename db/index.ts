import { drizzle } from "drizzle-orm/netlify-db";

export const db = drizzle(process.env.NETLIFY_DATABASE_URL || "");
