ALTER TABLE `bachira_notifications` MODIFY COLUMN `type` enum('FOLLOW','LIKE_POST','LIKE_COMMENT','LIKE_REPLY','MENTION_POST','MENTION_COMMENT','COMMENT','REPLY') NOT NULL;