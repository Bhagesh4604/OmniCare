-- ============================================================================
-- SMART BODY MONITOR - Database Migration
-- ============================================================================
-- Project: OmniCare HMS - Smart Body Monitor Feature
-- Date: 2026-01-07
-- Purpose: Create tables for comprehensive body health monitoring system
-- ============================================================================

-- Table 1: Body Parts Reference
-- Defines all trackable body parts with anatomical information
CREATE TABLE body_parts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('head', 'torso', 'upper_limb', 'lower_limb', 'internal') NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  related_specialties JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table 2: Patient Body Health Status
-- Tracks current health status for each body part per patient
CREATE TABLE patient_body_health (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  body_part_id INT NOT NULL,
  status ENUM('healthy', 'monitoring', 'concern', 'critical') DEFAULT 'healthy',
  last_symptom_date DATETIME,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (body_part_id) REFERENCES body_parts(id),
  UNIQUE KEY unique_patient_body_part (patient_id, body_part_id),
  INDEX idx_patient_status (patient_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table 3: Symptom Logs
-- Logs symptoms reported by patients for specific body parts
CREATE TABLE symptom_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  body_part_id INT NOT NULL,
  symptom_type VARCHAR(100) NOT NULL,
  severity ENUM('mild', 'moderate', 'severe', 'critical') NOT NULL,
  description TEXT,
  pain_level INT CHECK (pain_level BETWEEN 1 AND 10),
  photo_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  related_medication_id INT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (body_part_id) REFERENCES body_parts(id),
  FOREIGN KEY (related_medication_id) REFERENCES prescriptions(id) ON DELETE SET NULL,
  INDEX idx_patient_date (patient_id, created_at DESC),
  INDEX idx_body_part (body_part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table 4: AI Health Insights
-- Stores AI analysis and recommendations based on patient data
CREATE TABLE ai_health_insights (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  body_part_id INT,
  insight_type ENUM('pattern', 'risk', 'recommendation', 'alert') NOT NULL,
  severity ENUM('info', 'warning', 'urgent', 'critical') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  recommended_action TEXT,
  recommended_specialist VARCHAR(100),
  confidence_score DECIMAL(3,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  dismissed_at DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (body_part_id) REFERENCES body_parts(id) ON DELETE SET NULL,
  INDEX idx_patient_unread (patient_id, is_read),
  INDEX idx_severity (severity, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================

-- Populate body_parts with comprehensive anatomical data
INSERT INTO body_parts (name, category, display_name, description, related_specialties) VALUES
-- Head
('head', 'head', 'Head', 'General head area', '["Neurology", "General Practice"]'),
('brain', 'head', 'Brain', 'Cerebral region', '["Neurology", "Neuropsychiatry"]'),
('eyes', 'head', 'Eyes', 'Visual organs', '["Ophthalmology"]'),
('ears', 'head', 'Ears', 'Auditory organs', '["ENT", "Otolaryngology"]'),
('nose', 'head', 'Nose', 'Nasal cavity', '["ENT", "Otolaryngology"]'),
('mouth', 'head', 'Mouth', 'Oral cavity', '["Dentistry", "Oral Surgery"]'),
('throat', 'head', 'Throat', 'Pharynx and larynx', '["ENT", "Otolaryngology"]'),
('neck', 'head', 'Neck', 'Cervical region', '["Orthopedics", "General Practice"]'),

-- Torso
('chest', 'torso', 'Chest', 'Thoracic region', '["Cardiology", "Pulmonology"]'),
('heart', 'torso', 'Heart', 'Cardiac organ', '["Cardiology"]'),
('lungs', 'torso', 'Lungs', 'Respiratory organs', '["Pulmonology"]'),
('stomach', 'torso', 'Stomach', 'Gastric organ', '["Gastroenterology"]'),
('liver', 'torso', 'Liver', 'Hepatic organ', '["Gastroenterology", "Hepatology"]'),
('kidneys', 'torso', 'Kidneys', 'Renal organs', '["Nephrology"]'),
('abdomen', 'torso', 'Abdomen', 'Abdominal region', '["Gastroenterology", "General Surgery"]'),
('back', 'torso', 'Back', 'Dorsal region', '["Orthopedics", "Pain Management"]'),
('spine', 'torso', 'Spine', 'Vertebral column', '["Orthopedics", "Neurosurgery"]'),

-- Upper Limbs
('shoulders', 'upper_limb', 'Shoulders', 'Shoulder joints', '["Orthopedics", "Sports Medicine"]'),
('arms', 'upper_limb', 'Arms', 'Upper arms', '["Orthopedics"]'),
('elbows', 'upper_limb', 'Elbows', 'Elbow joints', '["Orthopedics"]'),
('wrists', 'upper_limb', 'Wrists', 'Wrist joints', '["Orthopedics"]'),
('hands', 'upper_limb', 'Hands', 'Palms and fingers', '["Orthopedics", "Hand Surgery"]'),

-- Lower Limbs
('hips', 'lower_limb', 'Hips', 'Hip joints', '["Orthopedics"]'),
('legs', 'lower_limb', 'Legs', 'Thighs and calves', '["Orthopedics", "Vascular Surgery"]'),
('knees', 'lower_limb', 'Knees', 'Knee joints', '["Orthopedics", "Sports Medicine"]'),
('ankles', 'lower_limb', 'Ankles', 'Ankle joints', '["Orthopedics"]'),
('feet', 'lower_limb', 'Feet', 'Feet and toes', '["Podiatry", "Orthopedics"]'),

-- Internal Systems
('skin', 'internal', 'Skin', 'Integumentary system', '["Dermatology"]'),
('blood', 'internal', 'Blood System', 'Circulatory system', '["Hematology"]'),
('immune', 'internal', 'Immune System', 'Immune system', '["Immunology"]'),
('digestive', 'internal', 'Digestive System', 'Gastrointestinal tract', '["Gastroenterology"]');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables created
SELECT 'body_parts' AS table_name, COUNT(*) AS row_count FROM body_parts
UNION ALL
SELECT 'patient_body_health', COUNT(*) FROM patient_body_health
UNION ALL
SELECT 'symptom_logs', COUNT(*) FROM symptom_logs
UNION ALL
SELECT 'ai_health_insights', COUNT(*) FROM ai_health_insights;

-- Show all body parts
SELECT id, name, category, display_name FROM body_parts ORDER BY category, id;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
