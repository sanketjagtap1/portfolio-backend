-- Add review-submission fields to testimonials
ALTER TABLE `testimonials` ADD COLUMN `email` VARCHAR(191) NULL;
ALTER TABLE `testimonials` ADD COLUMN `approved` BOOLEAN NOT NULL DEFAULT false;
