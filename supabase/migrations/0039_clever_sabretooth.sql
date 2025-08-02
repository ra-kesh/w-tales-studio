ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_review_comment_crews_id_fk";
--> statement-breakpoint
ALTER TABLE "assignment_submissions" ALTER COLUMN "review_comment" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD COLUMN "reviewed_at" timestamp;