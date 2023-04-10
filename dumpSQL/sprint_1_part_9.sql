-- MySQL dump 10.13  Distrib 8.0.32, for macos13 (x86_64)
--
-- Host: localhost    Database: simplesend
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Table structure for table `api_key_list`
--

DROP TABLE IF EXISTS `api_key_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_key_list` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `API_key` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_key_list`
--

LOCK TABLES `api_key_list` WRITE;
/*!40000 ALTER TABLE `api_key_list` DISABLE KEYS */;
INSERT INTO `api_key_list` VALUES (1,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4MDk2ODY5MCwiZXhwIjoxNzEyNTA0NjkwfQ.HKozsKNOo2F7Kj56OQGXrFr1omEbxZvXCrY_DMShsLA'),(2,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY4MTEwNDAwNiwiZXhwIjoxNzEyNjQwMDA2fQ.OlqVsYiL5UZC-ZbH2-Lq6b2ysET9Eb0QyTcKrh9mHPI');
/*!40000 ALTER TABLE `api_key_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_email_list`
--

DROP TABLE IF EXISTS `failed_email_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_email_list` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `send_email_list_id` int NOT NULL,
  `error_status` int NOT NULL,
  `error_log` varchar(255) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_email_list`
--

LOCK TABLES `failed_email_list` WRITE;
/*!40000 ALTER TABLE `failed_email_list` DISABLE KEYS */;
INSERT INTO `failed_email_list` VALUES (1,10,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyiia00@gmail.com','test'),(2,18,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(3,19,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(4,20,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(5,21,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(6,22,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(7,23,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(8,24,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(9,25,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(10,28,400,'Missing final \'@domain\'','test'),(11,27,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(12,31,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@gmal.com','test'),(13,32,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@mal.com','test'),(14,33,400,'Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: tingyilia00@l.com','test'),(15,61,400,'Missing final \'@domain\'','tingyilia00gmail.com');
/*!40000 ALTER TABLE `failed_email_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `old_api_key_list`
--

DROP TABLE IF EXISTS `old_api_key_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `old_api_key_list` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `old_api_key` varchar(255) NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `old_api_key_list`
--

LOCK TABLES `old_api_key_list` WRITE;
/*!40000 ALTER TABLE `old_api_key_list` DISABLE KEYS */;
INSERT INTO `old_api_key_list` VALUES (5,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4MDk2ODUyMywiZXhwIjoxNzEyNTA0NTIzfQ.z3f-xFVGNS1swF6XiCujRLQwFm5FnXSwheSfpHt_9Wk','2023-04-08 23:44:50'),(6,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY4MTEwMjI1MywiZXhwIjoxNzEyNjM4MjUzfQ.-rI8yrvab0mREC1q9KISuu27u9ey_77qsPdfjY7GZA0','2023-04-10 13:20:06');
/*!40000 ALTER TABLE `old_api_key_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `send_email_list`
--

DROP TABLE IF EXISTS `send_email_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `send_email_list` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email_subject` varchar(255) NOT NULL,
  `time` datetime NOT NULL,
  `status` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `send_email_list`
--

LOCK TABLES `send_email_list` WRITE;
/*!40000 ALTER TABLE `send_email_list` DISABLE KEYS */;
INSERT INTO `send_email_list` VALUES (1,1,'uou','2023-04-04 06:13:14',0),(2,1,'uou','2023-04-04 06:14:15',0),(3,1,'uou','2023-04-04 06:21:07',0),(4,1,'uou','2023-04-04 06:28:17',1),(5,1,'uou','2023-04-04 06:31:14',1),(6,1,'999999','2023-04-04 06:32:57',1),(7,1,'999999','2023-04-04 06:34:09',1),(8,1,'999999','2023-04-04 06:37:33',0),(9,1,'999999','2023-04-04 06:39:28',0),(10,1,'999999','2023-04-04 06:41:44',0),(11,1,'trackingtest','2023-04-04 14:31:20',0),(12,1,'trackingtest','2023-04-04 14:33:29',0),(13,1,'trackingtest','2023-04-04 14:34:17',1),(14,1,'trackingtest','2023-04-04 14:49:55',1),(15,1,'happy','2023-04-05 06:05:45',1),(16,1,'huuuuuappy','2023-04-05 06:12:58',1),(17,1,'huuuuuappy','2023-04-05 06:13:16',1),(18,1,'demo','2023-04-06 06:00:22',0),(19,1,'demo','2023-04-06 06:06:09',0),(20,1,'demo','2023-04-06 06:07:02',0),(21,1,'demo','2023-04-06 06:07:40',0),(22,1,'demo','2023-04-06 06:10:35',0),(23,1,'demo','2023-06-04 14:48:12',0),(24,1,'demo','2023-04-06 14:49:03',0),(25,1,'demo','2023-04-06 16:49:47',0),(26,1,'demo','2023-04-06 16:49:54',0),(27,1,'demo','2023-04-06 16:50:29',0),(28,1,'demo','2023-04-06 16:50:29',0),(29,1,'demo','2023-04-06 16:52:20',0),(30,1,'demo','2023-04-06 16:52:20',0),(31,1,'demo','2023-04-06 18:18:59',0),(32,1,'demo','2023-04-06 18:19:09',0),(33,1,'demo','2023-04-06 18:19:25',0),(34,1,'demo','2023-04-06 18:21:26',1),(35,2,'雪恥！！！！','2023-04-07 16:33:23',1),(36,1,'雪恥！！！！','2023-04-08 09:16:25',1),(37,1,'雪恥！！！！','2023-04-08 11:37:05',1),(38,1,'雪恥！！！！','2023-04-08 11:37:05',1),(39,1,'雪恥！！！！','2023-04-08 11:37:06',1),(40,1,'雪恥！！！！','2023-04-08 11:37:06',1),(41,1,'雪恥！！！！','2023-04-08 11:37:07',1),(42,1,'雪恥！！！！','2023-04-08 11:37:07',1),(43,1,'雪恥！！！！','2023-04-08 11:37:08',1),(44,1,'雪恥！！！！','2023-04-08 11:37:08',1),(45,1,'雪恥！！！！','2023-04-08 11:37:08',1),(46,1,'雪恥！！！！','2023-04-08 11:37:37',1),(47,1,'雪恥！！！！','2023-04-08 11:37:37',1),(48,1,'雪恥！！！！','2023-04-08 11:37:38',1),(49,1,'雪恥！！！！','2023-04-08 11:37:38',1),(50,1,'雪恥！！！！','2023-04-08 11:37:39',1),(51,1,'雪恥！！！！','2023-04-08 11:37:39',1),(52,1,'雪恥！！！！','2023-04-08 11:37:39',1),(53,1,'雪恥！！！！','2023-04-08 11:37:40',1),(54,1,'雪恥！！！！','2023-04-08 11:37:40',1),(55,1,'雪恥！！！！','2023-04-08 11:37:40',1),(56,1,'雪恥！！！！','2023-04-08 11:37:41',1),(57,1,'雪恥！！！！','2023-04-08 13:49:20',1),(58,1,'雪恥！！！！','2023-04-08 13:49:32',1),(59,1,'雪恥！！！！','2023-04-08 13:49:49',1),(60,1,'雪恥！！！！','2023-04-08 13:50:07',0),(61,1,'雪恥！！！！','2023-04-08 13:50:50',0),(62,1,'哈哈哈哈哈哈哈哈','2023-04-09 11:56:05',1),(63,1,'哈哈哈哈哈哈哈哈','2023-04-09 11:56:57',1),(64,1,'哈哈哈哈哈哈哈哈','2023-04-09 11:57:16',1),(65,1,'哈哈哈哈哈哈哈哈','2023-04-09 11:57:40',1),(66,1,'哈哈哈哈哈哈哈哈','2023-04-09 12:04:32',1),(67,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:09:13',1),(68,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:11:33',1),(69,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:12:16',1),(70,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:36:15',1),(71,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:36:51',1),(72,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:39:14',1),(73,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:39:17',1),(74,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:40:36',1),(75,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:45:41',1),(76,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:45:43',1),(77,1,'哈哈哈哈哈哈哈哈','2023-04-09 14:49:14',1),(78,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:06:49',1),(79,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:17:20',1),(80,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:17:20',1),(81,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:26:03',1),(82,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:38:47',1),(83,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:40:40',1),(84,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:44:25',1),(85,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:57:38',1),(86,1,'哈哈哈哈哈哈哈哈','2023-04-09 15:59:14',1),(87,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:04:12',1),(88,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:18:28',1),(89,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:21:34',1),(90,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:21:42',1),(91,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:28:23',1),(92,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:28:37',1),(93,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:32:51',1),(94,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:34:17',1),(95,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:34:40',1),(96,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:15',1),(97,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:15',1),(98,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:15',1),(99,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:16',1),(100,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:22',1),(101,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:22',1),(102,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:40:23',1),(103,1,'哈哈哈哈哈哈哈哈','2023-04-09 16:45:40',1),(104,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:08:08',1),(105,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:09:11',1),(106,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:09:30',1),(107,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:11:23',1),(108,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:12:00',1),(109,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:12:53',1),(110,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:12:57',1),(111,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:15:55',1),(112,1,'哈哈哈哈哈哈哈哈','2023-04-09 17:21:17',1),(113,1,'哈哈哈哈哈哈哈哈','2023-04-09 21:35:08',1),(114,1,'哈哈哈哈哈哈哈哈','2023-04-09 21:35:12',1),(115,1,'哈哈哈哈哈哈哈哈','2023-04-10 12:56:26',1),(116,1,'哈哈哈哈哈哈哈哈','2023-04-10 12:56:29',1),(117,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:04:48',1),(118,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:05:03',1),(119,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:05:11',1),(120,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:05:12',1),(121,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:05:19',1),(122,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:05:20',1),(123,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:05:23',1),(124,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:08:00',1),(125,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:08:10',1),(126,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:08:22',1),(127,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:11:06',1),(128,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:14:39',1),(129,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:15:18',1),(130,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:15:45',1),(131,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:16:35',1),(132,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:17:49',1),(133,1,'哈哈哈哈哈哈哈哈','2023-04-10 13:17:57',1),(134,2,'哈哈哈哈哈哈哈哈','2023-04-10 13:20:17',1),(135,2,'哈哈哈哈哈哈哈哈','2023-04-10 13:20:25',1),(136,2,'哈哈哈哈哈哈哈哈','2023-04-10 13:20:27',1),(137,2,'哈哈哈哈哈哈哈哈','2023-04-10 13:20:52',1),(138,2,'哈哈哈哈哈哈哈哈','2023-04-10 13:21:16',1),(139,2,'哈哈哈哈哈哈哈哈','2023-04-10 13:23:52',1),(140,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:00:53',1),(141,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:00',1),(142,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:13',1),(143,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:16',1),(144,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:17',1),(145,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:19',1),(146,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:21',1),(147,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:22',1),(148,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:23',1),(149,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:25',1),(150,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:01:27',1),(151,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:02:01',1),(152,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:02:04',1),(153,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:06:38',1),(154,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:06:40',1),(155,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:06:42',1),(156,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:06:44',1),(157,1,'哈哈哈哈哈哈哈哈','2023-04-10 14:06:46',1),(158,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:10:05',1),(159,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:10:08',1),(160,2,'哈哈哈哈哈哈哈哈','2023-04-10 14:10:09',1),(161,2,'哈哈哈哈哈哈哈哈','2023-04-10 15:32:28',1);
/*!40000 ALTER TABLE `send_email_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracking_email_list`
--

DROP TABLE IF EXISTS `tracking_email_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracking_email_list` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `send_email_list_id` int NOT NULL,
  `opened_count` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `send_email_list_id` (`send_email_list_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracking_email_list`
--

LOCK TABLES `tracking_email_list` WRITE;
/*!40000 ALTER TABLE `tracking_email_list` DISABLE KEYS */;
INSERT INTO `tracking_email_list` VALUES (1,13,1),(2,14,1),(3,161,1);
/*!40000 ALTER TABLE `tracking_email_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hashword` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'tim','test','test'),(2,'tim2','test2','test2');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-10 17:44:00
