ALTER TABLE `organizations` ADD `key` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `organizations` SET `key` = hex(randomblob(16)) WHERE `key` = '';
