CREATE TABLE `bachira_bans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`reason` enum('SEXUAL_CONTENT','HATEFUL_CONTENT','VIOLENT_CONTENT','HARASSMENT','SPAM','CHILD_ABUSE','PRETENDING_TO_BE_SOMEONE') NOT NULL,
	`duration` timestamp NOT NULL,
	CONSTRAINT `bachira_bans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_postReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`reportedById` varchar(255) NOT NULL,
	`postId` int NOT NULL,
	`reportType` enum('SEXUAL_CONTENT','HATEFUL_CONTENT','VIOLENT_CONTENT','SPAM','CHILD_ABUSE') NOT NULL,
	`status` enum('PENDING','RESOLVED') DEFAULT 'PENDING',
	CONSTRAINT `bachira_postReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_userReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`reportedById` varchar(255) NOT NULL,
	`reportType` enum('SEXUAL_CONTENT','HATEFUL_CONTENT','VIOLENT_CONTENT','HARASSMENT','SPAM','CHILD_ABUSE','PRETENDING_TO_BE_SOMEONE') NOT NULL,
	`status` enum('PENDING','RESOLVED') DEFAULT 'PENDING',
	CONSTRAINT `bachira_userReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bachira_postLikes` DROP FOREIGN KEY `bachira_postLikes_id_bachira_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `bachira_posts` ADD `isDeleted` boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX `delete_idx` ON `bachira_posts` (`isDeleted`);--> statement-breakpoint
ALTER TABLE `bachira_postLikes` ADD CONSTRAINT `bachira_postLikes_postId_bachira_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `bachira_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bachira_bans` ADD CONSTRAINT `bachira_bans_userId_bachira_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `bachira_user`(`id`) ON DELETE cascade ON UPDATE no action;