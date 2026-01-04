import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Heart, Search, Upload, AlertTriangle, CheckCircle,
    Microscope, ShieldAlert, FileText, Sparkles, Brain, Stethoscope
} from 'lucide-react';
import OncologyScreening from './OncologyScreening';
import apiUrl from '../config/api';

type DetectionMode = 'selection' | 'oncology' | 'cardiology' | 'dermatology';

export default function EarlyDetectionModule() {
    const [mode, setMode] = useState<DetectionMode>('selection');

    // --- CARDIOLOGY STATE ---
    const [cardioData, setCardioData] = useState({
        age: 45, gender: 'male', systolic: 120, diastolic: 80,
        cholesterol: 180, gluc: 90, smoker: false, active: true
    });
    const [cardioResult, setCardioResult] = useState<any>(null);
    const [loadingCardio, setLoadingCardio] = useState(false);

    // --- DERMATOLOGY STATE ---
    const [dermaFile, setDermaFile] = useState<File | null>(null);
    const [dermaResult, setDermaResult] = useState<any>(null);
    const [loadingDerma, setLoadingDerma] = useState(false);
    const [dermaPreview, setDermaPreview] = useState<string | null>(null);

    // --- HANDLERS ---

    const handleCardioAnalyze = async () => {
        setLoadingCardio(true);
        try {
            const res = await fetch(apiUrl('/api/ai/analyze-cardiology'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientData: cardioData })
            });
            const data = await res.json();
            setCardioResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCardio(false);
        }
    };

    const handleDermaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDermaFile(file);
            setDermaPreview(URL.createObjectURL(file));
            setDermaResult(null);
        }
    };

    const handleDermaAnalyze = async () => {
        if (!dermaFile) return;
        setLoadingDerma(true);
        const formData = new FormData();
        formData.append('image', dermaFile);

        try {
            const res = await fetch(apiUrl('/api/ai/analyze-dermatology'), {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setDermaResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDerma(false);
        }
    };

    // --- RENDER HELPERS ---

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            default: return 'text-green-500 bg-green-500/10 border-green-500/20';
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-black/20 overflow-hidden">
            {/* Header Navigation */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-black/40 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMode('selection')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <Brain className="text-violet-500" size={28} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Early Detection System</h1>
                        <p className="text-xs text-gray-500">AI-Powered Predictive Diagnostics</p>
                    </div>
                </div>

                {mode !== 'selection' && (
                    <button
                        onClick={() => setMode('selection')}
                        className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
                    >
                        Back to Hub
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 relative">
                <AnimatePresence mode="wait">

                    {/* HUB SELECTION */}
                    {mode === 'selection' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8"
                        >
                            {/* Oncology Card */}
                            <div onClick={() => setMode('oncology')} className="group cursor-pointer relative p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                <Microscope size={48} className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Oncology</h2>
                                <p className="text-gray-500 dark:text-gray-400">Tumor marker detection from biopsy reports and radiology scans.</p>
                            </div>

                            {/* Cardiology Card */}
                            <div onClick={() => setMode('cardiology')} className="group cursor-pointer relative p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 hover:border-red-500/50 transition-all hover:shadow-2xl hover:shadow-red-500/20">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                <Heart size={48} className="text-red-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Cardiology</h2>
                                <p className="text-gray-500 dark:text-gray-400">10-year cardiovascular risk assessment based on vitals and history.</p>
                            </div>

                            {/* Dermatology Card */}
                            <div onClick={() => setMode('dermatology')} className="group cursor-pointer relative p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/20">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                <Activity size={48} className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Dermatology</h2>
                                <p className="text-gray-500 dark:text-gray-400">Skin lesion analysis using Vision AI for early melanoma detection.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ONCOLOGY MODULE */}
                    {mode === 'oncology' && (
                        <motion.div key="oncology" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                            <OncologyScreening />
                        </motion.div>
                    )}

                    {/* CARDIOLOGY MODULE */}
                    {mode === 'cardiology' && (
                        <motion.div key="cardio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto bg-white dark:bg-white/5 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-white/10">
                            <div className="p-8 border-b border-gray-200 dark:border-white/10 bg-red-500/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500 rounded-xl shadow-lg shadow-red-500/30">
                                        <Heart className="text-white" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold">Heart Disease Risk Calculator</h2>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Form */}
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Patient Vitals</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Systolic BP</label>
                                            <input type="number" value={cardioData.systolic} onChange={(e) => setCardioData({ ...cardioData, systolic: +e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Diastolic BP</label>
                                            <input type="number" value={cardioData.diastolic} onChange={(e) => setCardioData({ ...cardioData, diastolic: +e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Total Cholesterol (mg/dL)</label>
                                        <input type="number" value={cardioData.cholesterol} onChange={(e) => setCardioData({ ...cardioData, cholesterol: +e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl" />
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={cardioData.smoker} onChange={(e) => setCardioData({ ...cardioData, smoker: e.target.checked })} className="w-5 h-5 accent-red-500" />
                                            <span className="font-medium">Smoker</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={cardioData.active} onChange={(e) => setCardioData({ ...cardioData, active: e.target.checked })} className="w-5 h-5 accent-green-500" />
                                            <span className="font-medium">Physically Active</span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleCardioAnalyze}
                                        disabled={loadingCardio}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all flex justify-center items-center gap-2"
                                    >
                                        {loadingCardio ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Activity />}
                                        Calculate Risk
                                    </button>
                                </div>

                                {/* Results */}
                                <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-6 min-h-[300px] flex flex-col">
                                    {cardioResult ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between ${getRiskColor(cardioResult.riskLevel)}`}>
                                                <div>
                                                    <p className="text-xs font-bold opacity-70 uppercase">Risk Assessment</p>
                                                    <p className="text-2xl font-black uppercase">{cardioResult.riskLevel} Risk</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold">{cardioResult.confidence}%</p>
                                                    <p className="text-xs opacity-70">Confidence</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                                    {cardioResult.summary}
                                                </p>

                                                <div>
                                                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Stethoscope size={16} /> Recommendations</h4>
                                                    <ul className="space-y-2">
                                                        {cardioResult.recommendations?.map((r: string, i: number) => (
                                                            <li key={i} className="text-sm bg-white dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5 flex gap-2">
                                                                <CheckCircle size={16} className="text-green-500 mt-0.5" />
                                                                {r}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                                            <Heart size={64} strokeWidth={1} className="mb-4" />
                                            <p>Enter patient vitals to generate<br />AI Risk Assessment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* DERMATOLOGY MODULE */}
                    {mode === 'dermatology' && (
                        <motion.div key="derma" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto h-[600px] flex gap-8">
                            {/* Left: Upload */}
                            <div className="w-1/2 flex flex-col gap-6">
                                <div className="flex-1 bg-white dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/10 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                                    <input type="file" onChange={handleDermaUpload} accept="image/*" className="absolute inset-0 opacity-0 z-20 cursor-pointer" />

                                    {dermaPreview ? (
                                        <img src={dermaPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <Upload size={48} className="mb-4 group-hover:scale-110 transition-transform text-amber-500" />
                                            <p className="font-bold text-lg text-gray-600 dark:text-gray-300">Upload Skin Lesion Image</p>
                                            <p className="text-sm">Supports JPG, PNG (Macro Mode)</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleDermaAnalyze}
                                    disabled={!dermaFile || loadingDerma}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingDerma ? 'Analyzing Texture & Borders...' : 'Run Vision Analysis'}
                                </button>
                            </div>

                            {/* Right: Analysis */}
                            <div className="w-1/2 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 p-8 overflow-y-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Search className="text-amber-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Vision Analysis</h2>
                                </div>

                                {dermaResult ? (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                            <div>
                                                <p className="text-sm opacity-60">Result</p>
                                                <p className="text-xl font-bold">{dermaResult.riskLevel}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm opacity-60">Confidence</p>
                                                <p className="text-xl font-bold text-amber-500">{dermaResult.confidence}%</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold mb-2">Findings (ABCD Rule)</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {dermaResult.findings?.map((f: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-500/20">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                            <p className="font-medium text-blue-500 mb-1 flex items-center gap-2"><Sparkles size={14} /> AI Summary</p>
                                            {dermaResult.summary}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                                            <p className="text-xs text-center opacity-40 uppercase tracking-widest font-bold">
                                                {dermaResult.disclaimer}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <ShieldAlert size={48} className="mb-4" />
                                        <p>Results will appear here after<br />Visual Processing</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
