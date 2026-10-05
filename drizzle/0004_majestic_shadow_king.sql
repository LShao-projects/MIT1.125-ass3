CREATE TABLE `design_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`design_id` text NOT NULL,
	`country_code` text,
	`claim` text NOT NULL,
	`value` text NOT NULL,
	`unit` text NOT NULL,
	`claim_type` text NOT NULL,
	`source_id` text,
	`period` text NOT NULL,
	`notes` text NOT NULL,
	`updated_at` text NOT NULL
);
