-- Clean up existing table if it has the wrong schema
DROP TABLE IF EXISTS body_parts;

-- Create body_parts table with correct schema
CREATE TABLE body_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  related_specialties JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO body_parts (name, display_name, category, related_specialties) VALUES 
('head', 'Head', 'Head & Neck', '["Neurology", "ENT"]'),
('eyes', 'Eyes', 'Head & Neck', '["Ophthalmology"]'),
('ears', 'Ears', 'Head & Neck', '["ENT"]'),
('nose', 'Nose', 'Head & Neck', '["ENT"]'),
('mouth', 'Mouth/Throat', 'Head & Neck', '["ENT", "Dental"]'),
('neck', 'Neck', 'Head & Neck', '["Orthopedics", "ENT"]'),
('chest', 'Chest', 'Torso', '["Cardiology", "Pulmonology"]'),
('heart', 'Heart', 'Torso', '["Cardiology"]'),
('lungs', 'Lungs', 'Torso', '["Pulmonology"]'),
('stomach', 'Stomach/Abdomen', 'Torso', '["Gastroenterology"]'),
('back_upper', 'Upper Back', 'Torso', '["Orthopedics"]'),
('back_lower', 'Lower Back', 'Torso', '["Orthopedics"]'),
('shoulder_left', 'Left Shoulder', 'Arms', '["Orthopedics"]'),
('shoulder_right', 'Right Shoulder', 'Arms', '["Orthopedics"]'),
('arm_left', 'Left Arm', 'Arms', '["Orthopedics"]'),
('arm_right', 'Right Arm', 'Arms', '["Orthopedics"]'),
('elbow_left', 'Left Elbow', 'Arms', '["Orthopedics"]'),
('elbow_right', 'Right Elbow', 'Arms', '["Orthopedics"]'),
('wrist_left', 'Left Wrist', 'Arms', '["Orthopedics"]'),
('wrist_right', 'Right Wrist', 'Arms', '["Orthopedics"]'),
('hand_left', 'Left Hand', 'Arms', '["Orthopedics"]'),
('hand_right', 'Right Hand', 'Arms', '["Orthopedics"]'),
('hip_left', 'Left Hip', 'Legs', '["Orthopedics"]'),
('hip_right', 'Right Hip', 'Legs', '["Orthopedics"]'),
('thigh_left', 'Left Thigh', 'Legs', '["Orthopedics"]'),
('thigh_right', 'Right Thigh', 'Legs', '["Orthopedics"]'),
('knee_left', 'Left Knee', 'Legs', '["Orthopedics"]'),
('knee_right', 'Right Knee', 'Legs', '["Orthopedics"]'),
('calf_left', 'Left Calf/Shin', 'Legs', '["Orthopedics"]'),
('calf_right', 'Right Calf/Shin', 'Legs', '["Orthopedics"]'),
('ankle_left', 'Left Ankle', 'Legs', '["Orthopedics"]'),
('ankle_right', 'Right Ankle', 'Legs', '["Orthopedics"]'),
('foot_left', 'Left Foot', 'Legs', '["Orthopedics", "Podiatry"]'),
('foot_right', 'Right Foot', 'Legs', '["Orthopedics", "Podiatry"]'),
('skin', 'Skin (General)', 'Systemic', '["Dermatology"]'),
('whole_body', 'Whole Body (General)', 'Systemic', '["General Medicine"]');
