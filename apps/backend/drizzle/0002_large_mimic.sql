PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`email` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "created_at", "updated_at", "deleted_at", "email") SELECT "id", "created_at", "updated_at", "deleted_at", "email" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);