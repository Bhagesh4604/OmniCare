const { executeQuery } = require('./db.cjs');

const createTableSql = `
CREATE TABLE IF NOT EXISTS body_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  related_specialties JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const bodyPartsData = [
    // Head & Neck
    { name: 'head', display_name: 'Head', category: 'Head & Neck', specialties: ['Neurology', 'ENT'] },
    { name: 'eyes', display_name: 'Eyes', category: 'Head & Neck', specialties: ['Ophthalmology'] },
    { name: 'ears', display_name: 'Ears', category: 'Head & Neck', specialties: ['ENT'] },
    { name: 'nose', display_name: 'Nose', category: 'Head & Neck', specialties: ['ENT'] },
    { name: 'mouth', display_name: 'Mouth/Throat', category: 'Head & Neck', specialties: ['ENT', 'Dental'] },
    { name: 'neck', display_name: 'Neck', category: 'Head & Neck', specialties: ['Orthopedics', 'ENT'] },

    // Torso
    { name: 'chest', display_name: 'Chest', category: 'Torso', specialties: ['Cardiology', 'Pulmonology'] },
    { name: 'heart', display_name: 'Heart', category: 'Torso', specialties: ['Cardiology'] },
    { name: 'lungs', display_name: 'Lungs', category: 'Torso', specialties: ['Pulmonology'] },
    { name: 'stomach', display_name: 'Stomach/Abdomen', category: 'Torso', specialties: ['Gastroenterology'] },
    { name: 'back_upper', display_name: 'Upper Back', category: 'Torso', specialties: ['Orthopedics'] },
    { name: 'back_lower', display_name: 'Lower Back', category: 'Torso', specialties: ['Orthopedics'] },

    // Arms
    { name: 'shoulder_left', display_name: 'Left Shoulder', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'shoulder_right', display_name: 'Right Shoulder', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'arm_left', display_name: 'Left Arm', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'arm_right', display_name: 'Right Arm', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'elbow_left', display_name: 'Left Elbow', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'elbow_right', display_name: 'Right Elbow', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'wrist_left', display_name: 'Left Wrist', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'wrist_right', display_name: 'Right Wrist', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'hand_left', display_name: 'Left Hand', category: 'Arms', specialties: ['Orthopedics'] },
    { name: 'hand_right', display_name: 'Right Hand', category: 'Arms', specialties: ['Orthopedics'] },

    // Legs
    { name: 'hip_left', display_name: 'Left Hip', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'hip_right', display_name: 'Right Hip', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'thigh_left', display_name: 'Left Thigh', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'thigh_right', display_name: 'Right Thigh', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'knee_left', display_name: 'Left Knee', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'knee_right', display_name: 'Right Knee', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'calf_left', display_name: 'Left Calf/Shin', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'calf_right', display_name: 'Right Calf/Shin', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'ankle_left', display_name: 'Left Ankle', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'ankle_right', display_name: 'Right Ankle', category: 'Legs', specialties: ['Orthopedics'] },
    { name: 'foot_left', display_name: 'Left Foot', category: 'Legs', specialties: ['Orthopedics', 'Podiatry'] },
    { name: 'foot_right', display_name: 'Right Foot', category: 'Legs', specialties: ['Orthopedics', 'Podiatry'] },

    // Systemic
    { name: 'skin', display_name: 'Skin (General)', category: 'Systemic', specialties: ['Dermatology'] },
    { name: 'whole_body', display_name: 'Whole Body (General)', category: 'Systemic', specialties: ['General Medicine'] }
];

async function init() {
    console.log('Creating body_parts table...');
    await new Promise((resolve, reject) => {
        executeQuery(createTableSql, [], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
    console.log('Table created or already exists.');

    console.log('Seeding data...');
    for (const part of bodyPartsData) {
        const insertSql = `
      INSERT INTO body_parts (name, display_name, category, related_specialties)
      SELECT ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM body_parts WHERE name = ?)
    `;
        await new Promise((resolve, reject) => {
            executeQuery(insertSql, [part.name, part.display_name, part.category, JSON.stringify(part.specialties), part.name], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    console.log('Seeding complete.');
    process.exit();
}

init().catch(err => {
    console.error('Initialization failed:', err);
    process.exit(1);
});
