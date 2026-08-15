-- Database Schema for Ciak Mania Magazine CMS
-- Può essere importato direttamente in phpMyAdmin (selezionando il database prima)

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `avatar` VARCHAR(5) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `profile_image` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `color` VARCHAR(20) NOT NULL,
  `desc` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `rating` DECIMAL(3,1) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `excerpt` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `date` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `tags` TEXT DEFAULT NULL,
  `keyword` VARCHAR(100) DEFAULT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `metaDesc` TEXT DEFAULT NULL,
  `views` INT DEFAULT 0,
  `comments` INT DEFAULT 0,
  `author` VARCHAR(100) NOT NULL,
  `technical_judgment` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `articleTitle` VARCHAR(255) NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `text` TEXT NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `status` VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `text` TEXT NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `folder` VARCHAR(20) DEFAULT 'inbox',
  `unread` TINYINT(1) DEFAULT 1,
  `starred` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user` VARCHAR(100) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `target` VARCHAR(255) NOT NULL,
  `time` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siteName` VARCHAR(255) NOT NULL,
  `siteDesc` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `url` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_read` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Utenti iniziali di prova (La password cifrata corrisponde a "password")
INSERT INTO `users` (`username`, `password`, `name`, `role`, `avatar`) VALUES
('admin', 'admin123', 'Leila Cimarelli', 'Admin', 'LC'),
('editor', 'editor123', '----------', 'Editor', '----------'),
('Redattori', 'Redattori123', '----------', 'Redattore', '----------')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Seed Impostazioni predefinite del sito
INSERT INTO `settings` (`id`, `siteName`, `siteDesc`) VALUES
(1, 'Ciak Mania Magazine', 'La tua dose quotidiana di grande cinema ed esclusive.')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Categorie Fondamentali Obbligatorie
INSERT INTO `categories` (`id`, `name`, `slug`, `color`, `desc`) VALUES
(1, 'Film', 'film', '#e50914', 'Tutti i film e le ultime novita cinematografiche'),
(2, 'Serie TV', 'serie-tv', '#0070f3', 'Recensioni e notizie sulle serie TV e streaming'),
(3, 'Recensioni', 'recensioni', '#ffb400', 'Tutte le recensioni con voto e giudizio critico'),
(4, 'Articoli', 'articoli', '#10b981', 'Approfondimenti, speciali ed interviste'),
(5, 'Classifiche', 'classifiche', '#ffa305', 'Articoli in classifica'),
(6, 'News', 'news', '#601f5e', 'Le news inerenti al mondo del cinema')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `slug`=VALUES(`slug`), `color`=VALUES(`color`), `desc`=VALUES(`desc`);

