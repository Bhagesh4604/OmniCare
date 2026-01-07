-- AI Disease Risk Predictor Tables
CREATE TABLE IF NOT EXISTS health_risk_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    assessmentData JSON NOT NULL,
    overallScore INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_created (patientId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mental Health Crisis Detection Tables
CREATE TABLE IF NOT EXISTS mental_health_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    moodLevel INT NOT NULL CHECK (moodLevel BETWEEN 1 AND 10),
    emotions JSON,
    notes TEXT,
    activities JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_mood (patientId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mental_health_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    assessmentData JSON NOT NULL,
    crisisLevel VARCHAR(20) NOT NULL,
    suicideRisk INT NOT NULL DEFAULT 0,
    requiresIntervention BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_crisis_detection (patientId, requiresIntervention, createdAt),
    INDEX idx_high_risk (suicideRisk, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS crisis_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    eventType VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolvedAt DATETIME NULL,
    resolvedBy INT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (resolvedBy) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_unresolved (patientId, resolved, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    readAt DATETIME NULL,
    FOREIGN KEY (userId) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_unread (userId, isRead, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_chat (patientId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
