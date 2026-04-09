-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           9.2.0 - MySQL Community Server - GPL
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Copiando estrutura para tabela is-industria.admin_users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela is-industria.admin_users: ~1 rows (aproximadamente)
INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `is_active`, `created_at`) VALUES
	(1, 'admin@isindustria.com.br', 'scrypt:32768:8:1$LOey2WJT4Ht6GWs5$5ee94bc471d985eeac4f5bd882f49bfe48539448e5f6497c0f9cd36c7876350a9d2b067cdd789464ac51e17cc59e891241f6d5a986d331f482f5b47ac6c43b04', 1, '2025-10-06 13:31:50');

-- Copiando estrutura para tabela is-industria.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('rascunho','publicada','pausada') NOT NULL DEFAULT 'rascunho',
  `titulo` varchar(160) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `localidade` varchar(160) NOT NULL,
  `tipo` varchar(60) NOT NULL,
  `modelo` varchar(60) NOT NULL,
  `salario` varchar(120) DEFAULT NULL,
  `resumo` varchar(240) DEFAULT NULL,
  `descricao_md` mediumtext NOT NULL,
  `requisitos_md` mediumtext,
  `beneficios_md` mediumtext,
  `dt_publicacao` datetime DEFAULT NULL,
  `dt_expiracao` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Copiando dados para a tabela is-industria.jobs: ~1 rows (aproximadamente)

-- Copiando estrutura para tabela is-industria.news
CREATE TABLE IF NOT EXISTS `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('rascunho','publicada','pausada') NOT NULL DEFAULT 'rascunho',
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `date` date NOT NULL,
  `tag` varchar(60) DEFAULT NULL,
  `excerpt` varchar(300) DEFAULT NULL,
  `content_md` mediumtext NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `dt_publicacao` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Copiando dados para a tabela is-industria.news: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
