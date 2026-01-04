import React, { useState } from 'react'; // React imported
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiUrl from '../../config/api';

// Interface for Blockchain Block Data
interface BatchHistory {
    index: number;
    timestamp: string;
    event: string;
    hash: string;
    isGenesis: boolean;
    details: {
        batchNumber: string;
        manufacturer: string;
        medicineId: number;
        expiryDate: string;

        quantity: number;
        price?: number | string;
    }
    marketData?: {
        govtPrice: number;
        isFairPrice: boolean;
        avgSaving: number;
    }
}

const MedicineVerifier = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    const [batchId, setBatchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BatchHistory[] | null>(null);
    const [marketData, setMarketData] = useState<{ govtPrice: number; isFairPrice: boolean; avgSaving: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchId.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(apiUrl(`api/inventory/batch/verify/${batchId}`));
            const data = await response.json();

            if (data.success) {
                setResult(data.history);
                setMarketData(data.marketData || null);
                toast.success("✅ Batch Verified on Blockchain!");
            } else {
                setError(data.message || "Batch not found.");
                toast.error("❌ Invalid Batch ID");
            }
        } catch (err) {
            console.error("Verification failed:", err);
            setError("Connection Error. Please try again.");
            toast.error("Connection Failed");
        } finally {
            setLoading(false);
        }
    };

    const copyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        toast.success("Hash Copied!");
    };

    const containerClasses = isEmbedded
        ? "w-full flex flex-col items-center p-4 bg-transparent"
        : "min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4";

    return (
        <div className={containerClasses}>

            {/* Header / Hero */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                    <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">OmniCare Medicine Verifier</h1>
                <p className="text-slate-500 dark:text-slate-400">Verify the authenticity of your medicine using our Supply Chain Ledger.</p>
            </motion.div>

            {/* Verification Card */}
            <motion.div
                layout
                className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700"
            >
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Enter Batch ID (e.g. BATCH-123)"
                            value={batchId}
                            onChange={(e) => setBatchId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !batchId}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex items-center justify-center min-w-[3rem]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    </button>
                </form>

                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-400"
                        >
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Verification Failed</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {result && result.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            {/* Success Banner */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 text-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Authenticity Verified</h2>
                                <p className="text-sm text-green-600/80 dark:text-green-400/80">This batch exists on the OmniCare Ledger.</p>
                            </div>

                            {/* Details Card */}
                            {result.map((block) => (
                                block.isGenesis ? null : (
                                    <div key={block.index} className="space-y-3 pt-2">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Manufacturer</div>
                                                <div className="font-medium text-slate-800 dark:text-slate-200">{block.details.manufacturer}</div>
                                            </div>
                                            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expiry Date</div>
                                                <div className="font-medium text-slate-800 dark:text-slate-200">{block.details.expiryDate}</div>
                                            </div>
                                            <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg col-span-2">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Medicine ID</div>
                                                <div className="font-medium text-slate-800 dark:text-slate-200"># {block.details.medicineId}</div>
                                            </div>

                                            {marketData && block.details.price && (
                                                <div className="col-span-2 mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Verified MRP</div>
                                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">${block.details.price}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Govt. Capped Price</div>
                                                            <div className="text-sm line-through text-slate-400">${marketData.govtPrice}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-xs font-medium ${marketData.isFairPrice ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                        <ShieldCheck className="w-4 h-4" />
                                                        {marketData.isFairPrice
                                                            ? <span>Fair Price Verified. You save ${marketData.avgSaving} vs Gov Cap.</span>
                                                            : <span>Warning: Price exceeds Government Cap.</span>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hash Display */}
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <div className="text-xs text-slate-400 mb-2 flex justify-between uppercase tracking-wider font-semibold">
                                                <span>Blockchain Hash</span>
                                                <span className="font-mono">Block #{block.index}</span>
                                            </div>
                                            <button
                                                onClick={() => copyHash(block.hash)}
                                                className="w-full text-left group relative p-3 bg-slate-100/50 dark:bg-black/30 rounded-lg font-mono text-xs text-slate-500 break-all hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                {block.hash}
                                                <Copy className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                            </button>
                                            <div className="text-center mt-2 text-[10px] text-slate-400">
                                                Timestamp: {new Date(block.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer */}
            <div className="mt-8 text-center text-slate-400 text-sm">
                Powered by <span className="font-semibold text-blue-500">OmniCare Blockchain</span> & Microsoft Azure
            </div>
        </div>
    );
};

export default MedicineVerifier;
