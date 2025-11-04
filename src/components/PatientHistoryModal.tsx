import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, Beaker, Pill, Scissors, DollarSign, User, Building } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import apiUrl from '../config/api';

const HistoryItem = ({ item }) => {
    const { theme } = useTheme();
    const baseClasses = `p-4 rounded-lg shadow-sm mb-2 flex items-start space-x-3 ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`;
    const dateClasses = `text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`;
    const titleClasses = `font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
    const detailClasses = `text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;
    const doctorClasses = `text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    let icon, title, details, doctorInfo, dateValue;

    // Ensure item.date is treated as a Date object for consistent formatting
    dateValue = item.date ? new Date(item.date) : null;

    switch (item.type) {
        case 'appointment':
            icon = <Calendar size={20} className="text-blue-400" />;
            title = `Appointment: ${item.details.notes || 'General Check-up'}`;
            details = <p className={detailClasses}>Status: {item.details.status}</p>;
            doctorInfo = <p className={doctorClasses}>Dr. {item.details.doctorName} ({item.details.departmentName})</p>;
            break;
        case 'medical_record':
            icon = <FileText size={20} className="text-green-400" />;
            title = `Diagnosis: ${item.details.diagnosis}`;
            details = (
                <div className="space-y-1">
                    <p className={detailClasses}>Treatment: {item.details.treatment}</p>
                </div>
            );
            doctorInfo = <p className={doctorClasses}>Dr. {item.details.doctorName}</p>;
            break;
        case 'lab_test':
            icon = <Beaker size={20} className="text-purple-400" />;
            title = `Lab Test: ${item.details.testName}`;
            details = (
                <div className="space-y-1">
                    <p className={detailClasses}>Status: {item.details.status}</p>
                    {item.details.result_text && <p className={detailClasses}>Result: {item.details.result_text}</p>}
                </div>
            );
            doctorInfo = <p className={doctorClasses}>Dr. {item.details.doctorName}</p>;
            break;
        case 'prescription':
            icon = <Pill size={20} className="text-yellow-400" />;
            title = `Prescription: ${item.details.notes}`;
            details = <p className={detailClasses}>Status: {item.details.status}</p>;
            doctorInfo = <p className={doctorClasses}>Dr. {item.details.doctorName}</p>;
            break;
        case 'surgery':
            icon = <Scissors size={20} className="text-red-400" />;
            title = `Surgery: ${item.details.surgeryType}`;
            details = <p className={detailClasses}>Status: {item.details.status}</p>;
            doctorInfo = <p className={doctorClasses}>Surgeon: {item.details.surgeonName}</p>;
            break;
        case 'bill':
            icon = <DollarSign size={20} className="text-teal-400" />;
            title = `Bill: Invoice #${item.details.invoiceNumber}`;
            details = (
                <div className="space-y-1">
                    <p className={detailClasses}>Amount: ${item.details.amount}</p>
                    <p className={detailClasses}>Status: {item.details.paymentStatus}</p>
                </div>
            );
            doctorInfo = null; // No specific doctor for a bill
            break;
        case 'admission':
            icon = <Building size={20} className="text-orange-400" />;
            title = item.details.dischargeDate ? 'Discharge' : 'Admission';
            details = (
                <div className="space-y-1">
                    <p className={detailClasses}>Ward: {item.details.wardName || 'N/A'} - Bed: {item.details.bedNumber || 'N/A'}</p>
                    {item.details.dischargeDate && <p className={detailClasses}>Discharged: {formatDate(item.details.dischargeDate)}</p>}
                    {item.details.notes && <p className={detailClasses}>Notes: {item.details.notes}</p>}
                </div>
            );
            doctorInfo = null;
            break;
        default:
            icon = <User size={20} className="text-gray-400" />;
            title = 'Unknown Event';
            details = null;
            doctorInfo = null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={baseClasses}
        >
            <div className="flex-shrink-0 mt-1">{icon}</div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className={titleClasses}>{title}</h3>
                    <span className={dateClasses}>{formatDate(dateValue)}</span>
                </div>
                {details}
                {doctorInfo}
            </div>
        </motion.div>
    );
};

const PatientHistoryModal = ({ patientId, patientName, onClose }) => {
    const { theme } = useTheme();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch(apiUrl(`/api/patients/${patientId}/full-history`));
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setHistory(data.history);
                } else {
                    setError(data.message || 'Failed to fetch history.');
                }
            } catch (err) {
                console.error('Error fetching patient history:', err);
                setError('Failed to connect to the server or retrieve history.');
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchHistory();
        }
    }, [patientId]);

    return (
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
                    className={`bg-[#1C1C1E] rounded-2xl p-8 w-full max-w-4xl h-[90vh] flex flex-col ${theme === 'dark' ? 'border border-gray-700' : 'border border-gray-200'} shadow-2xl text-white`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-700 flex-shrink-0">
                        <h2 className="text-2xl font-bold">Medical History for {patientName}</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {loading && <p className="text-center text-gray-400 py-8">Loading history...</p>}
                        {error && <p className="text-center text-red-400 py-8">Error: {error}</p>}
                        {!loading && !error && history.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No medical history found for this patient.</p>
                        )}
                        {!loading && !error && history.length > 0 && (
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-700" />
                                {history.map((item, index) => (
                                    <div key={index} className="mb-6 relative">
                                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-gray-800 z-10" />
                                        <HistoryItem item={item} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PatientHistoryModal;
