import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { stats } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "GET") {
    const allStats = await db.select().from(stats);
    return Response.json(allStats);
  }

  if (req.method === "PUT") {
    const { key, value } = await req.json();
    if (!key || typeof value !== "number") {
      return new Response("Invalid body: key (string) and value (number) required", { status: 400 });
    }
    const [updated] = await db
      .update(stats)
      .set({ value, updatedAt: new Date() })
      .where(eq(stats.key, key))
      .returning();
    if (!updated) {
      return new Response("Stat key not found", { status: 404 });
    }
    return Response.json(updated);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/stats",
};
