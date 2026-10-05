CREATE TABLE `proposal_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`inputs` text NOT NULL,
	`requirements` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
