import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface VitalSignsPanelProps {
    patientId: number;
}

interface VitalSigns {
    heart_rate: number;
    spo2: number;
    timestamp: string;
    risk_score?: number;
}

interface Trends {
    heartRate: { avg: string; min: number; max: number };
    spo2: { avg: string; min: number; max: number };
}

const VitalSignsPanel: React.FC<VitalSignsPanelProps> = ({ patientId }) => {
    const [vitals, setVitals] = useState<VitalSigns | null>(null);
    const [history, setHistory] = useState<VitalSigns[]>([]);
    const [trends, setTrends] = useState<Trends | null>(null);
    const [loading, setLoading] = useState(true);

    const apiUrl = (path: string) => {
        // Use env var if set, otherwise use current domain (for Azure) or localhost
        const baseUrl = import.meta.env.VITE_API_BASE_URL ||
            (window.location.hostname === 'localhost' ? 'http://localhost:8086' : window.location.origin);
        return `${baseUrl}${path}`;
    };

    useEffect(() => {
        fetchVitals();
        fetchHistory();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchVitals();
            fetchHistory();
        }, 30000);

        return () => clearInterval(interval);
    }, [patientId]);

    const fetchVitals = async () => {
        try {
            const response = await fetch(apiUrl(`/api/body-monitor/vitals/${patientId}`));
            const data = await response.json();

            if (data.success && data.vitals) {
                setVitals(data.vitals);
            }
        } catch (error) {
            console.error('Error fetching vitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(apiUrl(`/api/body-monitor/vitals/${patientId}/history?hours=24`));
            const data = await response.json();

            if (data.success) {
                setHistory(data.history || []);
                setTrends(data.trends);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const getHeartRateStatus = (hr: number) => {
        if (hr < 60) return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Low' };
        if (hr > 100) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'High' };
        return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Normal' };
    };

    const getSpo2Status = (spo2: number) => {
        if (spo2 < 95) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Low' };
        return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Normal' };
    };

    const getTrendIcon = (current: number | undefined, avg: string | undefined) => {
        if (!current || !avg) return <Minus className="w-4 h-4" />;
        const avgNum = parseFloat(avg);
        if (current > avgNum + 5) return <TrendingUp className="w-4 h-4 text-red-400" />;
        if (current < avgNum - 5) return <TrendingDown className="w-4 h-4 text-blue-400" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="animate-pulse text-white">Loading vital signs...</div>
            </div>
        );
    }

    if (!vitals) {
        return (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-2">Vital Signs</h3>
                <p className="text-gray-400 text-sm">No vital signs data available</p>
            </div>
        );
    }

    const hrStatus = getHeartRateStatus(vitals.heart_rate);
    const spo2Status = getSpo2Status(vitals.spo2);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-green-400" />
                    Vital Signs
                </h3>
                <div className="text-xs text-gray-400">
                    Live
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
                </div>
            </div>

            {/* Vital Signs Cards */}
            <div className="space-y-4 mb-6">
                {/* Heart Rate */}
                <div className={`${hrStatus.bg} border border-white/10 rounded-xl p-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Heart className={`w-5 h-5 ${hrStatus.color}`} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-300">Heart Rate</div>
                                <div className={`text-2xl font-bold ${hrStatus.color}`}>
                                    {vitals.heart_rate} <span className="text-sm">bpm</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1">
                                {getTrendIcon(vitals.heart_rate, trends?.heartRate.avg)}
                            </div>
                            <div className={`text-xs ${hrStatus.color}`}>{hrStatus.label}</div>
                        </div>
                    </div>
                    {trends && (
                        <div className="mt-2 text-xs text-gray-400">
                            24h: {trends.heartRate.min}-{trends.heartRate.max} bpm (avg {trends.heartRate.avg})
                        </div>
                    )}
                </div>

                {/* SpO2 */}
                <div className={`${spo2Status.bg} border border-white/10 rounded-xl p-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Droplets className={`w-5 h-5 ${spo2Status.color}`} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-300">SpO2</div>
                                <div className={`text-2xl font-bold ${spo2Status.color}`}>
                                    {vitals.spo2} <span className="text-sm">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1">
                                {getTrendIcon(vitals.spo2, trends?.spo2.avg)}
                            </div>
                            <div className={`text-xs ${spo2Status.color}`}>{spo2Status.label}</div>
                        </div>
                    </div>
                    {trends && (
                        <div className="mt-2 text-xs text-gray-400">
                            24h: {trends.spo2.min}-{trends.spo2.max}% (avg {trends.spo2.avg}%)
                        </div>
                    )}
                </div>
            </div>

            {/* Trend Chart */}
            {history.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-white mb-3">24-Hour Trend</h4>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <XAxis
                                    dataKey="timestamp"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#cbd5e1' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="heart_rate"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Heart Rate"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="spo2"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                    name="SpO2"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="mt-4 text-xs text-gray-400 text-center">
                Last updated: {new Date(vitals.timestamp).toLocaleString()}
            </div>
        </motion.div>
    );
};

export default VitalSignsPanel;
