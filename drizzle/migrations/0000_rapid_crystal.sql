CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `child_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`interests` text DEFAULT '[]',
	`challenges` text DEFAULT '',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collection_moments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`child_id` text,
	`type` text DEFAULT 'custom' NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`child_id`) REFERENCES `child_profiles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `daily_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`moment_id` text NOT NULL,
	`date` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`note` text,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`moment_id`) REFERENCES `collection_moments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_moment_date_idx` ON `daily_logs` (`user_id`,`moment_id`,`date`);--> statement-breakpoint
CREATE TABLE `partner_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_a_id` text NOT NULL,
	`user_b_id` text,
	`invite_token` text,
	`invite_email` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_a_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_b_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `partner_links_invite_token_unique` ON `partner_links` (`invite_token`);--> statement-breakpoint
CREATE TABLE `reflections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`mood` text NOT NULL,
	`note` text DEFAULT '',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
