CREATE TABLE `flashcard_decks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subjectId` int,
	`title` varchar(160) NOT NULL,
	`description` text,
	`color` varchar(16) NOT NULL,
	`cardCount` int NOT NULL DEFAULT 0,
	`dueCount` int NOT NULL DEFAULT 0,
	`mastery` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcard_decks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pomodoro_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subjectId` int,
	`taskId` int,
	`plannedMinutes` int NOT NULL,
	`actualMinutes` int NOT NULL,
	`outcome` enum('completed','abandoned') NOT NULL,
	`startedAt` timestamp NOT NULL,
	`endedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pomodoro_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`kind` enum('quick_test','regular_test','final_exam','general_review') NOT NULL,
	`dueAt` timestamp,
	`subjectId` int,
	`status` enum('active','completed','archived') NOT NULL DEFAULT 'active',
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subjectId` int,
	`title` varchar(200) NOT NULL,
	`description` text,
	`dueAt` timestamp,
	`estimatedMinutes` int NOT NULL DEFAULT 25,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('todo','in_progress','completed') NOT NULL DEFAULT 'todo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`color` varchar(16) NOT NULL,
	`icon` varchar(64) NOT NULL DEFAULT 'BookOpen',
	`weeklyTargetMinutes` int NOT NULL DEFAULT 60,
	`archived` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(120),
	`schoolLevel` varchar(80),
	`schoolName` varchar(160),
	`timezone` varchar(80) NOT NULL DEFAULT 'Europe/Paris',
	`language` varchar(8) NOT NULL DEFAULT 'fr',
	`theme` enum('light','dark') NOT NULL DEFAULT 'light',
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`weeklyTargetMinutes` int NOT NULL DEFAULT 300,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
