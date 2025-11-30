/*
  Warnings:

  - Added the required column `mealType` to the `UserPoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserPoint` ADD COLUMN `mealType` ENUM('Veg', 'Non_Veg') NOT NULL;
