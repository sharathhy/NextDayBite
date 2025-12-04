-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: user_meals
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Feedback`
--

DROP TABLE IF EXISTS `Feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Feedback`
--

LOCK TABLES `Feedback` WRITE;
/*!40000 ALTER TABLE `Feedback` DISABLE KEYS */;
INSERT INTO `Feedback` VALUES (1,'Food Quality',5,'good','2025-11-28 05:43:38.991');
/*!40000 ALTER TABLE `Feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MealEntry`
--

DROP TABLE IF EXISTS `MealEntry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MealEntry` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vertical` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reportingManager` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shiftTimings` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mealType` enum('Veg','Non_Veg') COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Standard',
  `isRedeemed` tinyint(1) NOT NULL DEFAULT '0',
  `redeemedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MealEntry_date_employeeId_key` (`date`,`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MealEntry`
--

LOCK TABLES `MealEntry` WRITE;
/*!40000 ALTER TABLE `MealEntry` DISABLE KEYS */;
INSERT INTO `MealEntry` VALUES ('a2a410f7-821c-491f-9856-a94ddce60b21','2025-12-04','12345','kabir singh','TMT','Rocky','Bangalore','9am-5pm','Veg','Points',0,NULL,'2025-11-28 09:20:45.657','2025-11-28 09:20:45.657'),('f9403396-a5b6-4617-a00e-9be5c200488d','2025-12-02','12345','kabir singh','TMT','Rocky','Bangalore','9am-5pm','Veg','Online',0,NULL,'2025-11-28 07:14:03.222','2025-11-28 07:14:03.222'),('fd345247-e055-4ccf-8f56-da7d2769c534','2025-12-01','12345','kabir singh','TMT','Rocky','Bangalore','9am-5pm','Veg','Points',0,NULL,'2025-11-30 09:18:51.722','2025-11-30 09:18:51.722');
/*!40000 ALTER TABLE `MealEntry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razorpay_payment_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razorpay_order_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razorpay_signature` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
INSERT INTO `Payment` VALUES (1,'2025-11-27','12345','pay_RkjkOA9mjbPDcP','order_Rkjjx7WpQTiXLG','e14f018259e961f91d92ea4ad90128e1d4081a4a76e0a36889db57502abc03bc',4500,'INR','2025-11-27 10:48:34.218'),(2,'2025-11-28','12345','pay_Rl4d1T97QfaFJr','order_Rl4ca05jYiWDjm','3345a4f89ba6f142ae275de3558f6051d36dcd017c60d5f176ca60bf72eb1e97',9000,'INR','2025-11-28 07:14:03.212'),(3,'2025-11-28','12345','pay_Rl7MmDUPUthsiv','order_Rl7MQKzzPmwRPV','8c49c6bf7ef41412b9c632d262be998d2b5cea77cc97468d54a2f83168e5bdcb',7000,'INR','2025-11-28 09:54:45.434'),(4,'2025-11-30','12345','pay_RltqRp1Lfeotgc','order_Rltq1mRvb6Lv1i','0709a6c26e1ab3fd32b7abc6cddfc4eb8f4281e860c7c8ceb5d2f7722ba958b1',7000,'INR','2025-11-30 09:20:07.823');
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PointHistory`
--

DROP TABLE IF EXISTS `PointHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PointHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `change` int NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PointHistory`
--

LOCK TABLES `PointHistory` WRITE;
/*!40000 ALTER TABLE `PointHistory` DISABLE KEYS */;
INSERT INTO `PointHistory` VALUES (1,'12345',-1,'Redemption for booking 1 meal(s)','2025-11-28 09:20:45.649'),(2,'12345',70,'Cancellation of meal entry ecf0e424-6cb5-4fd2-b39b-60b48d0d5cff for date 2025-12-03','2025-11-28 10:45:03.832'),(3,'12345',45,'Cancellation of meal entry e27f52b5-b2d5-473b-a7cf-c8007dfa5263 for date 2025-12-01','2025-11-28 10:45:29.571'),(4,'12345',-1,'Redemption for booking 1 meal(s)','2025-11-30 08:38:08.162'),(5,'12345',45,'Cancellation of meal entry ceb982f7-4a98-4e5c-b576-9db8986766e4 for date 2025-12-01','2025-11-30 08:52:18.450'),(6,'12345',-1,'Redemption for booking 1 meal(s)','2025-11-30 08:53:10.249'),(7,'12345',45,'Cancellation of meal entry 84f3fa96-3a8b-49ee-b3bc-7e5b4cb4050e for date 2025-12-01','2025-11-30 08:59:37.700'),(8,'12345',-1,'Redemption for booking 1 meal(s)','2025-11-30 09:00:07.177'),(9,'12345',45,'Cancellation of meal entry eafad99e-e541-4250-b80e-87be8efce459 for date 2025-12-01','2025-11-30 09:08:18.157'),(10,'12345',-45,'Redemption for booking 45 meal(s)','2025-11-30 09:10:03.408'),(11,'12345',45,'Cancellation of meal entry 78a29d7f-f043-4869-989c-950077d8f60a for date 2025-12-01','2025-11-30 09:10:33.278'),(12,'12345',-45,'Redemption for booking 45 meal(s)','2025-11-30 09:12:17.523'),(13,'12345',45,'Cancellation of meal entry 84d8c2a4-1b3c-40e8-ad8d-f472c36e3a69 for date 2025-12-01','2025-11-30 09:18:19.782'),(14,'12345',-45,'Redemption for booking 45 meal(s)','2025-11-30 09:18:51.718'),(15,'12345',70,'Cancellation of meal entry e9b2d2b8-f989-47f8-aef9-0f6e5c908888 for date 2025-12-03','2025-11-30 09:20:26.545');
/*!40000 ALTER TABLE `PointHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserPoint`
--

DROP TABLE IF EXISTS `UserPoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserPoint` (
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  `mealType` enum('Veg','Non_Veg') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserPoint`
--

LOCK TABLES `UserPoint` WRITE;
/*!40000 ALTER TABLE `UserPoint` DISABLE KEYS */;
INSERT INTO `UserPoint` VALUES ('12345',70,'2025-11-30 09:20:26.545','Non_Veg');
/*!40000 ALTER TABLE `UserPoint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('008c84b6-73e5-4cab-8189-e672440ba1b4','69f1ca8ff1800bad7795fa24e2757f715e2d146db352824a4a73d2173615b90c','2025-11-27 06:51:09.231','20251127065109_init',NULL,NULL,'2025-11-27 06:51:09.186',1),('8a9af69c-9527-4b14-92d9-5f29e507f604','30e4e4e454bc10e94ad858b882e05d9eacc40d6b47b5c0fcdba249ee5ab66017','2025-11-28 10:44:27.112','20251128104427_added_new_column',NULL,NULL,'2025-11-28 10:44:27.073',1),('9de8d5e7-ad58-476c-8f52-e56dd593a8ca','7481bd5c668fc1bd175c5bcb28bda8b07da3c5cd86aaf4f83600293a70fdfc74','2025-11-27 11:15:27.836','20251127111527_init',NULL,NULL,'2025-11-27 11:15:27.805',1),('d9d24dc9-ce78-4c93-9fa6-b8f6764420e5','31059955ce3a10fbbe5cf8587cf98b33b0fb5db9e8866a9960f2e2e224ea1bb5','2025-11-28 05:42:55.652','20251128054255_feedback_table',NULL,NULL,'2025-11-28 05:42:55.626',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 13:48:49
