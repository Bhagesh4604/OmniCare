const express = require('express');
const router = express.Router();
const db = require('./db.cjs');
const { generateAIResponse } = require('./aiService.cjs');

// Analyze Mental Health Status
router.post('/api/mental-health/analyze', async (req, res) => {
    try {
        const { patientId, textInput, voiceTranscript, activityData } = req.body;

        // Get recent mood logs
        const [moodLogs] = await db.query(
            `SELECT * FROM mental_health_logs 
            WHERE patientId = ? 
            ORDER BY createdAt DESC 
            LIMIT 30`,
            [patientId]
        );

        // Get chat history for sentiment analysis
        const [chatHistory] = await db.query(
            `SELECT message FROM ai_chat_history 
            WHERE patientId = ? 
            ORDER BY createdAt DESC 
            LIMIT 50`,
            [patientId]
        );

        const recentMessages = chatHistory.map(c => c.message).join('\n');

        // AI Prompt for Crisis Detection
        const analysisPrompt = `
You are a mental health crisis detection AI. Analyze the following data to assess suicide risk, depression, and anxiety levels.

Recent Chat Messages:
${recentMessages || 'No recent messages'}

Current Input:
${textInput || voiceTranscript || 'No current input'}

Recent Mood Logs:
${moodLogs.map(m => `${m.moodLevel}/10 - ${m.notes || ''}`).join('\n') || 'No mood logs'}

Activity Pattern:
${activityData ? JSON.stringify(activityData) : 'No activity data'}

Analyze and provide:
1. CRISIS LEVEL: None/Low/Moderate/High/Critical (0-100%)
2. SUICIDE RISK: Percentage (0-100%)
3. DEPRESSION INDICATORS: Yes/No + Severity (Mild/Moderate/Severe)
4. ANXIETY INDICATORS: Yes/No + Severity
5. WARNING SIGNS DETECTED: List specific concerning patterns
6. IMMEDIATE ACTIONS REQUIRED: What to do NOW
7. RECOMMENDED INTERVENTIONS: Professional help needed?
8. SUPPORTIVE MESSAGE: Empathetic response to patient

CRITICAL: If suicide risk > 30% or crisis level is High/Critical, set "requiresImmediateIntervention": true

Format as JSON:
{
  "crisisLevel": "Moderate",
  "crisisPercentage": 45,
  "suicideRisk": 25,
  "depressionDetected": true,
  "depressionSeverity": "Moderate",
  "anxietyDetected": true,
  "anxietySeverity": "Mild",
  "warningSign": ["Social withdrawal", "Negative self-talk"],
  "immediateActions": ["Reach out to support system", "Use coping techniques"],
  "recommendedInterventions": ["Consider counseling", "Medication review"],
  "requiresImmediateIntervention": false,
  "supportiveMessage": "Your feelings are valid...",
  "riskFactors": ["Isolation", "Sleep disturbance"],
  "protectiveFactors": ["Social support", "Engagement with treatment"]
}`;

        const aiResponse = await generateAIResponse(analysisPrompt, [], 'mental-health-crisis-detector');

        // Parse AI response
        let mentalHealthAssessment;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            mentalHealthAssessment = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (parseError) {
            console.error('Error parsing mental health AI response:', parseError);
            mentalHealthAssessment = {
                crisisLevel: "Low",
                crisisPercentage: 10,
                suicideRisk: 5,
                depressionDetected: false,
                anxietyDetected: false,
                warningSign: [],
                immediateActions: ["Continue self-care practices"],
                recommendedInterventions: [],
                requiresImmediateIntervention: false,
                supportiveMessage: "Your mental health matters. Don't hesitate to reach out if you need support.",
                riskFactors: [],
                protectiveFactors: ["Seeking help", "Using app resources"]
            };
        }

        // Store assessment
        await db.query(
            `INSERT INTO mental_health_assessments 
            (patientId, assessmentData, crisisLevel, suicideRisk, requiresIntervention, createdAt) 
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                patientId,
                JSON.stringify(mentalHealthAssessment),
                mentalHealthAssessment.crisisLevel,
                mentalHealthAssessment.suicideRisk || 0,
                mentalHealthAssessment.requiresImmediateIntervention
            ]
        );

        // If crisis detected, alert counselors/doctors
        if (mentalHealthAssessment.requiresImmediateIntervention || mentalHealthAssessment.suicideRisk > 30) {
            // Get patient's assigned doctor
            const [patient] = await db.query('SELECT * FROM patients WHERE id = ?', [patientId]);

            if (patient.length && patient[0].doctorId) {
                // Create urgent alert for doctor
                await db.query(
                    `INSERT INTO alerts 
                    (userId, type, message, severity, createdAt) 
                    VALUES (?, 'MENTAL_HEALTH_CRISIS', ?, 'CRITICAL', NOW())`,
                    [
                        patient[0].doctorId,
                        `URGENT: Patient ${patient[0].firstName} ${patient[0].lastName} showing high suicide risk (${mentalHealthAssessment.suicideRisk}%). Immediate intervention required.`
                    ]
                );
            }

            // Log crisis event
            await db.query(
                `INSERT INTO crisis_events 
                (patientId, eventType, severity, description, createdAt) 
                VALUES (?, 'MENTAL_HEALTH_CRISIS', ?, ?, NOW())`,
                [
                    patientId,
                    mentalHealthAssessment.crisisLevel,
                    JSON.stringify(mentalHealthAssessment.warningSign)
                ]
            );
        }

        res.json({
            success: true,
            assessment: mentalHealthAssessment,
            emergencyContacts: mentalHealthAssessment.requiresImmediateIntervention ? {
                nationalSuicidePreventionLifeline: '988',
                crisisTextLine: 'Text HOME to 741741',
                emergencyServices: '911'
            } : null
        });

    } catch (error) {
        console.error('Error analyzing mental health:', error);
        res.status(500).json({ error: 'Failed to analyze mental health status' });
    }
});

// Log Mood Entry
router.post('/api/mental-health/mood-log', async (req, res) => {
    try {
        const { patientId, moodLevel, emotions, notes, activities } = req.body;

        await db.query(
            `INSERT INTO mental_health_logs 
            (patientId, moodLevel, emotions, notes, activities, createdAt) 
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [patientId, moodLevel, JSON.stringify(emotions), notes, JSON.stringify(activities)]
        );

        res.json({ success: true, message: 'Mood logged successfully' });
    } catch (error) {
        console.error('Error logging mood:', error);
        res.status(500).json({ error: 'Failed to log mood' });
    }
});

// Get Mood History
router.get('/api/mental-health/mood-history/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { days = 30 } = req.query;

        const [moodHistory] = await db.query(
            `SELECT * FROM mental_health_logs 
            WHERE patientId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY createdAt DESC`,
            [patientId, days]
        );

        const parsedHistory = moodHistory.map(item => ({
            ...item,
            emotions: JSON.parse(item.emotions || '[]'),
            activities: JSON.parse(item.activities || '[]')
        }));

        res.json({ success: true, history: parsedHistory });
    } catch (error) {
        console.error('Error fetching mood history:', error);
        res.status(500).json({ error: 'Failed to fetch mood history' });
    }
});

// Get Coping Strategies
router.post('/api/mental-health/coping-strategies', async (req, res) => {
    try {
        const { emotion, situation } = req.body;

        const prompt = `
Provide evidence-based coping strategies for someone experiencing ${emotion} due to ${situation}.

Include:
1. Immediate Coping Techniques (can do right now)
2. Breathing Exercises (step-by-step)
3. Grounding Techniques
4. Cognitive Reframing Strategies
5. Physical Activities
6. Social Support Strategies
7. Professional Resources

Make it practical, compassionate, and actionable.

Format as JSON:
{
  "immediateStrategies": ["Strategy 1 - detailed steps"],
  "breathingExercises": [{"name": "4-7-8 Breathing", "steps": ["Inhale 4 sec", "Hold 7 sec", "Exhale 8 sec"]}],
  "groundingTechniques": ["5-4-3-2-1 sensory technique"],
  "cognitiveReframing": ["Challenge negative thoughts"],
  "physicalActivities": ["Take a short walk"],
  "socialSupport": ["Call a friend"],
  "professionalResources": ["Therapist", "Crisis helpline"],
  "encouragingMessage": "Supportive message"
}`;

        const aiResponse = await generateAIResponse(prompt, [], 'coping-strategies');

        let strategies;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            strategies = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
            strategies = {
                immediateStrategies: [
                    "Take 10 slow, deep breaths",
                    "Move to a quiet, comfortable space",
                    "Drink a glass of water"
                ],
                breathingExercises: [{
                    name: "Box Breathing",
                    steps: ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold for 4 counts"]
                }],
                groundingTechniques: [
                    "Name 5 things you can see",
                    "4 things you can touch",
                    "3 things you can hear"
                ],
                professionalResources: ["National Suicide Prevention Lifeline: 988"],
                encouragingMessage: "You're taking the right step by seeking help. These feelings will pass."
            };
        }

        res.json({ success: true, strategies });
    } catch (error) {
        console.error('Error generating coping strategies:', error);
        res.status(500).json({ error: 'Failed to generate coping strategies' });
    }
});

// Get Mental Health Insights
router.get('/api/mental-health/insights/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;

        // Get mood trends
        const [moodTrends] = await db.query(
            `SELECT 
                DATE(createdAt) as date,
                AVG(moodLevel) as avgMood,
                COUNT(*) as entries
            FROM mental_health_logs
            WHERE patientId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date`,
            [patientId]
        );

        // Get crisis history
        const [crisisHistory] = await db.query(
            `SELECT crisisLevel, suicideRisk, createdAt 
            FROM mental_health_assessments 
            WHERE patientId = ? 
            ORDER BY createdAt DESC 
            LIMIT 10`,
            [patientId]
        );

        res.json({
            success: true,
            moodTrends,
            crisisHistory,
            insights: {
                averageMood: moodTrends.length ?
                    (moodTrends.reduce((sum, t) => sum + parseFloat(t.avgMood), 0) / moodTrends.length).toFixed(1) :
                    null,
                totalEntries: moodTrends.reduce((sum, t) => sum + t.entries, 0),
                recentCrises: crisisHistory.filter(c => c.suicideRisk > 30).length
            }
        });
    } catch (error) {
        console.error('Error fetching mental health insights:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

module.exports = router;
