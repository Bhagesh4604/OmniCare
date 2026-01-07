const express = require('express');
const router = express.Router();
const db = require('./db.cjs');
const { generateAIResponse } = require('./aiService.cjs');

// Calculate Disease Risk Score
router.post('/api/health-risk/calculate', async (req, res) => {
    try {
        const { patientId } = req.body;

        // Get patient data
        const [patient] = await db.query(
            'SELECT * FROM patients WHERE id = ?',
            [patientId]
        );

        if (!patient.length) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const patientData = patient[0];

        // Get medical history
        const [medicalHistory] = await db.query(
            'SELECT * FROM medical_records WHERE patientId = ? ORDER BY createdAt DESC LIMIT 10',
            [patientId]
        );

        // Get lab results
        const [labResults] = await db.query(
            'SELECT * FROM lab_results WHERE patientId = ? ORDER BY createdAt DESC LIMIT 20',
            [patientId]
        );

        // Calculate age
        const birthDate = new Date(patientData.dateOfBirth);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

        // Prepare data for AI analysis
        const analysisPrompt = `
You are a medical risk assessment AI. Analyze the following patient data and predict disease risks.

Patient Profile:
- Age: ${age}
- Gender: ${patientData.gender}
- Medical History: ${medicalHistory.map(h => h.diagnosis).join(', ') || 'None'}
- Recent Lab Results: ${labResults.map(l => `${l.testName}: ${l.result}`).join(', ') || 'None'}

Provide a comprehensive risk assessment for:
1. Heart Disease (CVD) - Risk percentage (0-100%)
2. Type 2 Diabetes - Risk percentage (0-100%)
3. Cancer (General) - Risk percentage (0-100%)
4. Hypertension - Risk percentage (0-100%)
5. Stroke - Risk percentage (0-100%)

For each disease, provide:
- Risk Level: Low/Moderate/High/Critical
- Risk Percentage: 0-100%
- Key Risk Factors: List specific factors
- Prevention Recommendations: Actionable steps

Format your response as JSON:
{
  "diseases": [
    {
      "name": "Heart Disease",
      "riskLevel": "Moderate",
      "riskPercentage": 35,
      "keyFactors": ["Age over 45", "Family history"],
      "recommendations": ["Exercise 30 min daily", "Reduce sodium intake"]
    }
  ],
  "overallHealthScore": 75,
  "urgentActions": ["Schedule annual checkup"],
  "summary": "Brief overall assessment"
}`;

        // Get AI prediction
        const aiResponse = await generateAIResponse(analysisPrompt, [], 'health-risk-system');

        // Parse AI response
        let riskAssessment;
        try {
            // Extract JSON from AI response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            riskAssessment = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Fallback assessment
            riskAssessment = {
                diseases: [
                    {
                        name: "Heart Disease",
                        riskLevel: "Moderate",
                        riskPercentage: 30,
                        keyFactors: ["Age", "Lifestyle factors"],
                        recommendations: ["Regular exercise", "Healthy diet", "Annual checkups"]
                    },
                    {
                        name: "Type 2 Diabetes",
                        riskLevel: "Low",
                        riskPercentage: 15,
                        keyFactors: ["No significant risk factors detected"],
                        recommendations: ["Maintain healthy weight", "Monitor blood sugar"]
                    }
                ],
                overallHealthScore: 75,
                urgentActions: [],
                summary: "Overall health appears stable. Continue preventive care."
            };
        }

        // Store risk assessment in database
        await db.query(
            `INSERT INTO health_risk_assessments 
            (patientId, assessmentData, overallScore, createdAt) 
            VALUES (?, ?, ?, NOW())`,
            [patientId, JSON.stringify(riskAssessment), riskAssessment.overallHealthScore]
        );

        res.json({
            success: true,
            assessment: riskAssessment,
            patientAge: age
        });

    } catch (error) {
        console.error('Error calculating health risk:', error);
        res.status(500).json({ error: 'Failed to calculate health risk' });
    }
});

// Get Risk History
router.get('/api/health-risk/history/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;

        const [history] = await db.query(
            `SELECT * FROM health_risk_assessments 
            WHERE patientId = ? 
            ORDER BY createdAt DESC 
            LIMIT 10`,
            [patientId]
        );

        const parsedHistory = history.map(item => ({
            ...item,
            assessmentData: JSON.parse(item.assessmentData)
        }));

        res.json({ success: true, history: parsedHistory });
    } catch (error) {
        console.error('Error fetching risk history:', error);
        res.status(500).json({ error: 'Failed to fetch risk history' });
    }
});

// Get Prevention Plan
router.post('/api/health-risk/prevention-plan', async (req, res) => {
    try {
        const { patientId, disease } = req.body;

        const prompt = `
Create a detailed, personalized prevention plan for ${disease}.

The plan should include:
1. Lifestyle Changes (specific, actionable)
2. Dietary Recommendations (with meal examples)
3. Exercise Plan (type, duration, frequency)
4. Screening Schedule (what tests, when)
5. Warning Signs to Watch For
6. Emergency Actions

Make it practical, motivating, and easy to follow.

Format as JSON:
{
  "disease": "${disease}",
  "lifestyleChanges": ["Change 1", "Change 2"],
  "dietaryPlan": {
    "recommendations": ["Tip 1"],
    "foodsToEat": ["Food 1"],
    "foodsToAvoid": ["Food 1"]
  },
  "exercisePlan": {
    "type": "Aerobic",
    "duration": "30 minutes",
    "frequency": "5 days/week",
    "activities": ["Walking", "Swimming"]
  },
  "screeningSchedule": ["Annual blood pressure check"],
  "warningSigns": ["Symptom 1"],
  "emergencyActions": ["Call 911 if..."]
}`;

        const aiResponse = await generateAIResponse(prompt, [], 'prevention-planner');

        // Parse plan
        let preventionPlan;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            preventionPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
            preventionPlan = {
                disease,
                lifestyleChanges: ["Maintain healthy weight", "Reduce stress", "Avoid smoking"],
                dietaryPlan: {
                    recommendations: ["Eat more fruits and vegetables", "Reduce processed foods"],
                    foodsToEat: ["Leafy greens", "Whole grains", "Lean proteins"],
                    foodsToAvoid: ["Trans fats", "Excessive sugar", "Processed meats"]
                },
                exercisePlan: {
                    type: "Moderate aerobic activity",
                    duration: "30 minutes",
                    frequency: "5 days/week",
                    activities: ["Brisk walking", "Cycling", "Swimming"]
                },
                screeningSchedule: ["Annual physical exam", "Regular blood work"],
                warningSigns: ["Unusual fatigue", "Chest pain", "Shortness of breath"],
                emergencyActions: ["Call emergency services for severe symptoms"]
            };
        }

        res.json({ success: true, plan: preventionPlan });
    } catch (error) {
        console.error('Error generating prevention plan:', error);
        res.status(500).json({ error: 'Failed to generate prevention plan' });
    }
});

module.exports = router;
