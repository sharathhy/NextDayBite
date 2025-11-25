-- CreateTable
CREATE TABLE `MealEntry` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `employeeName` VARCHAR(191) NOT NULL,
    `vertical` VARCHAR(191) NOT NULL,
    `reportingManager` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `shiftTimings` VARCHAR(191) NOT NULL,
    `mealType` ENUM('Veg', 'Non_Veg') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MealEntry_date_employeeId_key`(`date`, `employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
