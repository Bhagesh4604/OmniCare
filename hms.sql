-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: bhcy6ygyda4az3oau93j-mysql.services.clever-cloud.com:3306
-- Generation Time: Jan 07, 2026 at 01:18 PM
-- Server version: 8.0.22-13
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bhcy6ygyda4az3oau93j`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts_payable`
--

CREATE TABLE `accounts_payable` (
  `id` int NOT NULL,
  `invoiceNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `vendorName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `dueDate` date NOT NULL,
  `paymentStatus` enum('pending','paid','overdue','partial') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts_payable`
--

INSERT INTO `accounts_payable` (`id`, `invoiceNumber`, `vendorName`, `amount`, `dueDate`, `paymentStatus`, `description`) VALUES
(1, 'INV-AP-001', 'Medical Supplies Co.', 5420.00, '2025-10-15', 'pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `accounts_receivable`
--

CREATE TABLE `accounts_receivable` (
  `id` int NOT NULL,
  `invoiceNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `patientId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `dueDate` date NOT NULL,
  `paymentStatus` enum('pending','paid','overdue','partial') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`) VALUES
(1, 'admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--

CREATE TABLE `admissions` (
  `id` int NOT NULL,
  `patientId` int NOT NULL,
  `admissionDate` datetime NOT NULL,
  `dischargeDate` datetime DEFAULT NULL,
  `wardId` int DEFAULT NULL,
  `bedId` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admissions`
--

INSERT INTO `admissions` (`id`, `patientId`, `admissionDate`, `dischargeDate`, `wardId`, `bedId`, `notes`) VALUES
(16, 105, '2026-01-04 11:49:45', '2026-01-04 11:49:53', 3, 34, 'Assigned to bed'),
(17, 105, '2026-01-04 15:04:14', NULL, 2, 26, 'Assigned to bed');

-- --------------------------------------------------------

--
-- Table structure for table `ai_triage_logs`
--

CREATE TABLE `ai_triage_logs` (
  `id` int NOT NULL,
  `trip_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `ai_notes` text COLLATE utf8mb4_general_ci,
  `recommended_specialist` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `severity` enum('CRITICAL','HIGH','MEDIUM','LOW') COLLATE utf8mb4_general_ci DEFAULT 'MEDIUM',
  `injury_risk` enum('High','Medium','Low') COLLATE utf8mb4_general_ci DEFAULT 'Medium',
  `analysis_timestamp` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ambulancecrews`
--

CREATE TABLE `ambulancecrews` (
  `shift_id` int NOT NULL,
  `user_id` int NOT NULL,
  `ambulance_id` int NOT NULL,
  `shift_start_time` datetime NOT NULL,
  `shift_end_time` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ambulancecrews`
--

INSERT INTO `ambulancecrews` (`shift_id`, `user_id`, `ambulance_id`, `shift_start_time`, `shift_end_time`, `created_at`, `updated_at`) VALUES
(10, 15, 3, '2026-01-04 11:42:00', NULL, '2026-01-04 11:42:00', '2026-01-04 11:42:00');

-- --------------------------------------------------------

--
-- Table structure for table `ambulancelocationhistory`
--

CREATE TABLE `ambulancelocationhistory` (
  `location_id` int NOT NULL,
  `ambulance_id` int NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `timestamp` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ambulancelocationhistory`
--

INSERT INTO `ambulancelocationhistory` (`location_id`, `ambulance_id`, `latitude`, `longitude`, `timestamp`, `created_at`) VALUES
(1, 1, 28.7041000, 77.1025000, '2025-11-12 03:28:17', '2025-11-12 03:28:19'),
(2, 1, 12.9433600, 77.5946240, '2025-11-12 03:30:11', '2025-11-12 03:30:14'),
(3, 1, 12.9438600, 77.5951240, '2025-11-12 03:32:02', '2025-11-12 03:32:04'),
(4, 1, 12.9443600, 77.5956240, '2025-11-12 03:32:07', '2025-11-12 03:32:07'),
(5, 1, 12.9448600, 77.5961240, '2025-11-12 03:32:10', '2025-11-12 03:32:10'),
(6, 1, 12.9453600, 77.5966240, '2025-11-12 03:32:13', '2025-11-12 03:32:13'),
(7, 1, 12.9458600, 77.5971240, '2025-11-12 03:32:16', '2025-11-12 03:32:16'),
(8, 1, 12.9463600, 77.5976240, '2025-11-12 03:32:19', '2025-11-12 03:32:19'),
(9, 1, 12.9468600, 77.5981240, '2025-11-12 03:32:22', '2025-11-12 03:32:22'),
(10, 1, 12.9473600, 77.5986240, '2025-11-12 03:32:25', '2025-11-12 03:32:25'),
(11, 1, 12.9478600, 77.5991240, '2025-11-12 03:32:28', '2025-11-12 03:32:28'),
(12, 1, 12.9483600, 77.5996240, '2025-11-12 03:32:31', '2025-11-12 03:32:31'),
(13, 2, 12.9433600, 77.5946240, '2025-11-12 04:38:31', '2025-11-12 04:38:33'),
(14, 1, 12.9483600, 77.5996240, '2025-11-12 12:02:45', '2025-11-12 12:02:45'),
(15, 2, 12.9433600, 77.5946240, '2025-12-25 19:01:59', '2025-12-25 19:01:59'),
(16, 1, 12.9483600, 77.5996240, '2025-12-30 12:04:28', '2025-12-30 12:04:28'),
(17, 1, 12.9483600, 77.5996240, '2025-12-30 12:04:54', '2025-12-30 12:04:54'),
(18, 1, 12.9483600, 77.5996240, '2025-12-30 12:06:02', '2025-12-30 12:06:02'),
(19, 1, 12.9483600, 77.5996240, '2025-12-30 12:13:49', '2025-12-30 12:13:49'),
(20, 3, 13.0491123, 77.5770381, '2025-12-30 12:18:08', '2025-12-30 12:18:08'),
(21, 3, 13.0491123, 77.5770381, '2025-12-30 12:18:10', '2025-12-30 12:18:10'),
(22, 3, 12.9859584, 77.6044544, '2025-12-30 12:18:18', '2025-12-30 12:18:18'),
(23, 3, 12.9859584, 77.6044544, '2025-12-30 12:18:43', '2025-12-30 12:18:43'),
(24, 3, 12.9859584, 77.6044544, '2025-12-30 12:18:45', '2025-12-30 12:18:45'),
(25, 3, 12.9859584, 77.6044544, '2025-12-30 12:18:53', '2025-12-30 12:18:53'),
(26, 3, 12.9859584, 77.6044544, '2025-12-30 12:19:12', '2025-12-30 12:19:12'),
(27, 3, 12.9859584, 77.6044544, '2025-12-30 12:19:12', '2025-12-30 12:19:12'),
(28, 3, 12.9859584, 77.6044544, '2025-12-30 12:19:14', '2025-12-30 12:19:14'),
(29, 3, 12.9859584, 77.6044544, '2025-12-30 12:19:15', '2025-12-30 12:19:15'),
(30, 3, 12.9859584, 77.6044544, '2025-12-30 12:19:36', '2025-12-30 12:19:36'),
(31, 3, 12.9859584, 77.6044544, '2025-12-30 12:19:38', '2025-12-30 12:19:38'),
(32, 3, 13.0491307, 77.5770507, '2025-12-30 12:19:46', '2025-12-30 12:19:47'),
(33, 3, 13.0491307, 77.5770507, '2025-12-30 12:22:47', '2025-12-30 12:22:47'),
(34, 3, 13.0491307, 77.5770507, '2025-12-30 12:22:49', '2025-12-30 12:22:49'),
(35, 3, 13.0491307, 77.5770507, '2025-12-30 12:24:55', '2025-12-30 12:24:55'),
(36, 3, 13.0491307, 77.5770507, '2025-12-30 12:25:18', '2025-12-30 12:25:18'),
(37, 3, 13.0491307, 77.5770507, '2025-12-30 12:25:20', '2025-12-30 12:25:20'),
(38, 3, 13.0491295, 77.5770614, '2025-12-30 12:25:28', '2025-12-30 12:25:28'),
(39, 3, 13.0491295, 77.5770614, '2025-12-30 12:28:52', '2025-12-30 12:28:52'),
(40, 3, 13.0491295, 77.5770614, '2025-12-30 12:29:07', '2025-12-30 12:29:07'),
(41, 3, 13.0491295, 77.5770614, '2025-12-30 12:29:07', '2025-12-30 12:29:07'),
(42, 3, 13.0491295, 77.5770614, '2025-12-30 12:29:09', '2025-12-30 12:29:09'),
(43, 3, 13.0491295, 77.5770614, '2025-12-30 12:35:34', '2025-12-30 12:35:34'),
(44, 3, 13.0491295, 77.5770614, '2025-12-30 12:43:15', '2025-12-30 12:43:15'),
(45, 3, 12.9859584, 77.6044544, '2025-12-30 12:43:35', '2025-12-30 12:43:35'),
(46, 3, 12.9859584, 77.6044544, '2025-12-30 12:43:35', '2025-12-30 12:43:35'),
(47, 3, 12.9859584, 77.6044544, '2025-12-30 12:43:37', '2025-12-30 12:43:37'),
(48, 3, 12.9859584, 77.6044544, '2025-12-30 12:43:44', '2025-12-30 12:43:44'),
(49, 3, 12.9859584, 77.6044544, '2025-12-30 12:43:44', '2025-12-30 12:43:44'),
(50, 3, 12.9859584, 77.6044544, '2025-12-30 12:43:46', '2025-12-30 12:43:46'),
(51, 3, 12.9859584, 77.6044544, '2025-12-30 12:54:50', '2025-12-30 12:54:50'),
(52, 3, 12.9859584, 77.6044544, '2025-12-30 12:55:20', '2025-12-30 12:55:20'),
(53, 3, 12.9859584, 77.6044544, '2025-12-30 12:55:20', '2025-12-30 12:55:20'),
(54, 3, 12.9859584, 77.6044544, '2025-12-30 12:55:22', '2025-12-30 12:55:22'),
(55, 3, 12.9859584, 77.6044544, '2025-12-30 12:57:55', '2025-12-30 12:57:56'),
(56, 3, 12.9859584, 77.6044544, '2025-12-30 12:57:57', '2025-12-30 12:57:57'),
(57, 3, 12.9859584, 77.6044544, '2025-12-30 12:58:23', '2025-12-30 12:58:23'),
(58, 3, 12.9859584, 77.6044544, '2025-12-30 12:58:47', '2025-12-30 12:58:47'),
(59, 3, 12.9859584, 77.6044544, '2025-12-30 12:58:47', '2025-12-30 12:58:47'),
(60, 3, 12.9859584, 77.6044544, '2025-12-30 12:58:49', '2025-12-30 12:58:49'),
(61, 3, 12.9859584, 77.6044544, '2025-12-30 12:59:17', '2025-12-30 12:59:17'),
(62, 3, 12.9859584, 77.6044544, '2025-12-30 12:59:17', '2025-12-30 12:59:17'),
(63, 3, 12.9859584, 77.6044544, '2025-12-30 12:59:19', '2025-12-30 12:59:19'),
(64, 3, 12.9859584, 77.6044544, '2025-12-30 12:59:26', '2025-12-30 12:59:26'),
(65, 3, 12.9859584, 77.6044544, '2025-12-30 12:59:26', '2025-12-30 12:59:26'),
(66, 3, 12.9859584, 77.6044544, '2025-12-30 13:01:19', '2025-12-30 13:01:19'),
(67, 3, 12.9859584, 77.6044544, '2025-12-30 13:01:32', '2025-12-30 13:01:32'),
(68, 3, 12.9859584, 77.6044544, '2025-12-30 13:01:34', '2025-12-30 13:01:34'),
(69, 3, 12.9859584, 77.6044544, '2025-12-30 13:02:14', '2025-12-30 13:02:14'),
(70, 3, 12.9859584, 77.6044544, '2025-12-30 13:02:16', '2025-12-30 13:02:16'),
(71, 3, 12.9859584, 77.6044544, '2025-12-30 13:02:44', '2025-12-30 13:02:44'),
(72, 3, 12.9859584, 77.6044544, '2025-12-30 13:02:44', '2025-12-30 13:02:44'),
(73, 3, 12.9859584, 77.6044544, '2025-12-30 13:02:46', '2025-12-30 13:02:46'),
(74, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:02', '2025-12-30 13:03:02'),
(75, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:02', '2025-12-30 13:03:02'),
(76, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:04', '2025-12-30 13:03:04'),
(77, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:14', '2025-12-30 13:03:15'),
(78, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:31', '2025-12-30 13:03:31'),
(79, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:35', '2025-12-30 13:03:35'),
(80, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:37', '2025-12-30 13:03:37'),
(81, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:48', '2025-12-30 13:03:48'),
(82, 3, 12.9859584, 77.6044544, '2025-12-30 13:03:50', '2025-12-30 13:03:50'),
(83, 3, 12.9859584, 77.6044544, '2025-12-30 13:05:22', '2025-12-30 13:05:23'),
(84, 3, 12.9859584, 77.6044544, '2025-12-30 13:05:24', '2025-12-30 13:05:24'),
(85, 3, 12.9859584, 77.6044544, '2025-12-30 13:05:33', '2025-12-30 13:05:33'),
(86, 3, 12.9859584, 77.6044544, '2025-12-30 13:05:35', '2025-12-30 13:05:35'),
(87, 3, 12.9859584, 77.6044544, '2025-12-30 13:05:58', '2025-12-30 13:05:58'),
(88, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:06', '2025-12-30 13:06:06'),
(89, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:06', '2025-12-30 13:06:06'),
(90, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:07', '2025-12-30 13:06:07'),
(91, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:08', '2025-12-30 13:06:08'),
(92, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:27', '2025-12-30 13:06:27'),
(93, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:29', '2025-12-30 13:06:29'),
(94, 3, 13.0491180, 77.5770166, '2025-12-30 13:06:49', '2025-12-30 13:06:49'),
(95, 3, 13.0491222, 77.5770157, '2025-12-30 13:06:58', '2025-12-30 13:06:58'),
(96, 3, 13.0491222, 77.5770157, '2025-12-30 13:07:00', '2025-12-30 13:07:00'),
(97, 3, 12.9859584, 77.6044544, '2025-12-30 13:07:01', '2025-12-30 13:07:01'),
(98, 3, 12.9859584, 77.6044544, '2025-12-30 13:07:34', '2025-12-30 13:07:34'),
(99, 3, 12.9859584, 77.6044544, '2025-12-30 13:07:34', '2025-12-30 13:07:34'),
(100, 3, 12.9859584, 77.6044544, '2025-12-30 13:08:04', '2025-12-30 13:08:04'),
(101, 3, 12.9859584, 77.6044544, '2025-12-30 13:08:16', '2025-12-30 13:08:16'),
(102, 3, 12.9859584, 77.6044544, '2025-12-30 13:08:16', '2025-12-30 13:08:16'),
(103, 3, 12.9859584, 77.6044544, '2025-12-30 13:08:18', '2025-12-30 13:08:18'),
(104, 3, 12.9859584, 77.6044544, '2025-12-30 13:08:59', '2025-12-30 13:09:00'),
(105, 3, 12.9859584, 77.6044544, '2025-12-30 13:08:59', '2025-12-30 13:09:00');

-- --------------------------------------------------------

--
-- Table structure for table `ambulances`
--

CREATE TABLE `ambulances` (
  `ambulance_id` int NOT NULL,
  `vehicle_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `license_plate` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `current_status` enum('Available','On_Trip','Off_Duty','Maintenance') COLLATE utf8mb4_general_ci DEFAULT 'Available',
  `current_trip_id` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ambulances`
--

INSERT INTO `ambulances` (`ambulance_id`, `vehicle_name`, `license_plate`, `current_status`, `current_trip_id`, `created_at`, `updated_at`) VALUES
(1, 'Ambulance 01', 'KA01EM0001', 'Available', NULL, '2025-11-10 08:30:00', '2026-01-03 17:34:28'),
(2, 'Ambulance 02', 'KA01EM0002', 'Available', NULL, '2025-11-10 08:30:00', '2026-01-03 17:34:30'),
(3, 'ALPHA', 'KA 28 9797', 'Available', NULL, '2025-12-29 15:24:24', '2026-01-03 17:34:24');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int NOT NULL,
  `appointmentDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notes` text COLLATE utf8mb4_general_ci,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'scheduled',
  `consultationType` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patientId`, `doctorId`, `appointmentDate`, `notes`, `status`, `consultationType`) VALUES
(69, 105, 13, '2026-01-05 03:30:00', '', 'scheduled', 'in-person'),
(70, 105, 13, '2026-01-05 03:30:00', '', 'scheduled', 'in-person'),
(71, 105, 13, '2026-01-05 05:30:00', '', 'scheduled', 'virtual'),
(72, 105, 13, '2026-01-05 05:30:00', '', 'scheduled', 'in-person'),
(73, 105, 13, '2026-01-05 03:30:00', '', 'scheduled', 'in-person'),
(74, 105, 13, '2026-01-06 08:30:00', '', 'scheduled', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `beds`
--

CREATE TABLE `beds` (
  `id` int NOT NULL,
  `bedNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `wardId` int DEFAULT NULL,
  `status` enum('available','occupied','maintenance','reserved','cleaning') COLLATE utf8mb4_general_ci DEFAULT 'available',
  `patientId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beds`
--

INSERT INTO `beds` (`id`, `bedNumber`, `wardId`, `status`, `patientId`) VALUES
(1, 'ICU-001', 1, 'available', NULL),
(2, 'ICU-002', 1, 'available', NULL),
(3, 'GA-001', 2, 'available', NULL),
(4, 'GA-002', 2, 'available', NULL),
(5, 'GA-003', 2, 'available', NULL),
(6, 'GA-004', 2, 'available', NULL),
(7, 'GA-005', 2, 'available', NULL),
(8, 'GA-006', 2, 'available', NULL),
(9, 'GA-007', 2, 'available', NULL),
(10, 'GA-008', 2, 'available', NULL),
(11, 'GA-009', 2, 'available', NULL),
(12, 'GA-010', 2, 'available', NULL),
(13, 'GA-011', 2, 'available', NULL),
(14, 'GA-012', 2, 'available', NULL),
(15, 'GA-013', 2, 'available', NULL),
(16, 'GA-014', 2, 'available', NULL),
(17, 'GA-015', 2, 'available', NULL),
(18, 'GA-016', 2, 'available', NULL),
(19, 'GA-017', 2, 'reserved', NULL),
(20, 'GA-018', 2, 'available', NULL),
(21, 'GA-019', 2, 'available', NULL),
(22, 'GA-020', 2, 'available', NULL),
(23, 'GA-021', 2, 'available', NULL),
(24, 'GA-022', 2, 'available', NULL),
(25, 'GA-023', 2, 'available', NULL),
(26, 'GA-024', 2, 'occupied', 105),
(27, 'GA-025', 2, 'available', NULL),
(28, 'CW-001', 3, 'available', NULL),
(29, 'CW-002', 3, 'maintenance', NULL),
(30, 'CW-003', 3, 'cleaning', NULL),
(31, 'CW-004', 3, 'available', NULL),
(32, 'CW-005', 3, 'maintenance', NULL),
(33, 'CW-006', 3, 'reserved', NULL),
(34, 'CW-007', 3, 'available', NULL),
(35, 'CW-008', 3, 'available', NULL),
(36, 'CW-009', 2, 'available', NULL),
(37, 'CW-010', 3, 'available', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

CREATE TABLE `bill_items` (
  `id` int NOT NULL,
  `billId` int NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `serviceReference` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blockchain_ledger`
--

CREATE TABLE `blockchain_ledger` (
  `index` int NOT NULL,
  `timestamp` bigint NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `previousHash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ;

--
-- Dumping data for table `blockchain_ledger`
--

INSERT INTO `blockchain_ledger` (`index`, `timestamp`, `data`, `previousHash`, `hash`) VALUES
(0, 1767017445352, '\"Genesis Block\"', '0', 'a11d89b4fa830e694c94b380813182acaff22feeb6d8d10b160997266f2a6fbc'),
(1, 1767017445852, '{\"patient\":\"Test Patient\",\"action\":\"VERIFY_PERSISTENCE_1767017445851\"}', 'a11d89b4fa830e694c94b380813182acaff22feeb6d8d10b160997266f2a6fbc', 'eb0387599fce8b0413da17771f2beb49ebead96bc4c176fbd0eaf8ae79b98b9a'),
(2, 1767017501012, '{\"patient\":\"Test Patient\",\"action\":\"VERIFY_PERSISTENCE_1767017501012\"}', 'eb0387599fce8b0413da17771f2beb49ebead96bc4c176fbd0eaf8ae79b98b9a', 'c094a322f1288d80076864d8d0968966495a7f253ba09714b267fdaca646a91e'),
(4, 1767509858722, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-1767509858665\",\"manufacturer\":\"OmniCare Pharma\",\"expiryDate\":\"2026-12-31\",\"quantity\":100,\"timestamp\":1767509858722}', '902989ed1930571d536f6dc674d7976ebc1abe74e355eb6f0dd63b4e95dbc023', 'b840acfa620fe3813fcdd7a87c1225f4d1ee6ac439cf09efa8d70893ea056be9'),
(5, 1767511021517, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-FAIR-1767511021487\",\"manufacturer\":\"OmniCare Pharma\",\"expiryDate\":\"2026-12-31\",\"quantity\":1000,\"price\":40,\"timestamp\":1767511021517}', '902989ed1930571d536f6dc674d7976ebc1abe74e355eb6f0dd63b4e95dbc023', '021d284819626895d499adc0a9e847a86b4b51dded9a22bb19a3238927ee0ed6'),
(6, 1767511021531, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-EXPENSIVE-1767511021487\",\"manufacturer\":\"Greedy Pharma Inc.\",\"expiryDate\":\"2026-12-31\",\"quantity\":500,\"price\":60,\"timestamp\":1767511021531}', '021d284819626895d499adc0a9e847a86b4b51dded9a22bb19a3238927ee0ed6', '88ecc6e895a521eef9a010f343e8938ed59665939d20c5ae6097e916dd2d49a1'),
(7, 1767511036995, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-FAIR-1767511036971\",\"manufacturer\":\"OmniCare Pharma\",\"expiryDate\":\"2026-12-31\",\"quantity\":1000,\"price\":40,\"timestamp\":1767511036995}', '88ecc6e895a521eef9a010f343e8938ed59665939d20c5ae6097e916dd2d49a1', '3a988180ab203c30487c2bd3de1369a12b09b31a2aa5bdba3d5ee16998a6121f'),
(8, 1767511037006, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-EXPENSIVE-1767511036971\",\"manufacturer\":\"Greedy Pharma Inc.\",\"expiryDate\":\"2026-12-31\",\"quantity\":500,\"price\":60,\"timestamp\":1767511037006}', '3a988180ab203c30487c2bd3de1369a12b09b31a2aa5bdba3d5ee16998a6121f', '8d43e428b2611cd8eeff54bffd82752d815656c22df70e32009bfde2619daf59'),
(9, 1767511059891, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-FAIR-1767511059865\",\"manufacturer\":\"OmniCare Pharma\",\"expiryDate\":\"2026-12-31\",\"quantity\":1000,\"price\":40,\"timestamp\":1767511059891}', '8d43e428b2611cd8eeff54bffd82752d815656c22df70e32009bfde2619daf59', '219f62b1b9b337e04123fecab843afc5e93c1184d445dcb2381dc9e229d90cea'),
(10, 1767511059902, '{\"event\":\"BATCH_CREATED\",\"medicineId\":1,\"batchNumber\":\"BATCH-EXPENSIVE-1767511059865\",\"manufacturer\":\"Greedy Pharma Inc.\",\"expiryDate\":\"2026-12-31\",\"quantity\":500,\"price\":60,\"timestamp\":1767511059902}', '219f62b1b9b337e04123fecab843afc5e93c1184d445dcb2381dc9e229d90cea', '1c6ee11fba665891fcd5a72e47c4d8fa7a9e6e5c4d773867000c8fd9236ab306'),
(12, 1767522950899, '{\"event\":\"BATCH_CREATED\",\"medicineId\":\"3\",\"batchNumber\":\"BATCH123\",\"manufacturer\":\"Microsoft\",\"expiryDate\":\"2026-01-04\",\"quantity\":\"100\",\"price\":\"10\",\"timestamp\":1767522950899}', '902989ed1930571d536f6dc674d7976ebc1abe74e355eb6f0dd63b4e95dbc023', '6f39c1d9df7fc298319754ce4ea6cb0720c6d706562e21b3bb00b751994581ac'),
(15, 1767513024158, '{\"event\":\"BATCH_CREATED\",\"medicineId\":\"1\",\"batchNumber\":\"BATCH123456\",\"manufacturer\":\"OmniPharma\",\"expiryDate\":\"2026-01-04\",\"quantity\":\"500\",\"price\":\"15\",\"timestamp\":1767513024158}', '11d109375a224c89815a888faa910b0c0601c468e7425ec5088957f0e334fd8a', 'a1b377a277b5b87cde36fdf247bc0044012618e169a5e864df9bea0f5d59b7f6'),
(2147483647, 2025, '{\"patientId\":\"PAT6853\",\"doctorId\":\"DR-SESSION-USER\",\"action\":\"VIEW_FULL_HISTORY\"}', 'c094a322f1288d80076864d8d0968966495a7f253ba09714b267fdaca646a91e', '902989ed1930571d536f6dc674d7976ebc1abe74e355eb6f0dd63b4e95dbc023');

-- --------------------------------------------------------

--
-- Table structure for table `cardiac_risk_alerts`
--

CREATE TABLE `cardiac_risk_alerts` (
  `alert_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `alert_type` enum('Tachycardia','Bradycardia','Arrhythmia','Pre_Event_Warning','SpO2_Drop') COLLATE utf8mb4_general_ci NOT NULL,
  `severity` enum('Low','Medium','High','Critical') COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_resolved` tinyint(1) DEFAULT '0',
  `resolved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`) VALUES
(1, 'Emergency', 'Emergency care and trauma'),
(2, 'Cardiology', 'Heart and cardiovascular care'),
(3, 'Pediatrics', 'Child healthcare'),
(4, 'Orthopedics', 'Bone and joint care'),
(5, 'Pharmacy', 'Medication dispensary');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `username`, `password`) VALUES
(1, 'doctor', 'doctor');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_schedules`
--

CREATE TABLE `doctor_schedules` (
  `id` int NOT NULL,
  `doctorId` int NOT NULL,
  `dayOfWeek` int NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  `startTime` time NOT NULL,
  `endTime` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_schedules`
--

INSERT INTO `doctor_schedules` (`id`, `doctorId`, `dayOfWeek`, `startTime`, `endTime`) VALUES
(42, 12, 0, '09:00:00', '17:00:00'),
(43, 12, 1, '09:00:00', '17:00:00'),
(44, 12, 2, '09:00:00', '17:00:00'),
(45, 12, 3, '09:00:00', '17:00:00'),
(46, 12, 4, '09:00:00', '17:00:00'),
(47, 12, 5, '09:00:00', '17:00:00'),
(48, 12, 6, '09:00:00', '17:00:00'),
(49, 13, 0, '09:00:00', '17:00:00'),
(50, 13, 1, '09:00:00', '17:00:00'),
(51, 13, 2, '09:00:00', '17:00:00'),
(52, 13, 3, '09:00:00', '17:00:00'),
(53, 13, 4, '09:00:00', '17:00:00'),
(54, 13, 5, '09:00:00', '17:00:00'),
(55, 13, 6, '09:00:00', '17:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `emergencytrips`
--

CREATE TABLE `emergencytrips` (
  `trip_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('New_Alert','Assigned','En_Route_To_Scene','At_Scene','Transporting','At_Hospital','Completed','Cancelled') COLLATE utf8mb4_general_ci DEFAULT 'New_Alert',
  `alert_source` enum('AcciRadar','Manual_Entry') COLLATE utf8mb4_general_ci NOT NULL,
  `scene_location_lat` decimal(10,7) NOT NULL,
  `scene_location_lon` decimal(10,7) NOT NULL,
  `alert_timestamp` datetime NOT NULL,
  `assigned_ambulance_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `patient_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `eta_minutes` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `booked_by_patient_id` int DEFAULT NULL,
  `assignment_timestamp` datetime DEFAULT NULL,
  `completion_timestamp` datetime DEFAULT NULL,
  `trip_image_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verification_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `verification_reason` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergencytrips`
--

INSERT INTO `emergencytrips` (`trip_id`, `status`, `alert_source`, `scene_location_lat`, `scene_location_lon`, `alert_timestamp`, `assigned_ambulance_id`, `created_at`, `updated_at`, `patient_name`, `notes`, `eta_minutes`, `patient_id`, `booked_by_patient_id`, `assignment_timestamp`, `completion_timestamp`, `trip_image_url`, `verification_status`, `verification_reason`) VALUES
('ER-1762784116456-15411', 'Completed', 'Manual_Entry', 13.0491431, 77.5770453, '2025-11-10 14:15:16', 1, '2025-11-10 14:15:16', '2025-11-12 03:49:35', 'Bhagesh', 'Accident', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762792556241-96702', 'Completed', 'Manual_Entry', 13.0490416, 77.5768769, '2025-11-10 16:35:56', 2, '2025-11-10 16:35:56', '2025-11-12 03:49:28', 'dsfwed', 'asd', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762874079359-40417', 'Completed', 'Manual_Entry', 12.9433600, 12.9433678, '2025-11-11 15:14:39', 1, '2025-11-11 15:14:39', '2025-11-12 03:50:24', 'Bhagesh', 'qwe', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762874405167-33442', 'Completed', 'Manual_Entry', 12.9433600, 77.5946240, '2025-11-11 15:20:05', 1, '2025-11-11 15:20:05', '2025-11-12 04:06:24', 'qwsdfvg', 'asd', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762920704808-56754', 'Completed', 'Manual_Entry', 12.9448273, 77.5969198, '2025-11-12 04:11:44', 1, '2025-11-12 04:11:44', '2025-11-12 04:28:57', 'qwsdfvg', 'asdfg', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762921416866-44045', 'Completed', 'Manual_Entry', 13.0640560, 77.5899043, '2025-11-12 04:23:36', 2, '2025-11-12 04:23:36', '2025-11-12 04:28:55', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762922442372-85964', 'Completed', 'Manual_Entry', 13.0655414, 77.5937294, '2025-11-12 04:40:42', 1, '2025-11-12 04:40:42', '2025-11-12 05:00:54', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762922505937-79934', 'Completed', 'Manual_Entry', 13.0642632, 77.5899206, '2025-11-12 04:41:45', 2, '2025-11-12 04:41:45', '2025-11-12 05:00:52', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762923708439-15858', 'Completed', 'Manual_Entry', 13.0642632, 77.5899206, '2025-11-12 05:01:48', 1, '2025-11-12 05:01:48', '2025-11-12 07:39:56', 'bhagesh', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762923766555-62410', 'Completed', 'Manual_Entry', 13.0669305, 77.5859251, '2025-11-12 05:02:46', 2, '2025-11-12 05:02:46', '2025-11-12 05:15:00', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762924643717-91444', 'Completed', 'Manual_Entry', 13.0669305, 77.5859251, '2025-11-12 05:17:23', 2, '2025-11-12 05:17:23', '2025-11-12 05:22:39', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762926073021-32534', 'Completed', 'Manual_Entry', 13.0669305, 77.5859251, '2025-11-12 05:41:13', 2, '2025-11-12 05:41:13', '2025-11-12 05:56:08', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762926395499-25893', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 05:46:35', 1, '2025-11-12 05:46:35', '2025-11-12 07:06:26', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762927353291-7646', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 06:02:33', 2, '2025-11-12 06:02:33', '2025-11-12 06:03:16', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762927684065-34591', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 06:08:04', 2, '2025-11-12 06:08:04', '2025-11-12 06:43:12', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762928501191-12423', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 06:21:41', 1, '2025-11-12 06:21:41', '2025-11-12 06:43:13', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762929813368-61173', 'Completed', 'Manual_Entry', 12.9433600, 77.5946240, '2025-11-12 06:43:33', 2, '2025-11-12 06:43:33', '2025-11-12 07:05:15', '', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762931046013-26003', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:04:06', 1, '2025-11-12 07:04:06', '2025-11-12 07:04:59', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762931138029-92646', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:05:38', 2, '2025-11-12 07:05:38', '2025-11-12 07:06:42', '', '', 22, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762931268364-17328', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:07:48', 1, '2025-11-12 07:07:48', '2025-11-12 07:19:45', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762932003961-32824', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:20:03', 2, '2025-11-12 07:20:03', '2025-11-12 07:24:07', '', '', 22, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762932262258-86128', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:24:22', 1, '2025-11-12 07:24:22', '2025-11-12 07:28:56', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762932551359-25039', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:29:11', 1, '2025-11-12 07:29:11', '2025-11-12 07:34:58', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762932913872-77990', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:35:13', 1, '2025-11-12 07:35:13', '2025-11-12 07:35:43', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762933218863-79383', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:40:18', 1, '2025-11-12 07:40:18', '2025-11-12 07:40:43', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762933258480-34442', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 07:40:58', 1, '2025-11-12 07:40:58', '2025-11-12 08:58:02', '', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762937951422-17197', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 08:59:11', 1, '2025-11-12 08:59:11', '2025-11-12 09:23:18', 'Bhagesh Biradar.', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762940276606-20714', 'Completed', 'Manual_Entry', 13.0687978, 77.5804924, '2025-11-12 09:37:56', 1, '2025-11-12 09:37:56', '2025-11-12 09:42:09', 'Bhagesh Biradar.', '', 23, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762942875985-66395', 'Cancelled', '', 13.0561963, 77.5770275, '2025-11-12 10:21:15', NULL, '2025-11-12 10:21:15', '2025-11-12 11:56:57', 'Bhagesh Biradar.', 'near GR Mart', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762943238043-84533', 'Cancelled', '', 13.0561963, 77.5770275, '2025-11-12 10:27:18', NULL, '2025-11-12 10:27:18', '2025-11-12 11:53:34', 'Bhagesh Biradar.', 'near gr mart', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762943445406-33327', 'Cancelled', '', 13.0561963, 77.5770275, '2025-11-12 10:30:45', NULL, '2025-11-12 10:30:45', '2025-11-12 11:51:32', 'Bhagesh Biradar.', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762948699576-53811', 'Cancelled', '', 13.0561963, 77.5770275, '2025-11-12 11:58:19', NULL, '2025-11-12 11:58:19', '2025-11-12 11:58:31', 'Bhagesh Biradar.', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762948825018-24975', 'Cancelled', '', 13.0561963, 77.5770275, '2025-11-12 12:00:25', NULL, '2025-11-12 12:00:25', '2025-11-12 12:00:31', 'Bhagesh Biradar.', '', NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1762948965819-41543', 'Completed', '', 13.0561963, 77.5770275, '2025-11-12 12:02:45', 1, '2025-11-12 12:02:45', '2025-12-29 15:14:10', 'Bhagesh Biradar.', '', NULL, NULL, NULL, '2025-11-12 12:02:45', NULL, NULL, 'Pending', NULL),
('ER-1766689319774-7154', 'Cancelled', '', 13.0484843, 77.5773853, '2025-12-25 19:01:59', 2, '2025-12-25 19:01:59', '2025-12-25 19:04:59', 'Bhagesh Biradar.', '', NULL, NULL, NULL, '2025-12-25 19:01:59', NULL, NULL, 'Pending', NULL),
('ER-1766720035980-101', 'Completed', '', 12.9716000, 77.5946000, '2025-12-26 03:33:55', 2, '2025-12-26 03:33:55', '2025-12-29 15:11:27', NULL, NULL, 6, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1767091794576-7509', 'Completed', '', 12.9716000, 77.5946000, '2025-12-30 10:49:54', 3, '2025-12-30 10:49:54', '2025-12-30 11:52:04', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1767091879036-5177', 'Completed', '', 12.9716000, 77.5946000, '2025-12-30 10:51:19', 2, '2025-12-30 10:51:19', '2025-12-30 12:05:39', NULL, NULL, 6, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1767092260015-12181', 'Completed', 'Manual_Entry', 12.9859584, 77.6044544, '2025-12-30 10:57:40', 1, '2025-12-30 10:57:40', '2025-12-30 11:52:00', 'Bhagesh Bbb', 'heart attack', 9, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1767096268949-37435', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 12:04:28', 1, '2025-12-30 12:04:28', '2025-12-30 12:04:43', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767096268943-374510491.jpg]', NULL, NULL, NULL, '2025-12-30 12:04:28', NULL, NULL, 'Pending', NULL),
('ER-1767096294893-23477', 'Completed', '', 12.9859584, 77.6044544, '2025-12-30 12:04:54', 1, '2025-12-30 12:04:54', '2025-12-30 12:05:38', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767096294890-670559844.jpg]', NULL, NULL, NULL, '2025-12-30 12:04:54', NULL, NULL, 'Pending', NULL),
('ER-1767096362909-40369', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 12:06:02', 1, '2025-12-30 12:06:02', '2025-12-30 12:11:37', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767096362902-574197295.jpg]', NULL, NULL, NULL, '2025-12-30 12:06:02', NULL, NULL, 'Pending', NULL),
('ER-1767096829582-59151', 'Completed', '', 13.0491123, 77.5770381, '2025-12-30 12:13:49', 1, '2025-12-30 12:13:49', '2025-12-30 12:16:29', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767096829577-511851183.jpg]', NULL, NULL, NULL, '2025-12-30 12:13:49', NULL, NULL, 'Pending', NULL),
('ER-1767097037446-45198', 'Cancelled', '', 13.0491123, 77.5770381, '2025-12-30 12:17:17', 3, '2025-12-30 12:17:17', '2025-12-30 12:24:42', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767097037443-285886570.jpg]', 0, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL),
('ER-1767097495971-46028', 'Cancelled', '', 13.0491307, 77.5770507, '2025-12-30 12:24:55', 3, '2025-12-30 12:24:55', '2025-12-30 12:28:41', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767097495964-331824097.jpg]', 0, NULL, NULL, '2025-12-30 12:24:55', NULL, NULL, 'Pending', NULL),
('ER-1767097732162-8388', 'Cancelled', '', 13.0491295, 77.5770614, '2025-12-30 12:28:52', 3, '2025-12-30 12:28:52', '2025-12-30 12:35:16', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767097732155-901121884.jpg]', 0, NULL, NULL, '2025-12-30 12:28:52', NULL, '/uploads/accidents/accident-1767097732155-901121884.jpg', 'Pending', NULL),
('ER-1767098134179-31121', 'Completed', '', 13.0491295, 77.5770614, '2025-12-30 12:35:34', 3, '2025-12-30 12:35:34', '2025-12-30 12:37:04', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767098130344-394703551.jpg]', NULL, NULL, NULL, '2025-12-30 12:35:34', NULL, '/uploads/accidents/accident-1767098130344-394703551.jpg', 'Error', 'AI service unavailable.'),
('ER-1767098595550-65114', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 12:43:15', 3, '2025-12-30 12:43:15', '2025-12-30 12:52:29', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767098592048-444180368.jpg]', 0, NULL, NULL, '2025-12-30 12:43:15', NULL, '/uploads/accidents/accident-1767098592048-444180368.jpg', 'Error', 'AI service unavailable.'),
('ER-1767099290073-10216', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 12:54:50', 3, '2025-12-30 12:54:50', '2025-12-30 12:58:12', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767099285516-123687008.jpg]', 0, NULL, NULL, '2025-12-30 12:54:50', NULL, '/uploads/accidents/accident-1767099285516-123687008.jpg', 'Error', 'AI service unavailable: 413 Request body too large for gpt-4o model. Max size: 8000 tokens.'),
('ER-1767099503772-67340', 'Completed', '', 12.9859584, 77.6044544, '2025-12-30 12:58:23', 3, '2025-12-30 12:58:23', '2025-12-30 12:59:29', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767099503761-240391196.jpg]', 0, NULL, NULL, '2025-12-30 12:58:23', NULL, '/uploads/accidents/accident-1767099503761-240391196.jpg', 'Error', 'AI service unavailable: Jimp.read is not a function'),
('ER-1767099679974-8752', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 13:01:19', 3, '2025-12-30 13:01:19', '2025-12-30 13:03:19', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767099679027-94737379.jpg]', 0, NULL, NULL, '2025-12-30 13:01:19', NULL, '/uploads/accidents/accident-1767099679027-94737379.jpg', 'Error', 'AI service unavailable: [\n  {\n    \"code\": \"invalid_union\",\n    \"unionErrors\": [\n      {\n        \"issues\": [\n          {\n            \"code\": \"invalid_type\",\n            \"expected\": \"object\",\n            \"received\": \"number\",\n            \"path\": [],\n            \"message\": \"Expected object, received number\"\n          }\n        ],\n        \"name\": \"ZodError\"\n      },\n      {\n        \"issues\": [\n          {\n            \"code\": \"invalid_type\",\n            \"expected\": \"object\",\n            \"received\": \"number\",\n            \"path\": [],\n            \"message\": \"Expected object, received number\"\n          }\n        ],\n        \"name\": \"ZodError\"\n      }\n    ],\n    \"path\": [],\n    \"message\": \"Invalid input\"\n  }\n]'),
('ER-1767099811210-54755', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 13:03:31', 3, '2025-12-30 13:03:31', '2025-12-30 13:05:43', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767099809673-357657704.jpg]', 0, NULL, NULL, '2025-12-30 13:03:31', NULL, '/uploads/accidents/accident-1767099809673-357657704.jpg', 'Error', 'AI service unavailable: image.quality is not a function'),
('ER-1767099958550-8918', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 13:05:58', 3, '2025-12-30 13:05:58', '2025-12-30 13:06:35', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767099953473-275786004.jpg]', 14, NULL, NULL, '2025-12-30 13:05:58', NULL, '/uploads/accidents/accident-1767099953473-275786004.jpg', 'Error', 'AI service unavailable: 413 Request body too large for gpt-4o model. Max size: 8000 tokens.'),
('ER-1767100009324-79779', 'Cancelled', '', 13.0491180, 77.5770166, '2025-12-30 13:06:49', 3, '2025-12-30 13:06:49', '2025-12-30 13:07:45', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767100007039-709607783.jpg]', 12, NULL, NULL, '2025-12-30 13:06:49', NULL, '/uploads/accidents/accident-1767100007039-709607783.jpg', 'Error', 'AI service unavailable: 413 Request body too large for gpt-4o model. Max size: 8000 tokens.'),
('ER-1767100084859-86782', 'Cancelled', '', 12.9859584, 77.6044544, '2025-12-30 13:08:04', 3, '2025-12-30 13:08:04', '2026-01-03 17:27:14', 'Bhagesh Biradar.', ' [IMAGE_ATTACHED: /uploads/accidents/accident-1767100074956-710862081.jpg]', 0, NULL, NULL, '2025-12-30 13:08:04', NULL, '/uploads/accidents/accident-1767100074956-710862081.jpg', 'Error', 'AI service unavailable: 429 Rate limit of 50 per 86400s exceeded for UserByModelByDay. Please wait 57829 seconds before retrying.'),
('WA-1767460449279', 'Completed', '', 13.0490351, 77.5771103, '2026-01-03 22:44:09', 3, '2026-01-03 17:14:09', '2026-01-03 17:34:24', 'Ramesh Biradar', 'High fever - LocationRef: Lat 13.049035072327, Lon 77.577110290527', 12, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int NOT NULL,
  `employeeId` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `firstName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departmentId` int DEFAULT NULL,
  `position` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('staff','doctor','admin','ROLE_DISPATCHER','ROLE_PARAMEDIC','ROLE_ER_STAFF') COLLATE utf8mb4_general_ci DEFAULT 'staff',
  `status` enum('active','inactive','on_leave') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `hireDate` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `profileImageUrl` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employeeId`, `firstName`, `lastName`, `email`, `password`, `phone`, `departmentId`, `position`, `role`, `status`, `hireDate`, `salary`, `profileImageUrl`) VALUES
(3, 'EMP003', 'Admin', 'User', 'admin@hospital.com', '$2b$10$CJw5CCOKWCimEFN2jNh6Zumhm2cdlCFUkBmLRcfZc8U1j.taO3mI2', '555-0103', NULL, 'Administrator', 'admin', 'active', '2023-01-01', 70000.00, '/uploads/profilePhoto-1767539097707-384715038.png'),
(12, 'EMP8035', 'Dr ', 'Microsoft', 'microsoft@gmail.com', '$2b$10$/FwPL5Pz4HbImELVUBFiQe6G6oP/AfHpClDF6bMMCau5UcHhbQIbO', '+917483159830', 1, 'Doctor', 'doctor', 'active', '2026-01-03', 40000.00, NULL),
(13, 'EMP7479', 'Rakshit', 'shetty', 'rakshit@gmail.com', '$2b$10$.ygVrTCr1p2wVgXKTik3wusFwiV4SPQ0X1hxPh/vCthPgxnicIUlK', '7776995555', 1, 'surgon', 'doctor', 'active', '2026-01-04', 40000.00, NULL),
(14, 'EMP9806', 'Allu', 'Arjun', 'arjun@gmail.com', '$2b$10$b6qGTIA/g3v1roccpdAue.whOZ1pcLqVxy2ES3w5KjPZE2ExDlIUu', '7775555888', 1, 'Doctor', 'ROLE_DISPATCHER', 'active', '2026-01-04', 40000.00, NULL),
(15, 'EMP1910', 'Vijay', 'Devarkonda', 'vijay@gmail.com', '$2b$10$GFAthW3F2kuqyTTKh.EKn.lguGMGs9PpYQjfKNgiEDeNNoIL.jI86', '2134567813', 1, 'Driver', 'ROLE_PARAMEDIC', 'active', '2026-01-04', 30000.00, NULL),
(16, 'EMP8193', 'puneeth', 'rajkumar', 'puneeth@gmail.com', '$2b$10$1pTkpkVdOtX1jyl9cu41p.6IlLJzp0Yoi4vCa.mPhYY0wMNkm.Rjy', '8080587890', 1, 'Doctor', 'ROLE_ER_STAFF', 'active', '2026-01-04', 100000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `government_prices`
--

CREATE TABLE `government_prices` (
  `medicineId` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `maxPrice` decimal(10,2) NOT NULL,
  `lastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `government_prices`
--

INSERT INTO `government_prices` (`medicineId`, `name`, `maxPrice`, `lastUpdated`) VALUES
(1, 'Paracetamol 500mg', 45.00, '2026-01-04 07:23:58'),
(2, 'Amoxicillin 250mg', 120.50, '2026-01-04 07:23:58'),
(3, 'Insulin Glargine', 350.00, '2026-01-04 07:23:58'),
(4, 'Cetirizine 10mg', 15.00, '2026-01-04 07:23:58');

-- --------------------------------------------------------

--
-- Table structure for table `immunizations`
--

CREATE TABLE `immunizations` (
  `id` int NOT NULL,
  `patientId` int NOT NULL,
  `vaccineName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `vaccinationDate` date NOT NULL,
  `doseNumber` int DEFAULT '1',
  `administeredByDoctorId` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `nextDueDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `immunizations`
--

INSERT INTO `immunizations` (`id`, `patientId`, `vaccineName`, `vaccinationDate`, `doseNumber`, `administeredByDoctorId`, `notes`, `nextDueDate`) VALUES
(1, 28, 'Covid ', '2025-11-08', 1, NULL, NULL, '2025-11-08');

-- --------------------------------------------------------

--
-- Table structure for table `lab_tests`
--

CREATE TABLE `lab_tests` (
  `id` int NOT NULL,
  `testNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int NOT NULL,
  `testName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `testDate` date NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `result_text` text COLLATE utf8mb4_general_ci,
  `result_file_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ai_analysis_json` longtext COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lab_tests`
--

INSERT INTO `lab_tests` (`id`, `testNumber`, `patientId`, `doctorId`, `testName`, `testDate`, `status`, `result_text`, `result_file_url`, `ai_analysis_json`) VALUES
(21, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'completed', '  ', NULL, NULL),
(22, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL),
(23, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL),
(24, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL),
(25, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL),
(26, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL),
(27, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL),
(28, 'LAB7599', 105, 13, 'CT scan', '2026-01-05', 'pending', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `medical_equipment`
--

CREATE TABLE `medical_equipment` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_equipment`
--

INSERT INTO `medical_equipment` (`id`, `name`, `quantity`, `status`) VALUES
(1, 'Ventilator', 20, 'available'),
(2, 'X-Ray Machine', 5, 'in-use'),
(3, 'Ultrasound Machine', 10, 'available'),
(4, 'Defibrillator', 30, 'available');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int NOT NULL,
  `recordDate` date NOT NULL,
  `diagnosis` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `treatment` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patientId`, `doctorId`, `recordDate`, `diagnosis`, `treatment`) VALUES
(12, 105, 13, '2026-01-05', 'Disc Bulge in C2 and D4', '');

-- --------------------------------------------------------

--
-- Table structure for table `medication_adherence`
--

CREATE TABLE `medication_adherence` (
  `id` int NOT NULL,
  `patientId` int NOT NULL,
  `prescriptionId` int NOT NULL,
  `doseTime` datetime NOT NULL,
  `status` enum('taken','skipped','scheduled') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'scheduled',
  `recordedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medication_adherence`
--

INSERT INTO `medication_adherence` (`id`, `patientId`, `prescriptionId`, `doseTime`, `status`, `recordedAt`) VALUES
(6, 105, 10, '2026-01-04 10:00:00', 'taken', '2026-01-04 12:54:14');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `senderId` int NOT NULL,
  `senderType` enum('patient','employee') COLLATE utf8mb4_general_ci NOT NULL,
  `receiverId` int NOT NULL,
  `receiverType` enum('patient','employee') COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `senderId`, `senderType`, `receiverId`, `receiverType`, `message`, `timestamp`, `read`) VALUES
(1, 4, 'employee', 0, 'patient', 'hi', '2025-11-01 11:49:55', 0);

-- --------------------------------------------------------

--
-- Table structure for table `paramedicdevicetokens`
--

CREATE TABLE `paramedicdevicetokens` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `device_token` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expires` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`email`, `token`, `expires`) VALUES
('bhageshbiradar820@gmail.com', 'd64216f32ffae4736d199d513ddeeebb53a9e975', 1762447183886),
('shrikantbiradar69@gmail.com', 'b436aea935cf534e10d83b4b0c1f137a24a4af7f', 1762616898268);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `patientId` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `firstName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bloodGroup` varchar(5) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `emergencyContact` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `emergencyPhone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','discharged','transferred') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `profileImageUrl` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `patientId`, `firstName`, `lastName`, `dateOfBirth`, `gender`, `bloodGroup`, `phone`, `email`, `address`, `emergencyContact`, `emergencyPhone`, `status`, `profileImageUrl`) VALUES
(28, 'PAT2609', 'Bhagesh', 'Biradar.', NULL, NULL, NULL, '7483159830_OLD', 'bhageshbiradar820@gmail.com', NULL, NULL, NULL, 'discharged', NULL),
(104, 'PAT1767523512588212', 'Bhagesh', 'Biradar', NULL, NULL, NULL, '+7483159830', 'bhageshbiradar@gmail.com', NULL, NULL, NULL, 'active', NULL),
(105, 'PAT1767525356693968', 'Rashmika', 'mandanna', NULL, NULL, NULL, '+918550010231', 'rashmika@gmail.com', NULL, NULL, NULL, 'active', NULL),
(106, 'PAT1767539729075394', 'Dheeraj', 'Jadhav', NULL, NULL, NULL, '+917483707097', 'jadhavdheeraj129@gmail.com', NULL, NULL, NULL, 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patients_auth`
--

CREATE TABLE `patients_auth` (
  `id` int NOT NULL,
  `patientId` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `verificationToken` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients_auth`
--

INSERT INTO `patients_auth` (`id`, `patientId`, `email`, `password`, `verificationToken`, `isVerified`) VALUES
(13, 28, 'bhageshbiradar820@gmail.com', '$2b$10$QDidRN5Cefufeo6dSt7p3uPyCoYZH75YytJM/tI9Q6PJvZ7dkxhI.', NULL, 1),
(48, 104, 'bhageshbiradar@gmail.com', '$2b$10$kCnSAEUGNVBfh3I4ygkyGuodcEOEaIXEvA6bIpktgULvNv.qlcUQy', NULL, 1),
(49, 105, 'rashmika@gmail.com', '$2b$10$zxdfuETT2c9FdexEdmIE/.JIsIWMhLBzEDYKgHW5Siz1f0VqB6pPi', NULL, 1),
(50, 106, 'jadhavdheeraj129@gmail.com', '$2b$10$OclCwIRNzxBAcA7yVg4eGuCaa7ibSMeVOqYRSmFJVDD34hKAnEa3a', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `patient_bills`
--

CREATE TABLE `patient_bills` (
  `id` int NOT NULL,
  `billNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `patientId` int NOT NULL,
  `billDate` datetime NOT NULL,
  `dueDate` date NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `amountPaid` decimal(10,2) DEFAULT '0.00',
  `balanceDue` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','partial','overdue') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_health_devices`
--

CREATE TABLE `patient_health_devices` (
  `device_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `device_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'SmartWatch',
  `device_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mac_address` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','inactive','disconnected') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `last_sync` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_vitals_log`
--

CREATE TABLE `patient_vitals_log` (
  `id` bigint NOT NULL,
  `patient_id` int NOT NULL,
  `device_id` int DEFAULT NULL,
  `heart_rate` int NOT NULL,
  `spo2` int DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `risk_score` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_records`
--

CREATE TABLE `payroll_records` (
  `id` int NOT NULL,
  `employeeId` int NOT NULL,
  `payPeriodStart` date NOT NULL,
  `payPeriodEnd` date NOT NULL,
  `basicSalary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT NULL,
  `deductions` decimal(10,2) DEFAULT NULL,
  `netSalary` decimal(10,2) DEFAULT NULL,
  `paymentDate` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pharmaceuticals`
--

CREATE TABLE `pharmaceuticals` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `categoryId` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `dosageForm` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `strength` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `stockQuantity` int NOT NULL,
  `reorderLevel` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pharmaceuticals`
--

INSERT INTO `pharmaceuticals` (`id`, `name`, `categoryId`, `description`, `dosageForm`, `strength`, `unitPrice`, `stockQuantity`, `reorderLevel`) VALUES
(1, 'Amoxicillin', 1, 'Broad-spectrum antibiotic', 'Capsule', '500mg', 15.99, 10500, 100),
(2, 'Ibuprofen', 2, 'Pain and inflammation relief', 'Tablet', '200mg', 8.99, 0, 200),
(3, 'Amoxicillin', 1, '', '', '500mg', 0.00, 12445, 0),
(4, 'Amoxicillin', 1, '', '', '500mg', 0.00, 1234, 0),
(5, 'Amoxicillin', 1, '', '', '500mg', 0.00, 1000, 0);

-- --------------------------------------------------------

--
-- Table structure for table `pharmaceutical_categories`
--

CREATE TABLE `pharmaceutical_categories` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pharmaceutical_categories`
--

INSERT INTO `pharmaceutical_categories` (`id`, `name`, `description`) VALUES
(1, 'Antibiotics', 'Bacterial infection treatment'),
(2, 'Analgesics', 'Pain relief medications'),
(3, 'Cardiovascular', 'Heart and blood pressure medications'),
(4, 'Vitamins', 'Nutritional supplements');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int NOT NULL,
  `prescriptionNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int NOT NULL,
  `prescriptionDate` date NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `medicationName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `prescriptionNumber`, `patientId`, `doctorId`, `prescriptionDate`, `status`, `medicationName`, `dosage`) VALUES
(7, 'PRES-1762404858431', 28, 5, '2025-11-06', 'canceled', 'Zerodal Sp', '1'),
(8, 'PRES-1762405320867', 28, 5, '2025-11-06', 'active', 'qw', '1'),
(10, 'PRES-1767525986192', 105, 13, '2026-01-05', 'active', 'Zerodal Sp', '500mg');

-- --------------------------------------------------------

--
-- Table structure for table `prescription_schedules`
--

CREATE TABLE `prescription_schedules` (
  `id` int NOT NULL,
  `prescriptionId` int NOT NULL,
  `scheduledTime` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescription_schedules`
--

INSERT INTO `prescription_schedules` (`id`, `prescriptionId`, `scheduledTime`) VALUES
(4, 7, '10:00:00'),
(5, 8, '10:00:00'),
(7, 10, '10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `surgery_records`
--

CREATE TABLE `surgery_records` (
  `id` int NOT NULL,
  `surgeryNumber` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `patientId` int NOT NULL,
  `surgeonId` int NOT NULL,
  `surgeryType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `surgeryDate` datetime NOT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `status` enum('scheduled','completed','canceled') COLLATE utf8mb4_general_ci DEFAULT 'scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `surgery_records`
--

INSERT INTO `surgery_records` (`id`, `surgeryNumber`, `patientId`, `surgeonId`, `surgeryType`, `surgeryDate`, `notes`, `status`) VALUES
(4, 'SURG-1645', 28, 5, 'Bypass surgery', '2025-11-06 10:05:00', '', 'scheduled'),
(5, 'SURG-2667', 28, 5, 'Bypass surgery', '2025-11-06 10:32:00', '', 'completed'),
(7, 'SURG-9686', 105, 13, 'Bypass surgery', '2026-01-04 16:58:00', '', 'scheduled');

-- --------------------------------------------------------

--
-- Table structure for table `tripvitals`
--

CREATE TABLE `tripvitals` (
  `vitals_id` int NOT NULL,
  `trip_id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime NOT NULL,
  `heart_rate` int DEFAULT NULL,
  `blood_pressure_systolic` int DEFAULT NULL,
  `blood_pressure_diastolic` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tripvitals`
--

INSERT INTO `tripvitals` (`vitals_id`, `trip_id`, `timestamp`, `heart_rate`, `blood_pressure_systolic`, `blood_pressure_diastolic`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'ER-1762926073021-32534', '2025-11-12 05:42:03', 80, 100, 120, 'sdfgh', '2025-11-12 05:42:03', '2025-11-12 05:42:03'),
(2, 'ER-1762926395499-25893', '2025-11-12 05:49:13', 90, 122, 13, 'sdfgh', '2025-11-12 05:49:13', '2025-11-12 05:49:13'),
(3, 'ER-1762927684065-34591', '2025-11-12 06:11:12', 345, 2345, 234, 'wesdfgh', '2025-11-12 06:11:12', '2025-11-12 06:11:12'),
(4, 'ER-1762928501191-12423', '2025-11-12 06:22:36', 2134, 2345, NULL, '234t', '2025-11-12 06:22:36', '2025-11-12 06:22:36'),
(5, 'ER-1762929813368-61173', '2025-11-12 06:44:04', 12345, 21345, 2343, 'asdfgh', '2025-11-12 06:44:04', '2025-11-12 06:44:04'),
(6, 'ER-1762931268364-17328', '2025-11-12 07:13:38', 234, 123, 34, '1234', '2025-11-12 07:13:38', '2025-11-12 07:13:38'),
(7, 'ER-1762932003961-32824', '2025-11-12 07:20:49', 123, 123, NULL, 'sdfgh', '2025-11-12 07:20:49', '2025-11-12 07:20:49'),
(8, 'ER-1762932262258-86128', '2025-11-12 07:25:13', 123, 1234, 12345, 'fghj', '2025-11-12 07:25:13', '2025-11-12 07:25:13'),
(9, 'ER-1767092260015-12181', '2025-12-30 11:00:41', 100, NULL, NULL, 'Heart rate 100. Hi, BP. Very serious case. Heart attack. Log Vittles.', '2025-12-30 11:00:41', '2025-12-30 11:00:41');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int NOT NULL,
  `vendorName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `contactPerson` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `vendorType` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `vendorName`, `contactPerson`, `email`, `phone`, `address`, `vendorType`, `status`) VALUES
(1, 'Medical Supplies Co.', 'John Smith', 'contact@medsupplies.com', '555-9090', '789 Supply Rd', 'Supplies', 'active'),
(2, 'PharmaCorp', 'Jane Doe', 'jane@pharmacorp.com', '555-9091', '321 Pharma Ave', 'Pharmaceuticals', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `virtual_consultation_rooms`
--

CREATE TABLE `virtual_consultation_rooms` (
  `id` int NOT NULL,
  `appointmentId` int NOT NULL,
  `roomUrl` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `status` enum('scheduled','active','completed','canceled') COLLATE utf8mb4_general_ci DEFAULT 'scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `virtual_consultation_rooms`
--

INSERT INTO `virtual_consultation_rooms` (`id`, `appointmentId`, `roomUrl`, `startTime`, `endTime`, `status`) VALUES
(31, 71, 'https://meet.jit.si/HMSConsultation-71-1767526320067', '2026-01-05 05:30:00', '2026-01-05 06:00:00', 'scheduled');

-- --------------------------------------------------------

--
-- Table structure for table `wards`
--

CREATE TABLE `wards` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `departmentId` int DEFAULT NULL,
  `floorNumber` int DEFAULT NULL,
  `capacity` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wards`
--

INSERT INTO `wards` (`id`, `name`, `departmentId`, `floorNumber`, `capacity`) VALUES
(1, 'ICU Ward', 1, 2, 20),
(2, 'General Ward A', 1, 3, 50),
(3, 'Cardiac Ward', 2, 4, 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts_payable`
--
ALTER TABLE `accounts_payable`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `accounts_receivable`
--
ALTER TABLE `accounts_receivable`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_ar` (`patientId`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `admissions`
--
ALTER TABLE `admissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_adm` (`patientId`),
  ADD KEY `wardId_adm` (`wardId`),
  ADD KEY `bedId_adm` (`bedId`);

--
-- Indexes for table `ai_triage_logs`
--
ALTER TABLE `ai_triage_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_trip_id` (`trip_id`),
  ADD KEY `idx_analysis_timestamp` (`analysis_timestamp`);

--
-- Indexes for table `ambulancecrews`
--
ALTER TABLE `ambulancecrews`
  ADD PRIMARY KEY (`shift_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ambulance_id` (`ambulance_id`);

--
-- Indexes for table `ambulancelocationhistory`
--
ALTER TABLE `ambulancelocationhistory`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `ambulance_id` (`ambulance_id`);

--
-- Indexes for table `ambulances`
--
ALTER TABLE `ambulances`
  ADD PRIMARY KEY (`ambulance_id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `fk_current_trip` (`current_trip_id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_appt` (`patientId`),
  ADD KEY `doctorId_appt` (`doctorId`);

--
-- Indexes for table `beds`
--
ALTER TABLE `beds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wardId` (`wardId`),
  ADD KEY `patientId_bed` (`patientId`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `billId_bi` (`billId`);

--
-- Indexes for table `blockchain_ledger`
--
ALTER TABLE `blockchain_ledger`
  ADD PRIMARY KEY (`index`);

--
-- Indexes for table `cardiac_risk_alerts`
--
ALTER TABLE `cardiac_risk_alerts`
  ADD PRIMARY KEY (`alert_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doctorId` (`doctorId`);

--
-- Indexes for table `emergencytrips`
--
ALTER TABLE `emergencytrips`
  ADD PRIMARY KEY (`trip_id`),
  ADD KEY `assigned_ambulance_id` (`assigned_ambulance_id`),
  ADD KEY `fk_trip_patient` (`patient_id`),
  ADD KEY `fk_trip_booked_by_patient` (`booked_by_patient_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employeeId` (`employeeId`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `departmentId` (`departmentId`);

--
-- Indexes for table `government_prices`
--
ALTER TABLE `government_prices`
  ADD PRIMARY KEY (`medicineId`);

--
-- Indexes for table `immunizations`
--
ALTER TABLE `immunizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_imm` (`patientId`),
  ADD KEY `administeredByDoctorId_imm` (`administeredByDoctorId`);

--
-- Indexes for table `lab_tests`
--
ALTER TABLE `lab_tests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_lab` (`patientId`),
  ADD KEY `doctorId_lab` (`doctorId`);

--
-- Indexes for table `medical_equipment`
--
ALTER TABLE `medical_equipment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_mr` (`patientId`),
  ADD KEY `doctorId_mr` (`doctorId`);

--
-- Indexes for table `medication_adherence`
--
ALTER TABLE `medication_adherence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId` (`patientId`),
  ADD KEY `prescriptionId` (`prescriptionId`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `paramedicdevicetokens`
--
ALTER TABLE `paramedicdevicetokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_token` (`device_token`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patientId` (`patientId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `patients_auth`
--
ALTER TABLE `patients_auth`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `patientId_auth` (`patientId`);

--
-- Indexes for table `patient_bills`
--
ALTER TABLE `patient_bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `billNumber` (`billNumber`),
  ADD KEY `patientId_bill` (`patientId`);

--
-- Indexes for table `patient_health_devices`
--
ALTER TABLE `patient_health_devices`
  ADD PRIMARY KEY (`device_id`);

--
-- Indexes for table `patient_vitals_log`
--
ALTER TABLE `patient_vitals_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patient_time` (`patient_id`,`timestamp`);

--
-- Indexes for table `payroll_records`
--
ALTER TABLE `payroll_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employeeId` (`employeeId`);

--
-- Indexes for table `pharmaceuticals`
--
ALTER TABLE `pharmaceuticals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `pharmaceutical_categories`
--
ALTER TABLE `pharmaceutical_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId` (`patientId`);

--
-- Indexes for table `prescription_schedules`
--
ALTER TABLE `prescription_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescriptionId` (`prescriptionId`);

--
-- Indexes for table `surgery_records`
--
ALTER TABLE `surgery_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patientId_surgery` (`patientId`);

--
-- Indexes for table `tripvitals`
--
ALTER TABLE `tripvitals`
  ADD PRIMARY KEY (`vitals_id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `virtual_consultation_rooms`
--
ALTER TABLE `virtual_consultation_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointmentId` (`appointmentId`);

--
-- Indexes for table `wards`
--
ALTER TABLE `wards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ward_departmentId` (`departmentId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts_payable`
--
ALTER TABLE `accounts_payable`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `accounts_receivable`
--
ALTER TABLE `accounts_receivable`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admissions`
--
ALTER TABLE `admissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `ai_triage_logs`
--
ALTER TABLE `ai_triage_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ambulancecrews`
--
ALTER TABLE `ambulancecrews`
  MODIFY `shift_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ambulancelocationhistory`
--
ALTER TABLE `ambulancelocationhistory`
  MODIFY `location_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `ambulances`
--
ALTER TABLE `ambulances`
  MODIFY `ambulance_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `beds`
--
ALTER TABLE `beds`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `bill_items`
--
ALTER TABLE `bill_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cardiac_risk_alerts`
--
ALTER TABLE `cardiac_risk_alerts`
  MODIFY `alert_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `immunizations`
--
ALTER TABLE `immunizations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lab_tests`
--
ALTER TABLE `lab_tests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `medical_equipment`
--
ALTER TABLE `medical_equipment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `medication_adherence`
--
ALTER TABLE `medication_adherence`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `paramedicdevicetokens`
--
ALTER TABLE `paramedicdevicetokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `patients_auth`
--
ALTER TABLE `patients_auth`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `patient_bills`
--
ALTER TABLE `patient_bills`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `patient_health_devices`
--
ALTER TABLE `patient_health_devices`
  MODIFY `device_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient_vitals_log`
--
ALTER TABLE `patient_vitals_log`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_records`
--
ALTER TABLE `payroll_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pharmaceuticals`
--
ALTER TABLE `pharmaceuticals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pharmaceutical_categories`
--
ALTER TABLE `pharmaceutical_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `prescription_schedules`
--
ALTER TABLE `prescription_schedules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `surgery_records`
--
ALTER TABLE `surgery_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tripvitals`
--
ALTER TABLE `tripvitals`
  MODIFY `vitals_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `virtual_consultation_rooms`
--
ALTER TABLE `virtual_consultation_rooms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `wards`
--
ALTER TABLE `wards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts_receivable`
--
ALTER TABLE `accounts_receivable`
  ADD CONSTRAINT `ar_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `admissions`
--
ALTER TABLE `admissions`
  ADD CONSTRAINT `adm_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `adm_ibfk_2` FOREIGN KEY (`wardId`) REFERENCES `wards` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `adm_ibfk_3` FOREIGN KEY (`bedId`) REFERENCES `beds` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ambulancecrews`
--
ALTER TABLE `ambulancecrews`
  ADD CONSTRAINT `ambulancecrews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ambulancecrews_ibfk_2` FOREIGN KEY (`ambulance_id`) REFERENCES `ambulances` (`ambulance_id`) ON DELETE CASCADE;

--
-- Constraints for table `ambulancelocationhistory`
--
ALTER TABLE `ambulancelocationhistory`
  ADD CONSTRAINT `ambulancelocationhistory_ibfk_1` FOREIGN KEY (`ambulance_id`) REFERENCES `ambulances` (`ambulance_id`) ON DELETE CASCADE;

--
-- Constraints for table `ambulances`
--
ALTER TABLE `ambulances`
  ADD CONSTRAINT `fk_current_trip` FOREIGN KEY (`current_trip_id`) REFERENCES `emergencytrips` (`trip_id`) ON DELETE SET NULL;

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appt_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appt_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `beds`
--
ALTER TABLE `beds`
  ADD CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`wardId`) REFERENCES `wards` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `beds_ibfk_2` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `bi_ibfk_1` FOREIGN KEY (`billId`) REFERENCES `patient_bills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_schedules`
--
ALTER TABLE `doctor_schedules`
  ADD CONSTRAINT `ds_ibfk_1` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `emergencytrips`
--
ALTER TABLE `emergencytrips`
  ADD CONSTRAINT `emergencytrips_ibfk_1` FOREIGN KEY (`assigned_ambulance_id`) REFERENCES `ambulances` (`ambulance_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_trip_booked_by_patient` FOREIGN KEY (`booked_by_patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_trip_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `immunizations`
--
ALTER TABLE `immunizations`
  ADD CONSTRAINT `imm_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `imm_ibfk_2` FOREIGN KEY (`administeredByDoctorId`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lab_tests`
--
ALTER TABLE `lab_tests`
  ADD CONSTRAINT `lt_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lt_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `mr_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mr_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medication_adherence`
--
ALTER TABLE `medication_adherence`
  ADD CONSTRAINT `medication_adherence_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medication_adherence_ibfk_2` FOREIGN KEY (`prescriptionId`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `paramedicdevicetokens`
--
ALTER TABLE `paramedicdevicetokens`
  ADD CONSTRAINT `paramedicdevicetokens_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients_auth`
--
ALTER TABLE `patients_auth`
  ADD CONSTRAINT `pa_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patient_bills`
--
ALTER TABLE `patient_bills`
  ADD CONSTRAINT `pb_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll_records`
--
ALTER TABLE `payroll_records`
  ADD CONSTRAINT `pr_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pharmaceuticals`
--
ALTER TABLE `pharmaceuticals`
  ADD CONSTRAINT `pharmaceuticals_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `pharmaceutical_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `p_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `prescription_schedules`
--
ALTER TABLE `prescription_schedules`
  ADD CONSTRAINT `prescription_schedules_ibfk_1` FOREIGN KEY (`prescriptionId`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `surgery_records`
--
ALTER TABLE `surgery_records`
  ADD CONSTRAINT `sr_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tripvitals`
--
ALTER TABLE `tripvitals`
  ADD CONSTRAINT `tripvitals_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `emergencytrips` (`trip_id`) ON DELETE CASCADE;

--
-- Constraints for table `virtual_consultation_rooms`
--
ALTER TABLE `virtual_consultation_rooms`
  ADD CONSTRAINT `vcr_ibfk_1` FOREIGN KEY (`appointmentId`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wards`
--
ALTER TABLE `wards`
  ADD CONSTRAINT `wards_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
