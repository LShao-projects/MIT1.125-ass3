CREATE TABLE `adviser_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`request_at` text NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`iso3` text NOT NULL,
	`name` text NOT NULL,
	`price` real,
	`price_status` text NOT NULL,
	`price_period` text,
	`energy_year` integer,
	`generation_twh` real,
	`demand_twh` real,
	`renewable_share` real,
	`carbon_intensity` real,
	`mix` text,
	`dc_records` integer DEFAULT 0 NOT NULL,
	`cluster_records` integer DEFAULT 0 NOT NULL,
	`priority` integer DEFAULT false NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `designs` (
	`id` text PRIMARY KEY NOT NULL,
	`inputs` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `refreshes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`detail` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`inputs` text NOT NULL,
	`results` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`publisher` text NOT NULL,
	`url` text NOT NULL,
	`period` text,
	`type` text NOT NULL,
	`verification_status` text DEFAULT 'pending' NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`team` text,
	`role` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` text NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`notes` text NOT NULL,
	`verified_at` text NOT NULL
);
