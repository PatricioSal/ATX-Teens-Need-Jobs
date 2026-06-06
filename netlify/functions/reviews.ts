import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { reviews } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "GET") {
    const approved = await db
      .select()
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt));
    return Response.json(approved);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { reviewerType, name, rating, reviewText } = body;
    if (!name || !reviewText || typeof rating !== "number" || rating < 1 || rating > 5) {
      return new Response("Invalid body: name, reviewText, and rating (1-5) required", { status: 400 });
    }
    const [inserted] = await db
      .insert(reviews)
      .values({
        reviewerType: reviewerType || "unknown",
        name,
        rating,
        reviewText,
      })
      .returning();
    return Response.json(inserted, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/reviews",
};
