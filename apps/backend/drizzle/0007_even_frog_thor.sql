CREATE TABLE `organization_invitations` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`organization_id` text NOT NULL,
	`invited_by` integer NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitations_token_unique` ON `organization_invitations` (`token`);--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`organization_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`name` text NOT NULL,
	`owner_id` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
