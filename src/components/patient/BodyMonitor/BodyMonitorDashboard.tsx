import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Brain, AlertCircle, TrendingUp, Calendar, Camera, Sparkles } from 'lucide-react';
import Interactive3DBody from './Interactive3DBody';
import SymptomLogger from './SymptomLogger';
import VitalSignsPanel from './VitalSignsPanel';
import HealthInsights from './HealthInsights';

interface BodyMonitorDashboardProps {
    patient: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

interface BodyPartHealth {
    id: number;
    body_part_id: number;
    body_part_name: string;
    display_name: string;
    category: string;
    status: 'healthy' | 'monitoring' | 'concern' | 'critical';
    symptom_count: number;
    last_symptom_date?: string;
}

const BodyMonitorDashboard: React.FC<BodyMonitorDashboardProps> = ({ patient }) => {
    const [selectedBodyPart, setSelectedBodyPart] = useState<number | null>(null);
    const [healthStatus, setHealthStatus] = useState<BodyPartHealth[]>([]);
    const [showSymptomLogger, setShowSymptomLogger] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);

    const apiUrl = (path: string) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';
        return `${baseUrl}${path}`;
    };

    // Fetch health status for all body parts
    useEffect(() => {
        fetchHealthStatus();
    }, [patient.id]);

    const fetchHealthStatus = async () => {
        try {
            const response = await fetch(apiUrl(`/api/body-monitor/health-status/${patient.id}`));
            const data = await response.json();

            if (data.success) {
                setHealthStatus(data.healthStatus);
            }
        } catch (error) {
            console.error('Error fetching health status:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerAIAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(apiUrl('/api/body-monitor/analyze'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: patient.id })
            });

            const data = await response.json();

            if (data.success) {
                // Refresh insights
                alert(`AI Analysis complete! Found ${data.insights?.length || 0} new insights.`);
            }
        } catch (error) {
            console.error('Error running AI analysis:', error);
            alert('AI analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStatusStats = () => {
        const stats = {
            healthy: healthStatus.filter(h => h.status === 'healthy').length,
            monitoring: healthStatus.filter(h => h.status === 'monitoring').length,
            concern: healthStatus.filter(h => h.status === 'concern').length,
            critical: healthStatus.filter(h => h.status === 'critical').length,
            total: healthStatus.length
        };
        return stats;
    };

    const stats = getStatusStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Smart Body Monitor
                        </h1>
                        <p className="text-blue-200">
                            Comprehensive health tracking for {patient.firstName} {patient.lastName}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerAIAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                    >
                        <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? 'Analyzing...' : 'AI Health Analysis'}
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Heart className="w-6 h-6" />}
                    label="Healthy"
                    value={stats.healthy}
                    total={stats.total}
                    color="from-green-500 to-emerald-600"
                />
                <StatCard
                    icon={<Activity className="w-6 h-6" />}
                    label="Monitoring"
                    value={stats.monitoring}
                    total={stats.total}
                    color="from-blue-500 to-cyan-600"
                />
                <StatCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="Concern"
                    value={stats.concern}
                    total={stats.total}
                    color="from-yellow-500 to-orange-600"
                />
                <StatCard
                    icon={<Brain className="w-6 h-6" />}
                    label="Critical"
                    value={stats.critical}
                    total={stats.total}
                    color="from-red-500 to-pink-600"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Body Model */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-7 h-7 text-blue-400" />
                            Interactive Body Map
                        </h2>
                        <button
                            onClick={() => setShowSymptomLogger(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                            Log Symptom
                        </button>
                    </div>

                    <div className="h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-blue-900/30">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full">
                                <div className="text-white text-lg">Loading 3D Model...</div>
                            </div>
                        }>
                            <Interactive3DBody
                                healthStatus={healthStatus}
                                onBodyPartClick={setSelectedBodyPart}
                                selectedBodyPart={selectedBodyPart}
                            />
                        </Suspense>
                    </div>

                    {selectedBodyPart && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-blue-600/20 border border-blue-400/30 rounded-lg"
                        >
                            <p className="text-blue-200 text-sm">
                                Selected: <span className="text-white font-semibold">
                                    {healthStatus.find(h => h.body_part_id === selectedBodyPart)?.display_name || 'Unknown'}
                                </span>
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Vital Signs */}
                    <VitalSignsPanel patientId={patient.id} />

                    {/* AI Insights */}
                    <HealthInsights patientId={patient.id} />
                </div>
            </div>

            {/* Symptom Logger Modal */}
            <AnimatePresence>
                {showSymptomLogger && (
                    <SymptomLogger
                        patientId={patient.id}
                        preselectedBodyPart={selectedBodyPart}
                        onClose={() => {
                            setShowSymptomLogger(false);
                            fetchHealthStatus(); // Refresh after logging
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Stats Card Component
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    total: number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, total, color }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    {icon}
                </div>
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <div className="text-sm font-medium opacity-90">{label}</div>
            <div className="mt-2 text-xs opacity-75">{percentage}% of body parts</div>
        </motion.div>
    );
};

export default BodyMonitorDashboard;
