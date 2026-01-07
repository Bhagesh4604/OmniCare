const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for symptom photo uploads
const uploadDir = path.join(__dirname, '../uploads/symptoms');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'symptom-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ============================================================================
// BODY PARTS ENDPOINTS
// ============================================================================

/**
 * GET /api/body-monitor/body-parts
 * Get all body parts reference data
 */
router.get('/body-parts', async (req, res) => {
    try {
        const sql = 'SELECT * FROM body_parts ORDER BY category, name';

        const bodyParts = await new Promise((resolve, reject) => {
            executeQuery(sql, [], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Parse JSON fields
        const parsedBodyParts = bodyParts.map(part => ({
            ...part,
            related_specialties: typeof part.related_specialties === 'string'
                ? JSON.parse(part.related_specialties)
                : part.related_specialties
        }));

        res.json({ success: true, bodyParts: parsedBodyParts });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching body parts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch body parts' });
    }
});

/**
 * GET /api/body-monitor/body-parts/:category
 * Get body parts by category
 */
router.get('/body-parts/:category', async (req, res) => {
    const { category } = req.params;

    try {
        const sql = 'SELECT * FROM body_parts WHERE category = ? ORDER BY name';

        const bodyParts = await new Promise((resolve, reject) => {
            executeQuery(sql, [category], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const parsedBodyParts = bodyParts.map(part => ({
            ...part,
            related_specialties: typeof part.related_specialties === 'string'
                ? JSON.parse(part.related_specialties)
                : part.related_specialties
        }));

        res.json({ success: true, bodyParts: parsedBodyParts });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching body parts by category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch body parts' });
    }
});

// ============================================================================
// HEALTH STATUS ENDPOINTS
// ============================================================================

/**
 * GET /api/body-monitor/health-status/:patientId
 * Get health status for all body parts of a patient
 */
router.get('/health-status/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const sql = `
      SELECT 
        pbh.*,
        bp.name AS body_part_name,
        bp.display_name,
        bp.category,
        (SELECT COUNT(*) FROM symptom_logs WHERE patient_id = ? AND body_part_id = bp.id) AS symptom_count
      FROM patient_body_health pbh
      JOIN body_parts bp ON pbh.body_part_id = bp.id
      WHERE pbh.patient_id = ?
      ORDER BY pbh.status DESC, bp.category, bp.name
    `;

        const healthStatus = await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId, patientId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, healthStatus });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching health status:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch health status' });
    }
});

/**
 * PUT /api/body-monitor/health-status/:patientId/:bodyPartId
 * Update body part health status
 */
router.put('/health-status/:patientId/:bodyPartId', async (req, res) => {
    const { patientId, bodyPartId } = req.params;
    const { status } = req.body;

    if (!['healthy', 'monitoring', 'concern', 'critical'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
        const sql = `
      INSERT INTO patient_body_health (patient_id, body_part_id, status, last_updated)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status = VALUES(status), last_updated = NOW()
    `;

        await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId, bodyPartId, status], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, message: 'Health status updated' });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error updating health status:', error);
        res.status(500).json({ success: false, message: 'Failed to update health status' });
    }
});

// ============================================================================
// SYMPTOM LOGGING ENDPOINTS
// ============================================================================

/**
 * POST /api/body-monitor/symptoms
 * Log a new symptom
 */
router.post('/symptoms', upload.single('photo'), async (req, res) => {
    const { patientId, bodyPartId, symptomType, severity, description, painLevel, relatedMedicationId } = req.body;
    const photoUrl = req.file ? `/uploads/symptoms/${req.file.filename}` : null;

    if (!patientId || !bodyPartId || !symptomType || !severity) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Insert symptom log
        const insertSql = `
      INSERT INTO symptom_logs (patient_id, body_part_id, symptom_type, severity, description, pain_level, photo_url, related_medication_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await new Promise((resolve, reject) => {
            executeQuery(insertSql, [patientId, bodyPartId, symptomType, severity, description, painLevel, photoUrl, relatedMedicationId || null], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Update body part health status
        const statusMap = {
            'mild': 'monitoring',
            'moderate': 'monitoring',
            'severe': 'concern',
            'critical': 'critical'
        };
        const newStatus = statusMap[severity];

        const updateStatusSql = `
      INSERT INTO patient_body_health (patient_id, body_part_id, status, last_symptom_date)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        status = CASE 
          WHEN VALUES(status) = 'critical' THEN 'critical'
          WHEN VALUES(status) = 'concern' AND status != 'critical' THEN 'concern'
          WHEN VALUES(status) = 'monitoring' AND status NOT IN ('critical', 'concern') THEN 'monitoring'
          ELSE status
        END,
        last_symptom_date = NOW()
    `;

        await new Promise((resolve, reject) => {
            executeQuery(updateStatusSql, [patientId, bodyPartId, newStatus], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(201).json({
            success: true,
            message: 'Symptom logged successfully',
            symptomId: result.insertId
        });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error logging symptom:', error);
        console.error('Request Data:', JSON.stringify({ patientId, bodyPartId, symptomType, severity }, null, 2));
        res.status(500).json({ success: false, message: 'Failed to log symptom' });
    }
});

/**
 * GET /api/body-monitor/symptoms/:patientId
 * Get all symptoms for a patient
 */
router.get('/symptoms/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const { limit = 50, bodyPartId } = req.query;

    try {
        let sql = `
      SELECT 
        sl.*,
        bp.name AS body_part_name,
        bp.display_name AS body_part_display_name,
        bp.category,
        p.medicationName AS related_medication
      FROM symptom_logs sl
      JOIN body_parts bp ON sl.body_part_id = bp.id
      LEFT JOIN prescriptions p ON sl.related_medication_id = p.id
      WHERE sl.patient_id = ?
    `;

        const params = [patientId];

        if (bodyPartId) {
            sql += ' AND sl.body_part_id = ?';
            params.push(bodyPartId);
        }

        sql += ' ORDER BY sl.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const symptoms = await new Promise((resolve, reject) => {
            executeQuery(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, symptoms });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching symptoms:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch symptoms' });
    }
});

/**
 * GET /api/body-monitor/symptoms/:patientId/:bodyPartId
 * Get symptoms for a specific body part
 */
router.get('/symptoms/:patientId/:bodyPartId', async (req, res) => {
    const { patientId, bodyPartId } = req.params;

    try {
        const sql = `
      SELECT 
        sl.*,
        bp.display_name AS body_part_display_name,
        p.medicationName AS related_medication
      FROM symptom_logs sl
      JOIN body_parts bp ON sl.body_part_id = bp.id
      LEFT JOIN prescriptions p ON sl.related_medication_id = p.id
      WHERE sl.patient_id = ? AND sl.body_part_id = ?
      ORDER BY sl.created_at DESC
    `;

        const symptoms = await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId, bodyPartId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, symptoms });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching body part symptoms:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch symptoms' });
    }
});

// ============================================================================
// VITAL SIGNS ENDPOINTS (Integration with existing tables)
// ============================================================================

/**
 * GET /api/body-monitor/vitals/:patientId
 * Get latest vital signs for a patient
 */
router.get('/vitals/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const sql = `
      SELECT * FROM patient_vitals_log
      WHERE patient_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;

        const vitals = await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0] || null);
            });
        });

        res.json({ success: true, vitals });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching vitals:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vital signs' });
    }
});

/**
 * GET /api/body-monitor/vitals/:patientId/history
 * Get vital signs history with trend analysis
 */
router.get('/vitals/:patientId/history', async (req, res) => {
    const { patientId } = req.params;
    const { hours = 24 } = req.query;

    try {
        const sql = `
      SELECT * FROM patient_vitals_log
      WHERE patient_id = ? 
      AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY timestamp ASC
    `;

        const history = await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId, parseInt(hours)], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Calculate trends
        let trends = null;
        if (history.length > 1) {
            const heartRates = history.map(v => v.heart_rate).filter(v => v);
            const spo2s = history.map(v => v.spo2).filter(v => v);

            trends = {
                heartRate: {
                    avg: heartRates.length ? (heartRates.reduce((a, b) => a + b, 0) / heartRates.length).toFixed(1) : null,
                    min: heartRates.length ? Math.min(...heartRates) : null,
                    max: heartRates.length ? Math.max(...heartRates) : null
                },
                spo2: {
                    avg: spo2s.length ? (spo2s.reduce((a, b) => a + b, 0) / spo2s.length).toFixed(1) : null,
                    min: spo2s.length ? Math.min(...spo2s) : null,
                    max: spo2s.length ? Math.max(...spo2s) : null
                }
            };
        }

        res.json({ success: true, history, trends });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching vital signs history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vital signs history' });
    }
});

// ============================================================================
// AI HEALTH INSIGHTS ENDPOINTS
// ============================================================================

const { analyzePatientHealth, getPatientInsights, dismissInsight } = require('./ai/healthAnalyzer.cjs');

/**
 * POST /api/body-monitor/analyze
 * Trigger AI analysis for a patient
 */
router.post('/analyze', async (req, res) => {
    const { patientId } = req.body;

    if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    try {
        const result = await analyzePatientHealth(patientId);
        res.json(result);
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error analyzing patient health:', error);
        res.status(500).json({ success: false, message: 'AI analysis failed', error: error.message });
    }
});

/**
 * GET /api/body-monitor/insights/:patientId
 * Get all AI insights for a patient
 */
router.get('/insights/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const { unreadOnly } = req.query;

    try {
        const insights = await getPatientInsights(patientId, unreadOnly === 'true');
        res.json({ success: true, insights });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error fetching insights:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch insights' });
    }
});

/**
 * POST /api/body-monitor/insights/:insightId/dismiss
 * Mark an insight as read/dismissed
 */
router.post('/insights/:insightId/dismiss', async (req, res) => {
    const { insightId } = req.params;

    try {
        await dismissInsight(insightId);
        res.json({ success: true, message: 'Insight dismissed' });
    } catch (error) {
        console.error('❌ [BODY MONITOR] Error dismissing insight:', error);
        res.status(500).json({ success: false, message: 'Failed to dismiss insight' });
    }
});

module.exports = router;
