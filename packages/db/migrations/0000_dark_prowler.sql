CREATE TABLE `bachira_followership` (
	`id` int AUTO_INCREMENT NOT NULL,
	`follower_id` varchar(256) NOT NULL,
	`following_id` varchar(256) NOT NULL,
	CONSTRAINT `bachira_followership_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationFor` varchar(100) NOT NULL,
	`notificationFrom` varchar(100) NOT NULL,
	`type` enum('FOLLOW','LIKE','COMMENT','REPLY') NOT NULL,
	`postId` int,
	`status` enum('READ','UNREAD') DEFAULT 'UNREAD',
	`seen` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `bachira_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_postComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` varchar(100) NOT NULL,
	`text` text NOT NULL,
	CONSTRAINT `bachira_postComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_postLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` varchar(100) NOT NULL,
	CONSTRAINT `bachira_postLikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(100) NOT NULL,
	`text` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`privacy` enum('PUBLIC','FOLLOWERS','PRIVATE') DEFAULT 'PUBLIC',
	CONSTRAINT `bachira_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bachira_user` (
	`countId` int AUTO_INCREMENT NOT NULL,
	`id` varchar(255) NOT NULL,
	`bio` varchar(160) DEFAULT '',
	`coverPhoto` varchar(255),
	`username` varchar(50),
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`website` varchar(255) DEFAULT '',
	`gender` enum('MALE','FEMALE','IDK') DEFAULT 'IDK',
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`emailVerified` timestamp(3) DEFAULT (now()),
	`image` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bachira_user_countId` PRIMARY KEY(`countId`)
);
--> statement-breakpoint
CREATE INDEX `follower_idx` ON `bachira_followership` (`follower_id`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `bachira_followership` (`following_id`);--> statement-breakpoint
CREATE INDEX `comments_post_idx` ON `bachira_postComments` (`postId`);--> statement-breakpoint
CREATE INDEX `likes_post_idx` ON `bachira_postLikes` (`postId`);--> statement-breakpoint
CREATE INDEX `userid` ON `bachira_user` (`id`);