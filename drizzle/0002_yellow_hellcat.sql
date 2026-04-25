CREATE TABLE "feed_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"feed_id" uuid NOT NULL,
	CONSTRAINT "feed_follows_user_id_feed_id_unique" UNIQUE("user_id", "feed_id")
);
--> statement-breakpoint
-- Drop the incorrect unique constraints
ALTER TABLE "feed_follows" DROP CONSTRAINT "feed_follows_user_id_unique";
ALTER TABLE "feed_follows" DROP CONSTRAINT "feed_follows_feed_id_unique";

-- Add the correct composite unique constraint
ALTER TABLE "feed_follows" ADD CONSTRAINT "feed_follows_user_id_feed_id_unique" UNIQUE("user_id", "feed_id");