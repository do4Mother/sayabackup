PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_providers` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_providers`("id", "created_at", "updated_at", "deleted_at", "user_id", "provider", "provider_user_id") SELECT "id", "created_at", "updated_at", "deleted_at", "user_id", "provider", "provider_user_id" FROM `user_providers`;--> statement-breakpoint
DROP TABLE `user_providers`;--> statement-breakpoint
ALTER TABLE `__new_user_providers` RENAME TO `user_providers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;