/*
  Warnings:

  - A unique constraint covering the columns `[date,employeeId,isCancelled]` on the table `MealEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `MealEntry_date_employeeId_key` ON `MealEntry`;

-- CreateIndex
CREATE UNIQUE INDEX `MealEntry_date_employeeId_isCancelled_key` ON `MealEntry`(`date`, `employeeId`, `isCancelled`);
