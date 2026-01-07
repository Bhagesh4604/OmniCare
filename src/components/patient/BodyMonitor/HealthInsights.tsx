import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Info, Sparkles, X, ChevronRight } from 'lucide-react';

interface HealthInsightsProps {
    patientId: number;
}

interface Insight {
    id: number;
    insight_type: 'pattern' | 'risk' | 'recommendation' | 'alert';
    severity: 'info' | 'warning' | 'urgent' | 'critical';
    title: string;
    description: string;
    recommended_action?: string;
    recommended_specialist?: string;
    confidence_score: number;
    created_at: string;
    is_read: boolean;
    body_part_name?: string;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ patientId }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

    const apiUrl = (path: string) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';
        return `${baseUrl}${path}`;
    };

    useEffect(() => {
        fetchInsights();
    }, [patientId]);

    const fetchInsights = async () => {
        try {
            const response = await fetch(apiUrl(`/api/body-monitor/insights/${patientId}`));
            const data = await response.json();

            if (data.success) {
                setInsights(data.insights || []);
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissInsight = async (insightId: number) => {
        try {
            await fetch(apiUrl(`/api/body-monitor/insights/${insightId}/dismiss`), {
                method: 'POST'
            });

            setInsights(prev => prev.filter(i => i.id !== insightId));
            setSelectedInsight(null);
        } catch (error) {
            console.error('Error dismissing insight:', error);
        }
    };

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: 'bg-red-500/20',
                    border: 'border-red-500/50',
                    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
                    text: 'text-red-200'
                };
            case 'urgent':
                return {
                    bg: 'bg-orange-500/20',
                    border: 'border-orange-500/50',
                    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
                    text: 'text-orange-200'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500/20',
                    border: 'border-yellow-500/50',
                    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
                    text: 'text-yellow-200'
                };
            default:
                return {
                    bg: 'bg-blue-500/20',
                    border: 'border-blue-500/50',
                    icon: <Info className="w-5 h-5 text-blue-400" />,
                    text: 'text-blue-200'
                };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pattern':
                return <Brain className="w-4 h-4" />;
            case 'risk':
                return <AlertTriangle className="w-4 h-4" />;
            case 'recommendation':
                return <Sparkles className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="animate-pulse text-white">Loading insights...</div>
            </div>
        );
    }

    const unreadInsights = insights.filter(i => !i.is_read);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Brain className="w-6 h-6 text-purple-400" />
                        AI Health Insights
                    </h3>
                    {unreadInsights.length > 0 && (
                        <div className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                            {unreadInsights.length} new
                        </div>
                    )}
                </div>

                {insights.length === 0 ? (
                    <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                            No AI insights yet. Log symptoms or sync your vitals to get personalized health analysis.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {insights.slice(0, 5).map(insight => {
                            const config = getSeverityConfig(insight.severity);

                            return (
                                <motion.div
                                    key={insight.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedInsight(insight)}
                                    className={`${config.bg} border ${config.border} rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">{config.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getTypeIcon(insight.insight_type)}
                                                <span className="text-xs font-semibold text-gray-300 uppercase">
                                                    {insight.insight_type}
                                                </span>
                                            </div>
                                            <h4 className={`font-semibold ${config.text} line-clamp-2`}>
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                                {insight.description}
                                            </p>
                                            {insight.body_part_name && (
                                                <div className="mt-2 text-xs text-gray-400">
                                                    Related: {insight.body_part_name}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {insights.length > 5 && (
                    <div className="mt-4 text-center">
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            View all {insights.length} insights →
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedInsight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedInsight(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    {getSeverityConfig(selectedInsight.severity).icon}
                                    <div>
                                        <div className="text-sm text-gray-400 uppercase">
                                            {selectedInsight.insight_type}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {selectedInsight.title}
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedInsight(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Analysis</h3>
                                    <p className="text-white leading-relaxed">{selectedInsight.description}</p>
                                </div>

                                {selectedInsight.recommended_action && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommended Action</h3>
                                        <p className="text-white leading-relaxed">{selectedInsight.recommended_action}</p>
                                    </div>
                                )}

                                {selectedInsight.recommended_specialist && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Recommended Specialist</h3>
                                        <p className="text-white">{selectedInsight.recommended_specialist}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                    <div className="text-sm text-gray-400">
                                        Confidence: {Math.round((selectedInsight.confidence_score || 0.85) * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(selectedInsight.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setSelectedInsight(null)}
                                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => dismissInsight(selectedInsight.id)}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Mark as Read
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default HealthInsights;
