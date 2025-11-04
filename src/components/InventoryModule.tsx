import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Pill, Package, AlertTriangle, X, Sparkles, Send, Activity } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

// In a real app, these would be in separate files
import apiUrl from '../config/api';

// --- Reusable Components ---

const Modal = ({ children, onClose, width = "max-w-lg" }) => (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className={`bg-[#1C1C1E] rounded-2xl p-8 w-full ${width} border border-gray-700 shadow-2xl text-white`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const StatCard = ({ title, value, icon: Icon, color }) => {
    const { theme } = useTheme();
    return (
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1C1C1E] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
};

// --- Main Inventory Module ---

export default function InventoryModule() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('pharma');
    const [pharmaceuticals, setPharmaceuticals] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [modal, setModal] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showReorderModal, setShowReorderModal] = useState(null);
    const [generatedRequest, setGeneratedRequest] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [newItem, setNewItem] = useState({ name: '', quantity: '1', status: 'available' });
    const [editItem, setEditItem] = useState(null);


    useEffect(() => {
        fetchPharmaceuticals();
        fetchEquipment();
    }, []);

    const fetchPharmaceuticals = async () => {
        try {
            const res = await fetch(apiUrl('/api/inventory/pharmaceuticals'));
            const data = await res.json();
            setPharmaceuticals(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const fetchEquipment = async () => {
        try {
            const res = await fetch(apiUrl('/api/inventory/equipment'));
            const data = await res.json();
            setEquipment(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const handleInputChange = (e, formType) => {
        const { name, value } = e.target;
        if (formType === 'new') {
            setNewItem(prev => ({ ...prev, [name]: value }));
        } else {
            setEditItem(prev => (prev ? { ...prev, [name]: value } : null));
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(apiUrl('/api/inventory/equipment/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            const data = await res.json();
            if (data.success) {
                setModal(null);
                fetchEquipment();
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to server.'); }
    };
    
    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if(!editItem) return;
        
        const { id, stockQuantity, name, quantity, status } = editItem;
        const isPharma = 'stockQuantity' in editItem;
        const url = isPharma ? apiUrl(`/api/inventory/pharmaceuticals/${id}`) : apiUrl(`/api/inventory/equipment/${id}`);
        const body = isPharma ? { stockQuantity } : { name, quantity, status };

        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setModal(null);
                if (isPharma) fetchPharmaceuticals();
                else fetchEquipment();
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to server'); }
    };

    const handleDeleteEquipment = async (id) => {
        try {
            const res = await fetch(apiUrl(`/api/inventory/equipment/${id}`), { method: 'DELETE' });
            if ((await res.json()).success) {
                fetchEquipment();
            }
        } catch (error) { alert('Failed to connect to server'); }
        setShowDeleteConfirm(null);
    };
    
    const handleGenerateRequest = async (item) => {
        setIsGenerating(true);
        setGeneratedRequest('');
        const systemPrompt = "You are a hospital inventory manager. Your task is to draft a professional and concise reorder request email for a medical item. Be clear about the item needed and the urgency if it's low on stock.";
        const userQuery = `Draft a reorder request email for the following item: ${item.name}. The current stock is ${'stockQuantity' in item ? item.stockQuantity : item.quantity}. For pharmaceuticals, the reorder level is ${item.reorderLevel || 'not set'}. Please prioritize this if the stock is low.`;

        try {
            const response = await fetch(apiUrl('/api/ai/ask'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userQuery }
                    ]
                }),
            });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const result = await response.json();
            const text = result.reply;
            setGeneratedRequest(text || "Could not generate reorder request.");
        } catch (error) {
            console.error("Gemini API error:", error);
            setGeneratedRequest("Error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };


    const openModal = (type, item = null) => {
        setModal(type);
        if (item) setEditItem(JSON.parse(JSON.stringify(item)));
        if (type === 'add') setNewItem({ name: '', quantity: '1', status: 'available' });
    };

    const lowStockCount = useMemo(() => pharmaceuticals.filter(p => p.stockQuantity <= p.reorderLevel).length, [pharmaceuticals]);
    const tabs = ['pharma', 'equipment'];
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Inventory</h1>
                        <p className="text-gray-400 mt-2">Track pharmaceuticals and medical equipment.</p>
                    </div>
                    {activeTab === 'equipment' && (
                        <button onClick={() => openModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                            <Plus size={20} />
                            <span>Add Equipment</span>
                        </button>
                    )}
                </div>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}><StatCard title="Total Items" value={pharmaceuticals.length + equipment.length} icon={Package} color="text-blue-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Pharmaceuticals" value={pharmaceuticals.length} icon={Pill} color="text-green-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Equipment" value={equipment.length} icon={Activity} color="text-cyan-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Low Stock Alerts" value={lowStockCount} icon={AlertTriangle} color="text-red-400"/></motion.div>
            </motion.div>
            
            <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800">
                <div className="p-2 border-b border-gray-800">
                    <div className="flex space-x-2 relative">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors z-10 ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {tab === 'pharma' ? 'Pharmaceuticals' : 'Equipment'}
                            </button>
                        ))}
                        <motion.div layoutId="activeInvTab" className="absolute h-full w-1/2 bg-blue-600 rounded-lg" transition={{ type: 'spring', stiffness: 300, damping: 25 }} animate={{ x: `${tabs.indexOf(activeTab) * 100}%` }} />
                    </div>
                </div>
                <div className="p-6">
                    <AnimatePresence mode="wait">
                         <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {activeTab === 'pharma' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-gray-800"><th className="p-4 text-left text-sm font-semibold text-gray-400">Name</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Stock</th><th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th></tr></thead>
                                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                            {pharmaceuticals.map(item => <motion.tr key={item.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50"><td className="p-4 font-semibold">{item.name}</td><td className={`p-4 font-semibold ${item.stockQuantity <= item.reorderLevel ? 'text-red-400' : 'text-white'}`}>{item.stockQuantity}</td><td className="p-4"><div className="flex items-center justify-end gap-2"><button onClick={() => {setShowReorderModal(item); setGeneratedRequest('');}} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="Generate Reorder Request"><Sparkles size={18}/></button><button onClick={() => {setModal('edit'); setEditItem(item)}} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit2 size={18}/></button></div></td></motion.tr>)}
                                        </motion.tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-gray-800"><th className="p-4 text-left text-sm font-semibold text-gray-400">Name</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Quantity</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th></tr></thead>
                                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                                            {equipment.map(item => <motion.tr key={item.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50"><td className="p-4 font-semibold">{item.name}</td><td className="p-4">{item.quantity}</td><td className="p-4 capitalize">{item.status}</td><td className="p-4"><div className="flex items-center justify-end gap-2"><button onClick={() => {setModal('edit'); setEditItem(item)}} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit2 size={18}/></button><button onClick={() => setShowDeleteConfirm(item)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button></div></td></motion.tr>)}
                                        </motion.tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            
             {modal && (
                <Modal onClose={() => setModal(null)} width={modal === 'add' ? 'max-w-md' : 'max-w-lg'}>
                    {modal === 'add' && (
                         <form onSubmit={handleAddItem}>
                            <h2 className="text-2xl font-bold mb-6">Add New Equipment</h2>
                            <div className="space-y-4">
                                <input name="name" onChange={(e) => handleInputChange(e, 'new')} placeholder="Equipment Name" className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="number" name="quantity" value={newItem.quantity} onChange={(e) => handleInputChange(e, 'new')} placeholder="Quantity" className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <select name="status" value={newItem.status} onChange={(e) => handleInputChange(e, 'new')} className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg"><option value="available">Available</option><option value="in-use">In Use</option><option value="maintenance">Maintenance</option></select>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                               <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                               <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add Item</button>
                           </div>
                        </form>
                    )}
                    {modal === 'edit' && editItem && (
                        <form onSubmit={handleUpdateItem}>
                            <h2 className="text-2xl font-bold mb-6">Edit {editItem.name}</h2>
                            <div className="space-y-4">
                                {'stockQuantity' in editItem ? (
                                    <input type="number" name="stockQuantity" value={editItem.stockQuantity} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Stock Quantity" className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                ) : (
                                    <>
                                        <input name="name" value={editItem.name} onChange={(e) => handleInputChange(e, 'edit')} className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                        <input type="number" name="quantity" value={editItem.quantity} onChange={(e) => handleInputChange(e, 'edit')} className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                        <select name="status" value={editItem.status} onChange={(e) => handleInputChange(e, 'edit')} className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg"><option value="available">Available</option><option value="in-use">In Use</option><option value="maintenance">Maintenance</option></select>
                                    </>
                                )}
                            </div>
                             <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                                <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Save Changes</button>
                            </div>
                        </form>
                    )}
                </Modal>
            )}
            
            {showDeleteConfirm && (
                <Modal onClose={() => setShowDeleteConfirm(null)} width="max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                    <p className="text-gray-400 mb-6">Are you sure you want to delete equipment "{showDeleteConfirm.name}"?</p>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={() => handleDeleteEquipment(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}

            {showReorderModal && (
                <Modal onClose={() => setShowReorderModal(null)} width="max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">✨ AI Reorder Assistant</h2>
                    <p className="text-gray-400 mb-6">Draft a reorder request for {showReorderModal.name}.</p>
                    
                    {!generatedRequest && !isGenerating && (
                        <button onClick={() => handleGenerateRequest(showReorderModal)} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Sparkles size={20} /> Generate Request
                        </button>
                    )}

                    {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">AI is drafting a request...</p>}
                    
                    {generatedRequest && (
                        <div className="space-y-4">
                            <textarea value={generatedRequest} onChange={(e) => setGeneratedRequest(e.target.value)} className="w-full p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 h-64 resize-none"/>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => navigator.clipboard.writeText(generatedRequest)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy Text</button>
                                <button onClick={() => setShowReorderModal(null)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Done</button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
