import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, DollarSign, ArrowDown, ArrowUp, X, Sparkles, Mail, Send, CheckCircle } from 'lucide-react';

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

// --- Main Accounting Module ---

export default function AccountingModule() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('receivable');
    const [payables, setPayables] = useState([]);
    const [receivables, setReceivables] = useState([]);
    const [patients, setPatients] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showReminderModal, setShowReminderModal] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(null);
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSendingSms, setIsSendingSms] = useState(false);
    const [smsStatus, setSmsStatus] = useState('');
    const [recipientNumber, setRecipientNumber] = useState('');
    
    const [newEntry, setNewEntry] = useState({
        type: 'receivable', 
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`, 
        name: '', 
        amount: '', 
        dueDate: '', 
        patientId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [payablesRes, receivablesRes, patientsRes, vendorsRes] = await Promise.all([
                    fetch(apiUrl('/api/accounting/payable')),
                    fetch(apiUrl('/api/accounting/receivable')),
                    fetch(apiUrl('/api/patients')),
                    fetch(apiUrl('/api/vendors'))
                ]);
                setPayables(await payablesRes.json() || []);
                setReceivables(await receivablesRes.json() || []);
                setPatients(await patientsRes.json() || []);
                setVendors(await vendorsRes.json() || []);
            } catch (error) { console.error("Failed to fetch accounting data:", error); }
        };
        fetchData();
    }, []);

    const fetchAllData = () => {
        fetch(apiUrl('/api/accounting/payable')).then(res => res.json()).then(data => setPayables(Array.isArray(data) ? data : []));
        fetch(apiUrl('/api/accounting/receivable')).then(res => res.json()).then(data => setReceivables(Array.isArray(data) ? data : []));
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const invoiceNumber = name === 'type' 
            ? `INV-${Math.floor(1000 + Math.random() * 9000)}` 
            : newEntry.invoiceNumber;
        setNewEntry(prevState => ({ ...prevState, [name]: value, invoiceNumber }));
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(apiUrl('/api/accounting/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry),
            });
            if ((await response.json()).success) {
                setShowAddModal(false);
                fetchAllData();
            } else { alert('Failed to add entry.'); }
        } catch (error) { alert('Failed to connect to server.'); }
    };

    const handleUpdateStatus = async (type, id, newStatus) => {
        try {
            const response = await fetch(apiUrl(`/api/accounting/${type}/${id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                if (type === 'receivable' && newStatus === 'paid') {
                    const updatedItem = receivables.find(item => item.id === id) || payables.find(item => item.id === id);
                    if (updatedItem) {
                       const patient = patients.find(p => p.id === updatedItem.patientId);
                       setRecipientNumber(patient?.phone || '');
                       setShowConfirmationModal(updatedItem);
                       setGeneratedMessage(''); 
                    }
                }
                fetchAllData();
            } else { 
                alert('Failed to update status.'); 
            }
        } catch (error) { alert('Failed to connect to server.'); }
    };

    const handleDeleteEntry = async (type, id) => {
        try {
            const response = await fetch(apiUrl(`/api/accounting/${type}/${id}`), { method: 'DELETE' });
            if ((await response.json()).success) {
                fetchAllData();
            } else { alert('Failed to delete entry.'); }
        } catch (error) { alert('Failed to connect to server.'); }
        setShowDeleteConfirm(null);
    };
    
    const handleGenerateMessage = async (item, type) => {
        setIsGenerating(true);
        setGeneratedMessage('');
        setSmsStatus('');

        const systemPrompt = "You are a friendly but professional accounting assistant for 'Shree Medicare Hospital'. Your task is to draft a brief and polite message suitable for an SMS or short email.";
        const userQuery = type === 'reminder' 
            ? `Draft a payment reminder for patient ${item.patientName} regarding invoice #${item.invoiceNumber} for the amount of $${item.amount}, which was due on ${new Date(item.dueDate).toLocaleDateString()}.`
            : `Draft a payment confirmation for patient ${item.patientName} for invoice #${item.invoiceNumber} for the amount of $${item.amount}. Thank them for their payment and confirm the payment has been received.`;

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
            setGeneratedMessage(text || "Could not generate draft.");
        } catch (error) {
            console.error("Gemini API error:", error);
            setGeneratedMessage("Error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSendSms = async () => {
        if (!recipientNumber || !generatedMessage) {
            setSmsStatus('Error: Phone number or message is missing.');
            return;
        }

        setIsSendingSms(true);
        setSmsStatus('Sending...');
        try {
             const response = await fetch(apiUrl('/api/sms/send'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: recipientNumber, message: generatedMessage }),
            });
            const data = await response.json();
            if (data.success) {
                setSmsStatus('Sent Successfully!');
            } else {
                setSmsStatus(`Error: ${data.error || data.message}`);
            }
        } catch(error) {
            setSmsStatus('Error: Failed to connect to SMS service.');
        } finally {
            setIsSendingSms(false);
        }
    }


    const getStatusPill = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-500/20 text-green-300';
            case 'pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'overdue': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };
    
    const totalReceivable = useMemo(() => receivables.reduce((sum, item) => item.paymentStatus !== 'paid' ? sum + Number(item.amount) : sum, 0), [receivables]);
    const totalPayable = useMemo(() => payables.reduce((sum, item) => item.paymentStatus !== 'paid' ? sum + Number(item.amount) : sum, 0), [payables]);

    const dataToDisplay = activeTab === 'payable' ? payables : receivables;
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
    const tabs = ['receivable', 'payable'];

    return (
        <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                 <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Accounting</h1>
                        <p className="text-gray-400 mt-2">Manage all financial transactions and records.</p>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                        <Plus size={20} />
                        <span>New Entry</span>
                    </button>
                </div>
            </motion.div>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}><StatCard title="Total Receivable" value={`$${totalReceivable.toLocaleString()}`} icon={ArrowDown} color="text-green-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Total Payable" value={`$${totalPayable.toLocaleString()}`} icon={ArrowUp} color="text-red-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Net Balance" value={`$${(totalReceivable - totalPayable).toLocaleString()}`} icon={DollarSign} color="text-blue-400"/></motion.div>
            </motion.div>

            <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800">
                <div className="p-2 border-b border-gray-800">
                    <div className="flex space-x-2 relative">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors z-10 ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                                {tab === 'receivable' ? 'Accounts Receivable' : 'Accounts Payable'}
                            </button>
                        ))}
                        <motion.div layoutId="activeAcctTab" className="absolute h-full w-1/2 bg-blue-600 rounded-lg" transition={{ type: 'spring', stiffness: 300, damping: 25 }} animate={{ x: `${tabs.indexOf(activeTab) * 100}%` }} />
                    </div>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-800"><th className="p-4 text-left text-sm font-semibold text-gray-400">Invoice #</th><th className="p-4 text-left text-sm font-semibold text-gray-400">{activeTab === 'payable' ? 'Vendor' : 'Patient'}</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Amount</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Due Date</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th></tr></thead>
                            <motion.tbody key={activeTab} variants={containerVariants} initial="hidden" animate="visible">
                                {dataToDisplay.map(item => (
                                    <motion.tr key={item.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-4 font-semibold text-pink-400">{item.invoiceNumber}</td>
                                        <td className="p-4">{activeTab === 'payable' ? item.vendorName : item.patientName}</td>
                                        <td className="p-4 font-semibold text-lg">${Number(item.amount).toLocaleString()}</td>
                                        <td className="p-4 text-sm text-gray-400">{new Date(item.dueDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <select value={item.paymentStatus} onChange={(e) => handleUpdateStatus(activeTab, item.id, e.target.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none outline-none appearance-none transition-colors ${getStatusPill(item.paymentStatus)} bg-opacity-100`}>
                                                <option value="pending" className="bg-gray-800 text-white">Pending</option>
                                                <option value="paid" className="bg-gray-800 text-white">Paid</option>
                                                <option value="overdue" className="bg-gray-800 text-white">Overdue</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                 {activeTab === 'receivable' && item.paymentStatus !== 'paid' && (
                                                    <button onClick={() => {
                                                        const patient = patients.find(p => p.id === item.patientId);
                                                        setRecipientNumber(patient?.phone || '');
                                                        setShowReminderModal(item); 
                                                        setGeneratedMessage('');
                                                    }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="Send Reminder"><Mail size={18}/></button>
                                                 )}
                                                <button onClick={() => setShowDeleteConfirm({ type: activeTab, ...item })} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                        {dataToDisplay.length === 0 && <p className="text-center py-12 text-gray-500">No entries found.</p>}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <Modal onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAddEntry}>
                        <h2 className="text-2xl font-bold mb-6">New Accounting Entry</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <select name="type" value={newEntry.type} onChange={handleInputChange} className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg" required>
                                <option value="receivable">Receivable (Patient Bill)</option>
                                <option value="payable">Payable (Vendor Bill)</option>
                            </select>
                            {newEntry.type === 'payable' ? (
                                <select name="name" onChange={handleInputChange} className="p-3 bg-gray-800 border-gray-700 rounded-lg col-span-2" required><option value="">Select Vendor</option>{vendors.map(v => <option key={v.id} value={v.vendorName}>{v.vendorName}</option>)}</select>
                            ) : (
                                <select name="patientId" onChange={handleInputChange} className="p-3 bg-gray-800 border-gray-700 rounded-lg col-span-2" required><option value="">Select Patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select>
                            )}
                            <input type="number" name="amount" step="0.01" onChange={handleInputChange} placeholder="Amount" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                            <input type="date" name="dueDate" onChange={handleInputChange} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                        </div>
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add Entry</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showDeleteConfirm && (
                <Modal onClose={() => setShowDeleteConfirm(null)} width="max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                    <p className="text-gray-400 mb-6">Are you sure you want to delete invoice "{showDeleteConfirm.invoiceNumber}"?</p>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={() => handleDeleteEntry(showDeleteConfirm.type, showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}

            {(showReminderModal || showConfirmationModal) && (
                <Modal onClose={() => {setShowReminderModal(null); setShowConfirmationModal(null)}} width="max-w-xl">
                     <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        {showConfirmationModal ? <CheckCircle className="text-green-400"/> : <Sparkles className="text-blue-400" />}
                        {showConfirmationModal ? 'Payment Confirmation' : 'AI Reminder Assistant'}
                     </h2>
                     <p className="text-gray-400 mb-6">
                        {showConfirmationModal 
                            ? `Draft a payment confirmation for ${showConfirmationModal.patientName}.`
                            : `Draft a payment reminder for ${showReminderModal.patientName}.`
                        }
                     </p>
                     
                     {!generatedMessage && !isGenerating && (
                        <button onClick={() => handleGenerateMessage(showReminderModal || showConfirmationModal, showConfirmationModal ? 'confirmation' : 'reminder')} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Sparkles size={20} /> Generate Message
                        </button>
                     )}

                    {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">AI is drafting a message...</p>}
                    
                    {generatedMessage && (
                        <div className="space-y-4">
                             <input 
                                type="text"
                                value={recipientNumber}
                                onChange={(e) => setRecipientNumber(e.target.value)}
                                placeholder="Recipient number e.g. +911234567890"
                                className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg text-white placeholder:text-gray-500"
                            />
                            <textarea value={generatedMessage} onChange={(e) => setGeneratedMessage(e.target.value)} className="w-full p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 h-48 resize-none"/>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => navigator.clipboard.writeText(generatedMessage)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy</button>
                                 <button 
                                    onClick={handleSendSms}
                                    disabled={isSendingSms}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-500 flex items-center gap-2"
                                >
                                    <Send size={16}/>
                                    {isSendingSms ? 'Sending...' : 'Send SMS'}
                                </button>
                            </div>
                            {smsStatus && <p className={`text-sm text-center mt-2 ${smsStatus.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{smsStatus}</p>}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
