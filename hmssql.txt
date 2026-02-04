--
-- Database: `hms`
--
CREATE DATABASE IF NOT EXISTS `hms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `hms`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admins`
--
INSERT INTO `admins` (`username`, `password`) VALUES ('admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--
CREATE TABLE `doctors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `doctors`
--
INSERT INTO `doctors` (`username`, `password`) VALUES ('doctor', 'doctor');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- Table structure for table `employees`
--
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `departmentId` int(11) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `role` enum('staff','doctor','admin') DEFAULT 'staff',
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `hireDate` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employeeId` (`employeeId`),
  UNIQUE KEY `email` (`email`),
  KEY `departmentId` (`departmentId`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employees`
--
INSERT INTO `employees` (`id`, `employeeId`, `firstName`, `lastName`, `email`, `password`, `phone`, `departmentId`, `position`, `role`, `status`, `hireDate`, `salary`) VALUES
(1, 'EMP001', 'Dr. Sarah', 'Johnson', 'sarah.j@hospital.com', NULL, '555-0101', 1, 'Chief Emergency Physician', 'doctor', 'active', '2020-01-15', 150000.00),
(2, 'EMP002', 'Dr. Michael', 'Chen', 'michael.c@hospital.com', NULL, '555-0102', 2, 'Cardiologist', 'doctor', 'active', '2019-03-20', 180000.00),
(3, 'EMP003', 'Admin', 'User', 'admin@hospital.com', '$2b$10$CJw5CCOKWCimEFN2jNh6Zumhm2cdlCFUkBmLRcfZc8U1j.taO3mI2', '555-0103', NULL, 'Administrator', 'admin', 'active', '2023-01-01', 70000.00);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `bloodGroup` varchar(5) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergencyContact` varchar(200) DEFAULT NULL,
  `emergencyPhone` varchar(20) DEFAULT NULL,
  `status` enum('active','discharged','transferred') DEFAULT 'active',
  `profileImageUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patientId` (`patientId`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `patients`
--
INSERT INTO `patients` (`id`, `patientId`, `firstName`, `lastName`, `dateOfBirth`, `gender`, `bloodGroup`, `phone`, `email`, `address`, `emergencyContact`, `emergencyPhone`, `status`) VALUES
(1, 'PAT001', 'John', 'Doe', '1985-05-15', 'Male', 'O+', '555-1001', 'john.doe@email.com', '123 Main St, City', 'Jane Doe', '555-1002', 'active'),
(2, 'PAT002', 'Emma', 'Wilson', '1990-08-22', 'Female', 'A+', '555-1003', 'emma.w@email.com', '456 Oak Ave, City', 'Tom Wilson', '555-1004', 'active'),
(3, 'PAT003', 'James', 'Brown', '1978-11-30', 'Male', 'B+', '555-1005', 'james.b@email.com', '789 Pine St, City', 'Susan Brown', '555-1006', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `pharmaceutical_categories`
--
CREATE TABLE `pharmaceutical_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- Table structure for table `pharmaceuticals`
--
CREATE TABLE `pharmaceuticals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `dosageForm` varchar(50) DEFAULT NULL,
  `strength` varchar(50) DEFAULT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `stockQuantity` int(11) NOT NULL,
  `reorderLevel` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `pharmaceuticals_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `pharmaceutical_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `pharmaceuticals`
--
INSERT INTO `pharmaceuticals` (`id`, `name`, `categoryId`, `description`, `dosageForm`, `strength`, `unitPrice`, `stockQuantity`, `reorderLevel`) VALUES
(1, 'Amoxicillin', 1, 'Broad-spectrum antibiotic', 'Capsule', '500mg', 15.99, 500, 100),
(2, 'Ibuprofen', 2, 'Pain and inflammation relief', 'Tablet', '200mg', 8.99, 1000, 200);

-- --------------------------------------------------------

--
-- Table structure for table `wards`
--
CREATE TABLE `wards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `departmentId` int(11) DEFAULT NULL,
  `floorNumber` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ward_departmentId` (`departmentId`),
  CONSTRAINT `wards_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `wards`
--
INSERT INTO `wards` (`id`, `name`, `departmentId`, `floorNumber`, `capacity`) VALUES
(1, 'ICU Ward', 1, 2, 20),
(2, 'General Ward A', 1, 3, 50),
(3, 'Cardiac Ward', 2, 4, 10);

-- --------------------------------------------------------

--
-- Table structure for table `beds`
--
CREATE TABLE `beds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bedNumber` varchar(50) NOT NULL,
  `wardId` int(11) DEFAULT NULL,
  `status` enum('available','occupied','maintenance','reserved','cleaning') DEFAULT 'available',
  `patientId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wardId` (`wardId`),
  KEY `patientId_bed` (`patientId`),
  CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`wardId`) REFERENCES `wards` (`id`) ON DELETE SET NULL,
  CONSTRAINT `beds_ibfk_2` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `beds`
--
INSERT INTO `beds` (`id`, `bedNumber`, `wardId`, `status`, `patientId`) VALUES
(1, 'ICU-001', 1, 'occupied', 1),
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
(19, 'GA-017', 2, 'available', NULL),
(20, 'GA-018', 2, 'available', NULL),
(21, 'GA-019', 2, 'available', NULL),
(22, 'GA-020', 2, 'available', NULL),
(23, 'GA-021', 2, 'available', NULL),
(24, 'GA-022', 2, 'available', NULL),
(25, 'GA-023', 2, 'available', NULL),
(26, 'GA-024', 2, 'available', NULL),
(27, 'GA-025', 2, 'available', NULL),
(28, 'CW-001', 3, 'available', NULL),
(29, 'CW-002', 3, 'available', NULL),
(30, 'CW-003', 3, 'available', NULL),
(31, 'CW-004', 3, 'available', NULL),
(32, 'CW-005', 3, 'available', NULL),
(33, 'CW-006', 3, 'available', NULL),
(34, 'CW-007', 3, 'available', NULL),
(35, 'CW-008', 3, 'available', NULL),
(36, 'CW-009', 2, 'available', NULL),
(37, 'CW-010', 3, 'available', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `accounts_payable`
--
CREATE TABLE `accounts_payable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(50) NOT NULL,
  `vendorName` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `dueDate` date NOT NULL,
  `paymentStatus` enum('pending','paid','overdue','partial') DEFAULT 'pending',
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `accounts_payable`
--
INSERT INTO `accounts_payable` (`id`, `invoiceNumber`, `vendorName`, `amount`, `dueDate`, `paymentStatus`) VALUES
(1, 'INV-AP-001', 'Medical Supplies Co.', 5420.00, '2025-10-15', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `accounts_receivable`
--
CREATE TABLE `accounts_receivable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(50) NOT NULL,
  `patientId` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `dueDate` date NOT NULL,
  `paymentStatus` enum('pending','paid','overdue','partial') DEFAULT 'pending',
  `description` text,
  PRIMARY KEY (`id`),
  KEY `patientId_ar` (`patientId`),
  CONSTRAINT `ar_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `accounts_receivable`
--
INSERT INTO `accounts_receivable` (`id`, `invoiceNumber`, `patientId`, `amount`, `dueDate`, `paymentStatus`) VALUES
(1, 'INV-AR-001', 1, 1200.50, '2025-10-20', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `lab_tests`
--
CREATE TABLE `lab_tests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `testNumber` varchar(50) NOT NULL,
  `patientId` int(11) NOT NULL,
  `doctorId` int(11) NOT NULL,
  `testName` varchar(255) NOT NULL,
  `testDate` date NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `result_text` text DEFAULT NULL,
  `result_file_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
        KEY `patientId_lab` (`patientId`),
        KEY `doctorId_lab` (`doctorId`),
        CONSTRAINT `lt_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
        CONSTRAINT `lt_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `lab_tests`
--
INSERT INTO `lab_tests` (`id`, `testNumber`, `patientId`, `doctorId`, `testName`, `testDate`, `status`) VALUES
(1, 'LAB-001', 1, 1, 'Complete Blood Count', '2025-10-01', 'completed'),
(2, 'LAB-002', 2, 1, 'Lipid Panel', '2025-10-01', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--
CREATE TABLE `vendors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vendorName` varchar(255) NOT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `vendorType` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `vendors`
--
INSERT INTO `vendors` (`id`, `vendorName`, `contactPerson`, `email`, `phone`, `address`, `vendorType`, `status`) VALUES
(1, 'Medical Supplies Co.', 'John Smith', 'contact@medsupplies.com', '555-9090', '789 Supply Rd', 'Supplies', 'active'),
(2, 'PharmaCorp', 'Jane Doe', 'jane@pharmacorp.com', '555-9091', '321 Pharma Ave', 'Pharmaceuticals', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `medical_equipment`
--
CREATE TABLE `medical_equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'available',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- Table structure for table `prescriptions`
--
CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prescriptionNumber` varchar(50) NOT NULL,
  `patientId` int(11) NOT NULL,
  `doctorId` int(11) NOT NULL,
  `prescriptionDate` date NOT NULL,
  `notes` text,
  `status` varchar(50),
  PRIMARY KEY (`id`),
  KEY `patientId` (`patientId`),
  CONSTRAINT `p_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `surgery_records`
--
CREATE TABLE `surgery_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `surgeryNumber` varchar(50) NOT NULL,
  `patientId` int(11) NOT NULL,
  `surgeonId` int(11) NOT NULL,
  `surgeryType` varchar(255) NOT NULL,
  `surgeryDate` datetime NOT NULL,
  `notes` text,
  `status` enum('scheduled','completed','canceled') DEFAULT 'scheduled',
  PRIMARY KEY (`id`),
  KEY `patientId_surgery` (`patientId`),
  CONSTRAINT `sr_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `surgery_records` (`id`, `surgeryNumber`, `patientId`, `surgeonId`, `surgeryType`, `surgeryDate`, `notes`, `status`) VALUES (1, 'SURG-001', 2, 2, 'Appendectomy', '2025-10-10 09:00:00', NULL, 'scheduled');


-- --------------------------------------------------------

--
-- Table structure for table `payroll_records`
--
CREATE TABLE `payroll_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` int(11) NOT NULL,
  `payPeriodStart` date NOT NULL,
  `payPeriodEnd` date NOT NULL,
  `basicSalary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT NULL,
  `deductions` decimal(10,2) DEFAULT NULL,
  `netSalary` decimal(10,2) DEFAULT NULL,
  `paymentDate` date,
  `status` varchar(50) DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `pr_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payroll_records` (`id`, `employeeId`, `payPeriodStart`, `payPeriodEnd`, `paymentDate`, `status`) VALUES (1, 1, '2025-09-01', '2025-09-30', NULL, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--
CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` int(11) NOT NULL,
  `doctorId` int(11) NOT NULL,
  `recordDate` date NOT NULL,
  `diagnosis` varchar(255) NOT NULL,
  `treatment` text,
  PRIMARY KEY (`id`),
  KEY `patientId_mr` (`patientId`),
  KEY `doctorId_mr` (`doctorId`),
  CONSTRAINT `mr_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mr_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `medical_records` (`id`, `patientId`, `doctorId`, `recordDate`, `diagnosis`, `treatment`) VALUES (1, 1, 1, '2025-09-28', 'Hypertension', 'Prescribed Lisinopril.');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` int(11) NOT NULL,
  `doctorId` int(11) NOT NULL,
  `appointmentDate` timestamp NOT NULL,
  `notes` text,
  `status` varchar(50) DEFAULT 'scheduled',
  `consultationType` varchar(50) DEFAULT 'in-person',
  PRIMARY KEY (`id`),
  KEY `patientId_appt` (`patientId`),
  KEY `doctorId_appt` (`doctorId`),
  CONSTRAINT `appt_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appt_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--
CREATE TABLE `admissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` int(11) NOT NULL,
  `admissionDate` datetime NOT NULL,
  `dischargeDate` datetime DEFAULT NULL,
  `wardId` int(11) DEFAULT NULL,
  `bedId` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patientId_adm` (`patientId`),
  KEY `wardId_adm` (`wardId`),
  KEY `bedId_adm` (`bedId`),
  CONSTRAINT `adm_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `adm_ibfk_2` FOREIGN KEY (`wardId`) REFERENCES `wards` (`id`) ON DELETE SET NULL,
  CONSTRAINT `adm_ibfk_3` FOREIGN KEY (`bedId`) REFERENCES `beds` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `immunizations`
--
CREATE TABLE `immunizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` int(11) NOT NULL,
  `vaccineName` varchar(255) NOT NULL,
  `vaccinationDate` date NOT NULL,
  `doseNumber` int(11) DEFAULT 1,
  `administeredByDoctorId` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `nextDueDate` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patientId_imm` (`patientId`),
  KEY `administeredByDoctorId_imm` (`administeredByDoctorId`),
  CONSTRAINT `imm_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `imm_ibfk_2` FOREIGN KEY (`administeredByDoctorId`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- FIX: Table structure for table `patients_auth`
--
CREATE TABLE `patients_auth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patientId` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `patientId_auth` (`patientId`),
  CONSTRAINT `pa_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `doctor_schedules`
--
CREATE TABLE `doctor_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctorId` int(11) NOT NULL,
  `dayOfWeek` int(1) NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `doctorId` (`doctorId`),
  CONSTRAINT `ds_ibfk_1` FOREIGN KEY (`doctorId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `patient_bills`
--
CREATE TABLE `patient_bills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `billNumber` varchar(50) UNIQUE NOT NULL,
  `patientId` int(11) NOT NULL,
  `billDate` datetime NOT NULL,
  `dueDate` date NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `amountPaid` decimal(10,2) DEFAULT 0.00,
  `balanceDue` decimal(10,2) NOT NULL,
  `status` enum('pending', 'paid', 'partial', 'overdue') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patientId_bill` (`patientId`),
  CONSTRAINT `pb_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--
CREATE TABLE `bill_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `billId` int(11) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `serviceReference` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `billId_bi` (`billId`),
  CONSTRAINT `bi_ibfk_1` FOREIGN KEY (`billId`) REFERENCES `patient_bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `virtual_consultation_rooms`
--
CREATE TABLE `virtual_consultation_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointmentId` int(11) NOT NULL,
  `roomUrl` varchar(255) NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `status` enum('scheduled','active','completed','canceled') DEFAULT 'scheduled',
  PRIMARY KEY (`id`),
  KEY `appointmentId` (`appointmentId`),
  CONSTRAINT `vcr_ibfk_1` FOREIGN KEY (`appointmentId`) REFERENCES `appointments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `senderId` int(11) NOT NULL,
  `senderType` enum('patient','employee') NOT NULL,
  `receiverId` int(11) NOT NULL,
  `receiverType` enum('patient','employee') NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
