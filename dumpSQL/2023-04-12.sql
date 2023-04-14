

CREATE TABLE `simplesend`.`user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(80) NOT NULL
);

CREATE TABLE `simplesend`.`send_email_list` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name_from` varchar(255) NOT NULL,
  `email_to` varchar(255) NOT NULL,
  `email_bcc` varchar(255) NOT NULL,
  `email_cc` varchar(255) NOT NULL,
  `email_reply_to` varchar(255) NOT NULL,
  `email_subject` varchar(255) NOT NULL,
  `email_body_type` varchar(20) NOT NULL,
  `email_body_content` longtext NOT NULL,
  `tracking_open` tinyint unsigned NOT NULL,
  `tracking_click` tinyint unsigned NOT NULL,
  `created_dt` DATETIME NOT NULL,
  `send_status` varchar(20) NOT NULL,
  `first_trigger_dt` DATETIME NOT NULL
);

CREATE TABLE `simplesend`.`send_email_log_list` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `send_email_list_id` int UNIQUE NOT NULL,
  `send_count` tinyint unsigned NOT NULL,
  `trigger_dt` DATETIME NOT NULL,
  `send_response_dt` DATETIME NOT NULL,
  `send_status_code` int NOT NULL,
  `send_message` varchar(255) NOT NULL
);

CREATE TABLE `simplesend`.`api_key_list` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `status` tinyint unsigned NOT NULL,
  `start_time` DATETIME NOT NULL,
  `expired_time` DATETIME NOT NULL
);

CREATE TABLE `simplesend`.`tracking_email_list` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `send_email_list_id` int UNIQUE NOT NULL,
  `tracking_type` varchar(20) NOT NULL,
  `recipient_country` varchar(255) NOT NULL,
  `recipient_browser` varchar(255) NOT NULL,
  `recipient_platform` varchar(255) NOT NULL,
  `public_ip` varchar(30) NOT NULL,
  `referer_url` varchar(255) NOT NULL,
  `trigger_dt` DATETIME NOT NULL
);

