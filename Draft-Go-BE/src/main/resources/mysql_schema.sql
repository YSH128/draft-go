CREATE TABLE `member` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`puuid` VARCHAR(100) NOT NULL UNIQUE,
	`game_name` VARCHAR(16) NULL,
	`tag_line` VARCHAR(5) NULL,
	`main_position` VARCHAR(15) NULL,
	`sub_position` VARCHAR(15) NULL,
	`rank` VARCHAR(15) NULL,
	`league_point` INT NULL,
	`rank_win_rate` DECIMAL(5,2) NULL,
	`lasted_win_rate` DECIMAL(5,2) NULL,
    `password` VARCHAR(100) NOT NULL COMMENT 'bcrypt 해시, 임시 비밀번호 가능',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE `draft` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`owner_id` BIGINT NOT NULL,
	`title` VARCHAR(100) NOT NULL,
	`start_price` INT NOT NULL,
	`start_point` INT NOT NULL,
	`status` VARCHAR(20) NOT NULL DEFAULT 'RECRUITING' COMMENT 'RECRUITING, AUCTION, AUCTION_FINISHED, COMPLETED',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_draft_owner` FOREIGN KEY (`owner_id`) REFERENCES `member` (`id`)
);

CREATE TABLE `draft_member` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`draft_id` BIGINT NOT NULL,
	`member_id` BIGINT NOT NULL,
	`position` VARCHAR(15) NOT NULL COMMENT '드래프트에 참가하기 전에 포지션 확정 필요',
	`turn_order` INT NULL COMMENT '경매 시작시 순서 결정',
	`status` VARCHAR(20) NOT NULL COMMENT 'WAITING, BIDDING, COMPLETED, SKIPPED',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_dm_draft` FOREIGN KEY (`draft_id`) REFERENCES `draft` (`id`),
    CONSTRAINT `fk_dm_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
);

CREATE TABLE `teammate` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`team_id` BIGINT NOT NULL,
	`member_id` BIGINT NOT NULL,
	`point` INT NOT NULL,
	`is_leader` TINYINT(1) NOT NULL DEFAULT 0,
	`position` VARCHAR(15) NOT NULL COMMENT 'TOP, JUNGLE, MID, BOT, SUPPORT',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
    CONSTRAINT `fk_tm_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
);

CREATE TABLE `team` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`team_name` VARCHAR(15) NOT NULL,
	`draft_id` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_team_draft` FOREIGN KEY (`draft_id`) REFERENCES `draft` (`id`)
);

