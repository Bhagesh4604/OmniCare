const { AzureOpenAI } = require("openai");
const { executeQuery } = require('./db.cjs');

// Initialize Azure OpenAI Client
const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    apiVersion: "2024-05-01-preview",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_ID
});

/**
 * Analyze patient health data and generate AI insights
 * @param {number} patientId - Patient ID
 * @returns {Promise<Object>} AI insights
 */
async function analyzePatientHealth(patientId) {
    try {
        // Get patient symptoms from last 30 days
        const symptomsSql = `
      SELECT 
        sl.*,
        bp.name AS body_part_name,
        bp.display_name,
        bp.category
      FROM symptom_logs sl
      JOIN body_parts bp ON sl.body_part_id = bp.id
      WHERE sl.patient_id = ?
      AND sl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY sl.created_at DESC
    `;

        const symptoms = await new Promise((resolve, reject) => {
            executeQuery(symptomsSql, [patientId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (symptoms.length === 0) {
            return {
                success: true,
                message: 'No recent symptoms to analyze',
                insights: []
            };
        }

        // Get patient vital signs from last 7 days
        const vitalsSql = `
      SELECT * FROM patient_vitals_log
      WHERE patient_id = ?
      AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY timestamp DESC
    `;

        const vitals = await new Promise((resolve, reject) => {
            executeQuery(vitalsSql, [patientId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Prepare data for AI analysis
        const symptomSummary = symptoms.map(s => ({
            bodyPart: s.display_name,
            type: s.symptom_type,
            severity: s.severity,
            painLevel: s.pain_level,
            date: s.created_at
        }));

        const vitalsSummary = vitals.map(v => ({
            heartRate: v.heart_rate,
            spo2: v.spo2,
            timestamp: v.timestamp
        }));

        // Call Azure OpenAI for health analysis
        const prompt = `You are a medical AI assistant analyzing patient health data. 

Patient Symptoms (Last 30 days):
${JSON.stringify(symptomSummary, null, 2)}

Vital Signs (Last 7 days):
${vitalsSummary.length > 0 ? JSON.stringify(vitalsSummary, null, 2) : 'No vital signs data'}

Analyze this data and provide:
1. Pattern Detection: Identify any recurring patterns or trends
2. Risk Assessment: Assess health risks based on symptoms and vitals
3. Recommendations: Suggest actions (e.g., see specialist, lifestyle changes)
4. Specialist Recommendations: If medical attention is needed, which specialist?

Return as JSON:
{
  "patterns": [{"title": "...", "description": "...", "severity": "info|warning|urgent|critical"}],
  "risks": [{"title": "...", "description": "...", "severity": "...", "confidence": 0.0-1.0}],
  "recommendations": [{"title": "...", "action": "...", "specialist": "..."}]
}`;

        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a medical AI assistant. Provide health insights in JSON format." },
                { role: "user", content: prompt }
            ],
            model: process.env.AZURE_OPENAI_DEPLOYMENT_ID || "gpt-4o",
            response_format: { type: "json_object" },
            max_tokens: 1000
        });

        const aiAnalysis = JSON.parse(response.choices[0].message.content);

        // Store insights in database
        const insights = [];

        // Store patterns
        if (aiAnalysis.patterns) {
            for (const pattern of aiAnalysis.patterns) {
                const insertSql = `
          INSERT INTO ai_health_insights 
          (patient_id, insight_type, severity, title, description, confidence_score)
          VALUES (?, 'pattern', ?, ?, ?, 0.85)
        `;

                const result = await new Promise((resolve, reject) => {
                    executeQuery(insertSql, [patientId, pattern.severity, pattern.title, pattern.description], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });

                insights.push({
                    id: result.insertId,
                    type: 'pattern',
                    ...pattern
                });
            }
        }

        // Store risks
        if (aiAnalysis.risks) {
            for (const risk of aiAnalysis.risks) {
                const insertSql = `
          INSERT INTO ai_health_insights 
          (patient_id, insight_type, severity, title, description, confidence_score)
          VALUES (?, 'risk', ?, ?, ?, ?)
        `;

                const result = await new Promise((resolve, reject) => {
                    executeQuery(insertSql, [patientId, risk.severity, risk.title, risk.description, risk.confidence], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });

                insights.push({
                    id: result.insertId,
                    type: 'risk',
                    ...risk
                });
            }
        }

        // Store recommendations
        if (aiAnalysis.recommendations) {
            for (const rec of aiAnalysis.recommendations) {
                const insertSql = `
          INSERT INTO ai_health_insights 
          (patient_id, insight_type, severity, title, recommended_action, recommended_specialist, confidence_score)
          VALUES (?, 'recommendation', 'info', ?, ?, ?, 0.90)
        `;

                const result = await new Promise((resolve, reject) => {
                    executeQuery(insertSql, [patientId, rec.title, rec.action, rec.specialist || null], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });

                insights.push({
                    id: result.insertId,
                    type: 'recommendation',
                    ...rec
                });
            }
        }

        return {
            success: true,
            insights,
            rawAnalysis: aiAnalysis
        };

    } catch (error) {
        console.error('❌ [AI HEALTH ANALYZER] Error:', error);
        throw error;
    }
}

/**
 * Get all AI insights for a patient
 * @param {number} patientId - Patient ID
 * @param {boolean} unreadOnly - Only get unread insights
 * @returns {Promise<Array>} AI insights
 */
async function getPatientInsights(patientId, unreadOnly = false) {
    try {
        let sql = `
      SELECT 
        ahi.*,
        bp.display_name AS body_part_name
      FROM ai_health_insights ahi
      LEFT JOIN body_parts bp ON ahi.body_part_id = bp.id
      WHERE ahi.patient_id = ?
    `;

        if (unreadOnly) {
            sql += ' AND ahi.is_read = FALSE';
        }

        sql += ' ORDER BY ahi.severity DESC, ahi.created_at DESC';

        const insights = await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        return insights;
    } catch (error) {
        console.error('❌ [AI HEALTH ANALYZER] Error fetching insights:', error);
        throw error;
    }
}

/**
 * Mark insight as read/dismissed
 * @param {number} insightId - Insight ID
 * @returns {Promise<boolean>} Success
 */
async function dismissInsight(insightId) {
    try {
        const sql = `
      UPDATE ai_health_insights
      SET is_read = TRUE, dismissed_at = NOW()
      WHERE id = ?
    `;

        await new Promise((resolve, reject) => {
            executeQuery(sql, [insightId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        return true;
    } catch (error) {
        console.error('❌ [AI HEALTH ANALYZER] Error dismissing insight:', error);
        throw error;
    }
}

module.exports = {
    analyzePatientHealth,
    getPatientInsights,
    dismissInsight
};
