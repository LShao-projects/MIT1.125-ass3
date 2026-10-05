CREATE TABLE `role_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text NOT NULL,
	`target_id` text NOT NULL,
	`previous_role` text NOT NULL,
	`new_role` text NOT NULL,
	`changed_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `course_section` text;--> statement-breakpoint
ALTER TABLE `users` ADD `rules_accepted_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `rules_version` text;