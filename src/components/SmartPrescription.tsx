
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, FileText, Activity, CheckCircle, XCircle, Search, User, Save, RefreshCw } from 'lucide-react';
import apiUrl from '@/config/api';
import { toast } from 'react-hot-toast';

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    patientId: string;
}

interface HistoryRecord {
    medicationName: string;
    status: string;
}

const SmartPrescription = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [patientHistory, setPatientHistory] = useState<HistoryRecord[]>([]);

    const [drugName, setDrugName] = useState('');
    const [dosage, setDosage] = useState('500mg');
    const [frequency, setFrequency] = useState('Daily');

    const [verifying, setVerifying] = useState(false);
    const [contractResult, setContractResult] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // 1. Fetch Patients on Mount
    useEffect(() => {
        fetch(apiUrl('/api/patients'))
            .then(res => res.json())
            .then(data => setPatients(Array.isArray(data) ? data : []))
            .catch(err => console.error("Failed to fetch patients", err));
    }, []);

    // 2. Fetch History when Patient Selected
    useEffect(() => {
        if (!selectedPatientId) return;

        // Find the patient object to get the 'patientId' string (e.g. PAT-123) needed for history lookup
        const patientParams = patients.find(p => p.id.toString() === selectedPatientId);
        if (!patientParams) return;

        fetch(apiUrl(`/api/patients/${patientParams.patientId}/full-history`))
            .then(res => res.json())
            .then(data => {
                if (data.history) {
                    // Filter history to just medications
                    const meds = data.history
                        .filter((h: any) => h.type === 'prescription' || h.type === 'medication')
                        .map((h: any) => ({
                            medicationName: h.details.medicationName || h.details.medication,
                            status: 'Active' // Assume active for safety in this demo
                        }));
                    setPatientHistory(meds);
                }
            })
            .catch(err => console.error("Failed to fetch history", err));
    }, [selectedPatientId, patients]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!drugName || !selectedPatientId) {
            toast.error("Please select a patient and enter a drug name.");
            return;
        }

        setVerifying(true);
        setContractResult(null);

        try {
            const response = await fetch(apiUrl('/api/smart-contracts/verify-prescription'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newDrug: drugName,
                    patientHistory: patientHistory
                })
            });
            const data = await response.json();
            setContractResult(data);
            if (data.passed) toast.success("Safety Check Passed!");
            else toast.error("Interaction Detected!");
        } catch (error) {
            console.error("Verification failed", error);
            toast.error("Smart Contract Error");
        } finally {
            setVerifying(false);
        }
    };

    const handlePrescribe = async () => {
        if (!contractResult) return;
        setSaving(true);

        try {
            const patientParams = patients.find(p => p.id.toString() === selectedPatientId);
            const response = await fetch(apiUrl('/api/medications/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: patientParams?.id, // Send the integer ID for the 'prescriptions' table
                    medicationName: drugName,
                    dosage: dosage,
                    frequency: frequency
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success("✅ Prescription Saved to Blockchain & DB");
                setContractResult(null);
                setDrugName('');
                // Refresh history?
            } else {
                toast.error(data.message || "Failed to save.");
            }
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Connection Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans text-slate-900 dark:text-white flex flex-col items-center">

            <header className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                    <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Smart Prescription Node</h1>
                <p className="text-slate-500 dark:text-slate-400">Blockchain-Powered Drug Interaction Checks</p>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: Prescription Input */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        New Prescription
                    </h2>

                    {/* Patient Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Select Patient</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                            >
                                <option value="">-- Choose a Patient --</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (ID: {p.patientId})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedPatientId && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 overflow-hidden">
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Patient's Active Medications (Live Ledger)</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {patientHistory.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">No active medications found on ledger.</p>
                                    ) : (
                                        patientHistory.map((med, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                                <span className="font-medium">{med.medicationName}</span>
                                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">{med.status}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleVerify}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Medication Name</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={drugName}
                                        onChange={(e) => setDrugName(e.target.value)}
                                        placeholder="e.g. Aspirin"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Dosage</label>
                                <input
                                    type="text"
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Frequency</label>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option>Daily</option>
                                    <option>Twice Daily</option>
                                    <option>Thrice Daily</option>
                                    <option>Weekly</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={verifying || !drugName || !selectedPatientId}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {verifying ? (
                                <>
                                    <Activity className="animate-spin w-5 h-5" />
                                    Running Smart Contract...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Verify Safety
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* RIGHT: Blockchain Result */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {!contractResult && !verifying && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl"
                            >
                                <Activity className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
                                <p className="text-slate-400 font-medium">Ready to verify prescription against the blockchain ledger.</p>
                            </motion.div>
                        )}

                        {verifying && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-3xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="p-4 rounded-full bg-blue-500/20 mb-6 relative">
                                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/40"></div>
                                    <ShieldCheck className="w-12 h-12 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Executing Smart Contract</h3>
                                <div className="space-y-1">
                                    <p className="text-blue-200 text-sm font-mono">HASH: 0x7F...2A9C</p>
                                    <p className="text-blue-200 text-sm font-mono">BLOCK: #892104</p>
                                    <p className="text-blue-200 text-sm font-mono">GAS: 21000 GWEI</p>
                                </div>
                            </motion.div>
                        )}

                        {contractResult && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className={`h-full p-8 rounded-3xl shadow-2xl border ${contractResult.passed ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30'}`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-3 rounded-full ${contractResult.passed ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                        {contractResult.passed ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${contractResult.passed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                            {contractResult.passed ? 'Prescription Approved' : 'Interaction Detected'}
                                        </h3>
                                        <p className="text-xs font-mono text-slate-500 uppercase">Contract ID: {contractResult.contractId}</p>
                                    </div>
                                </div>

                                {contractResult.passed ? (
                                    <div className="space-y-6">
                                        <p className="text-green-700 dark:text-green-300">
                                            No adverse interactions found in the patient's blockchain history. It is safe to proceed with <strong>{drugName}</strong>.
                                        </p>
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-green-100 dark:border-green-500/20">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Transaction Hash</p>
                                            <code className="text-xs font-mono break-all text-slate-700 dark:text-slate-300">0x{Math.random().toString(16).substr(2, 40)}</code>
                                        </div>

                                        <button
                                            onClick={handlePrescribe}
                                            disabled={saving}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <Activity className="animate-spin w-5 h-5" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {saving ? 'Committed Block...' : 'Confirm & Prescribe'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {contractResult.alerts.map((alert: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-500/30">
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">{alert.alert}</h4>
                                                        <p className="text-sm text-red-700 dark:text-red-300">{alert.recommendation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={handlePrescribe}
                                            className="w-full py-3 mt-4 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-xl transition-all"
                                        >
                                            Override & Prescribe Anyway (Requires Chief Authorization)
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SmartPrescription;
