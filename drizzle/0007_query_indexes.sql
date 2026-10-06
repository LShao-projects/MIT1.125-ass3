CREATE INDEX `idx_adviser_usage_user_time` ON `adviser_usage` (`user_id`,`request_at`);--> statement-breakpoint
CREATE INDEX `idx_claims_design` ON `design_claims` (`design_id`);--> statement-breakpoint
CREATE INDEX `idx_proposal_versions_created` ON `proposal_versions` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_scenarios_user_created` ON `scenarios` (`user_id`,`created_at`);