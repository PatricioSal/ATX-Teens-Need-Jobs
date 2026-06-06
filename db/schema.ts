import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const stats = pgTable("stats", {
  key: text("key").primaryKey(),
  value: integer("value").notNull(),
  label: text("label").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerType: text("reviewer_type").notNull(),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  isApproved: boolean("is_approved").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
