-- Add an optional download link (e.g. APK) to projects
ALTER TABLE `projects` ADD COLUMN `downloadUrl` VARCHAR(191) NULL;
