CREATE TABLE `trusted_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trusted_devices_token_hash_unique` ON `trusted_devices` (`token_hash`);--> statement-breakpoint
CREATE INDEX `trusted_devices_user_id_idx` ON `trusted_devices` (`user_id`);--> statement-breakpoint
ALTER TABLE `login_attempts` ADD `device_id` text;--> statement-breakpoint
CREATE INDEX `login_attempts_device_idx` ON `login_attempts` (`device_id`,`attempted_at`);