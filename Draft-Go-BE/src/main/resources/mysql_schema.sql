CREATE TABLE `member` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(20) NOT NULL UNIQUE COMMENT '로그인 아이디',
    `password` VARCHAR(100) NOT NULL COMMENT 'bcrypt 해시, 임시 비밀번호 가능',
	`game_name` VARCHAR(16) NOT NULL COMMENT '라이엇 게임즈에서 제공하는 소환사 이름',
	`tag_line` VARCHAR(5) NOT NULL COMMENT '라이엇 게임즈에서 제공하는 소환사 태그',
    `puuid` VARCHAR(100),
    	`main_position` VARCHAR(15) NULL COMMENT '사용자가 선택 가능한 포지션',
	`sub_position` VARCHAR(15) NULL COMMENT '사용자가 선택 가능한 포지션',
	`bio` VARCHAR(150) NULL COMMENT '한 줄 소개',
    `profile_icon_id` INT NULL COMMENT '소환사 프로필 아이콘 ID',
    `role` VARCHAR(10) NOT NULL DEFAULT 'USER' COMMENT '사용자 권한 (USER, ADMIN)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT chk_username CHECK (username REGEXP '^[A-Za-z0-9]+$')
);

CREATE TABLE `member_stat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `member_id` BIGINT NOT NULL,
    `season_id` VARCHAR(10) NOT NULL COMMENT '시즌 ID (예: 1401, 1602)',
    `tier` VARCHAR(15) NULL COMMENT 'MongoDB에서 복제된 티어 정보 (IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER)',
    `division` VARCHAR(5) NULL COMMENT 'MongoDB에서 복제된 디비전 정보 (I, II, III, IV)',
    `league_point` INT NULL COMMENT 'MongoDB에서 복제된 리그 포인트',
    `rank_win_rate` DECIMAL(5, 2) NULL COMMENT 'MongoDB에서 복제된 랭크 승률',
    `rank_wins` INT NULL COMMENT 'MongoDB에서 복제된 랭크 승수',
    `rank_lose_rate` INT NULL COMMENT 'MongoDB에서 복제된 랭크 패배율',
    `lasted_win_rate` DECIMAL(5, 2) NULL COMMENT 'MongoDB에서 복제된 최근 승률',
    `lasted_wins` INT NULL COMMENT 'MongoDB에서 복제된 최근 승수',
    `lasted_losses` INT NULL COMMENT 'MongoDB에서 복제된 최근 패배수',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ms_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
    UNIQUE KEY `uk_member_season` (`member_id`, `season_id`)
);

CREATE TABLE `draft` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`owner_id` BIGINT NOT NULL,
	`title` VARCHAR(100) NOT NULL,
	`start_price` INT NOT NULL,
	`start_point` INT NOT NULL,
    `max_team_count` INT NOT NULL,
    `thumbnail_url` VARCHAR(500) NULL,
	`member_code` VARCHAR(6) NOT NULL,
	`leader_code` VARCHAR(6) NOT NULL,
	`status` VARCHAR(20) NOT NULL DEFAULT 'RECRUITING' COMMENT 'RECRUITING, AUCTION, AUCTION_FINISHED, COMPLETED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_draft_owner` FOREIGN KEY (`owner_id`) REFERENCES `member` (`id`)
);

CREATE TABLE `draft_member` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`draft_id` BIGINT NOT NULL,
	`member_id` BIGINT NOT NULL,
	`position` VARCHAR(15) NOT NULL COMMENT '드래프트에 참가하기 전에 포지션 확정 필요',
	`turn_order` INT NULL COMMENT '경매 시작시 순서 결정',
	`status` VARCHAR(20) NOT NULL COMMENT 'WAITING, COMPLETED, SKIPPED',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_dm_draft` FOREIGN KEY (`draft_id`) REFERENCES `draft` (`id`),
    CONSTRAINT `fk_dm_member` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
);

CREATE TABLE `team` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`team_name` VARCHAR(15) NOT NULL,
	`point` INT NOT NULL DEFAULT 0 COMMENT '팀의 남은 포인트',
	`draft_id` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_team_draft` FOREIGN KEY (`draft_id`) REFERENCES `draft` (`id`)
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


