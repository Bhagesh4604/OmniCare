import React, { useState, useRef } from 'react';
import { Camera, Upload, Type, Globe, Loader2, AlertTriangle, FileText, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiUrl from '@/config/api';

const LANGUAGES = [
    { code: 'English', name: 'English' },
    { code: 'Hindi', name: 'हिंदी (Hindi)' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)' },
    { code: 'Telugu', name: 'తెలుగు (Telugu)' },
    { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'Bengali', name: 'বাংলা (Bengali)' },
    { code: 'Marathi', name: 'मराठी (Marathi)' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
    { code: 'Malayalam', name: 'മലയാളം (Malayalam)' }
];

interface MedicineData {
    medicineName: string;
    identifiedLanguage: string;
    usage: string;
    sideEffects: string[];
    warnings: string;
    isPrescriptionRequired: boolean;
    substitute?: string;
}

export default function MedicationScanner({ onClose }: { onClose: () => void }) {
    const [mode, setMode] = useState<'camera' | 'text'>('camera');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MedicineData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size too large. Please choose an image under 5MB.");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
            setResult(null);
        }
    };

    const handleScan = async () => {
        if (mode === 'camera' && !selectedFile) {
            setError("Please select an image first.");
            return;
        }
        if (mode === 'text' && !inputText.trim()) {
            setError("Please enter a medicine name.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        if (mode === 'camera' && selectedFile) {
            formData.append('image', selectedFile);
        }
        if (mode === 'text') {
            formData.append('query', inputText);
        }
        formData.append('targetLanguage', selectedLanguage);

        formData.append('targetLanguage', selectedLanguage);

        try {
            const response = await fetch(apiUrl('/api/ai/identify-medicine'), {
                method: 'POST',
                body: formData, // Auto-sets Content-Type for FormData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to identify medicine");
            }

            setResult(data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 w-full h-[100dvh] md:h-auto md:max-h-[85vh] md:max-w-2xl rounded-none md:rounded-2xl flex flex-col shadow-2xl border-t md:border border-slate-200 dark:border-slate-700"
            >
                {/* Header - Fixed/Sticky */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-start text-white shrink-0 z-10 relative">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Camera className="w-6 h-6" />
                            AI Medicine Scanner
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">Identify medicines & get info in your language</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between shrink-0">
                        {/* Mode Switch */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setMode('camera')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'camera' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                Upload Image
                            </button>
                            <button
                                onClick={() => setMode('text')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'text' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Type className="w-4 h-4" />
                                Type Name
                            </button>
                        </div>

                        {/* Language Selector */}
                        <div className="relative">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-transparent focus-within:border-blue-500">
                                <Globe className="w-4 h-4 text-slate-500" />
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 min-w-[140px]"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="min-h-[200px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 transition-colors hover:border-blue-400 shrink-0">
                        {mode === 'camera' ? (
                            <div className="w-full text-center space-y-4">
                                {previewUrl ? (
                                    <div className="relative w-full max-w-xs mx-auto rounded-lg overflow-hidden shadow-lg group">
                                        <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                                        <button
                                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-4 group">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                                            <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                            Tap to upload photo of medicine strip or bottle
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                )}
                            </div>
                        ) : (
                            <div className="w-full max-w-sm space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medicine Name</label>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="e.g., Dolo 650, Metformin..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleScan}
                        disabled={isLoading || (mode === 'text' && !inputText) || (mode === 'camera' && !selectedFile)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold font-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing Medication...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Identify Medicine
                            </>
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl flex items-center gap-3 text-sm"
                        >
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {/* Results Area */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{result.medicineName}</h3>
                                        <p className="text-slate-500 text-sm">Language: {result.identifiedLanguage}</p>
                                    </div>
                                    {result.isPrescriptionRequired && (
                                        <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200 uppercase tracking-wide">
                                            Rx Required
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            Usage / Uses
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                            {result.usage}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            Common Side Effects
                                        </h4>
                                        <ul className="text-slate-600 dark:text-slate-400 text-sm list-disc pl-5 space-y-1 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                            {typeof result.sideEffects === 'string'
                                                ? <li>{result.sideEffects}</li>
                                                : result.sideEffects.map((effect, idx) => (
                                                    <li key={idx}>{effect}</li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-green-200 dark:border-green-800/30">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-1">Safety Warnings:</h4>
                                    <p className="text-red-600 dark:text-red-400 text-sm italic">
                                        {result.warnings}
                                    </p>
                                </div>

                                {/* Reset / Close Actions */}
                                <div className="pt-4 flex gap-4">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Scan Another
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </motion.div>
        </div>
    );
}
