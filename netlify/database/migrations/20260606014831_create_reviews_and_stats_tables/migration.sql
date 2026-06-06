CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY,
	"reviewer_type" text NOT NULL,
	"name" text NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"key" text PRIMARY KEY,
	"value" integer NOT NULL,
	"label" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
