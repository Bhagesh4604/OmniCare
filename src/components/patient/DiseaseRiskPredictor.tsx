import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, AlertTriangle, Shield, TrendingUp, Brain, Skull, ChevronRight, Loader } from 'lucide-react';
import apiUrl from '@/config/api';

const DiseaseRiskPredictor = ({ patientId }: { patientId: number }) => {
    const [loading, setLoading] = useState(false);
    const [assessment, setAssessment] = useState<any>(null);
    const [selectedDisease, setSelectedDisease] = useState<any>(null);
    const [preventionPlan, setPreventionPlan] = useState<any>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);

    const calculateRisk = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/api/health-risk/calculate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId })
            });
            const data = await response.json();
            if (data.success) {
                setAssessment(data.assessment);
            }
        } catch (error) {
            console.error('Error calculating risk:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPreventionPlan = async (disease: string) => {
        setLoadingPlan(true);
        try {
            const response = await fetch(apiUrl('/api/health-risk/prevention-plan'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, disease })
            });
            const data = await response.json();
            if (data.success) {
                setPreventionPlan(data.plan);
            }
        } catch (error) {
            console.error('Error loading prevention plan:', error);
        } finally {
            setLoadingPlan(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Low': return 'from-green-500 to-emerald-600';
            case 'Moderate': return 'from-yellow-500 to-amber-600';
            case 'High': return 'from-orange-500 to-red-600';
            case 'Critical': return 'from-red-600 to-rose-800';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getRiskIcon = (name: string) => {
        if (name.includes('Heart')) return Heart;
        if (name.includes('Diabetes')) return Activity;
        if (name.includes('Cancer')) return Skull;
        if (name.includes('Stroke')) return Brain;
        return Shield;
    };

    useEffect(() => {
        calculateRisk();
    }, [patientId]);

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-white mb-2">
                    AI Disease Risk Predictor
                </h1>
                <p className="text-blue-200">
                    Advanced AI analysis for early disease detection and prevention
                </p>
            </motion.div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader className="w-16 h-16 text-blue-400 animate-spin mb-4" />
                    <p className="text-xl text-white">Analyzing your health data...</p>
                    <p className="text-sm text-blue-300 mt-2">AI is processing thousands of data points</p>
                </div>
            ) : assessment ? (
                <div className="space-y-6">
                    {/* Overall Health Score */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider opacity-80 mb-2">Overall Health Score</p>
                                <h2 className="text-6xl font-bold">{assessment.overallHealthScore}</h2>
                                <p className="text-lg mt-2">/100</p>
                            </div>
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="white"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${assessment.overallHealthScore * 3.51} 351`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm opacity-90">{assessment.summary}</p>
                    </motion.div>

                    {/* Disease Risks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assessment.diseases?.map((disease: any, index: number) => {
                            const Icon = getRiskIcon(disease.name);
                            return (
                                <motion.div
                                    key={disease.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        setSelectedDisease(disease);
                                        loadPreventionPlan(disease.name);
                                    }}
                                    className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${getRiskColor(disease.riskLevel)}`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{disease.name}</h3>
                                                <p className="text-sm text-gray-400">{disease.riskLevel} Risk</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    </div>

                                    {/* Risk Percentage Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Risk Level</span>
                                            <span className="text-white font-bold">{disease.riskPercentage}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${disease.riskPercentage}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                                className={`h-full bg-gradient-to-r ${getRiskColor(disease.riskLevel)}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Key Factors */}
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Key Risk Factors</p>
                                        <div className="flex flex-wrap gap-2">
                                            {disease.keyFactors?.slice(0, 3).map((factor: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full"
                                                >
                                                    {factor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Urgent Actions */}
                    {assessment.urgentActions?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                                <h3 className="text-xl font-bold text-white">Urgent Actions Required</h3>
                            </div>
                            <ul className="space-y-2">
                                {assessment.urgentActions.map((action: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-200">
                                        <span className="text-red-400 mt-1">•</span>
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Prevention Plan Modal */}
                    {selectedDisease && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => {
                                setSelectedDisease(null);
                                setPreventionPlan(null);
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-bold text-white">Prevention Plan: {selectedDisease.name}</h2>
                                    <button
                                        onClick={() => {
                                            setSelectedDisease(null);
                                            setPreventionPlan(null);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {loadingPlan ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader className="w-12 h-12 text-blue-400 animate-spin" />
                                    </div>
                                ) : preventionPlan ? (
                                    <div className="space-y-6">
                                        {/* Recommendations */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedDisease.recommendations?.map((rec: string, i: number) => (
                                                <div key={i} className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                                    <p className="text-blue-200 flex items-start gap-2">
                                                        <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                        {rec}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Detailed Prevention Plan Sections */}
                                        {preventionPlan.lifestyleChanges && (
                                            <div className="bg-gray-800/30 rounded-xl p-6">
                                                <h3 className="text-xl font-bold text-white mb-4">Lifestyle Changes</h3>
                                                <ul className="space-y-2">
                                                    {preventionPlan.lifestyleChanges.map((change: string, i: number) => (
                                                        <li key={i} className="text-gray-300 flex items-start gap-2">
                                                            <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                            {change}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {preventionPlan.exercisePlan && (
                                            <div className="bg-gray-800/30 rounded-xl p-6">
                                                <h3 className="text-xl font-bold text-white mb-4">Exercise Plan</h3>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-400">Type</p>
                                                        <p className="text-white font-semibold">{preventionPlan.exercisePlan.type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">Frequency</p>
                                                        <p className="text-white font-semibold">{preventionPlan.exercisePlan.frequency}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {preventionPlan.exercisePlan.activities?.map((activity: string, i: number) => (
                                                        <span key={i} className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg text-sm">
                                                            {activity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {preventionPlan.warningSigns && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                                                <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                                                    <AlertTriangle className="w-6 h-6" />
                                                    Warning Signs to Watch For
                                                </h3>
                                                <ul className="space-y-2">
                                                    {preventionPlan.warningSigns.map((sign: string, i: number) => (
                                                        <li key={i} className="text-red-200">• {sign}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-400">No assessment data available</p>
                    <button
                        onClick={calculateRisk}
                        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                    >
                        Run Risk Assessment
                    </button>
                </div>
            )}
        </div>
    );
};

export default DiseaseRiskPredictor;
