import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, DollarSign, Bed, Activity, X } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

// In a real app, this would be in a separate config file
import apiUrl from '../config/api';

const Modal = ({ children, onClose }) => (
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
                className="bg-[#1C1C1E] rounded-2xl p-8 w-full max-w-lg border border-gray-700 shadow-2xl text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const ReportCard = ({ title, icon: Icon, stats, onSend, color }) => {
    const { theme } = useTheme();
    return (
        <motion.div
            variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
            }}
            className={`rounded-2xl border p-6 flex flex-col justify-between ${theme === 'dark' ? 'bg-[#1C1C1E] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                </div>
                <div className="space-y-3">
                    {stats.map((stat, i) => (
                        <div key={i} className={`flex items-baseline justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                            <span className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</span>
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={onSend} className="mt-6 w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Send Report via SMS
            </button>
        </motion.div>
    );
};

export default function SMSModule() {
  const { theme } = useTheme();
  const [summaries, setSummaries] = useState({
    patients: { total: 0, active: 0 },
    beds: { total: 0, occupied: 0 },
    receivables: { totalCollection: 0 }
  });
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsState, setSmsState] = useState({ to: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const response = await fetch(apiUrl('/api/sms/summaries'));
      setSummaries(await response.json());
    } catch (error) { console.error("Failed to fetch summaries:", error); }
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const response = await fetch(apiUrl('/api/sms/send'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(smsState),
        });
        const data = await response.json();
        if (data.success) {
            // In a real app, show a success toast/notification
            setShowSmsModal(false);
        } else {
            alert(`Failed to send SMS: ${data.error || data.message}`);
        }
    } catch (error) { 
        console.error('Failed to connect to the server.', error); 
        alert('Failed to connect to the server.');
    } finally {
        setIsLoading(false);
    }
  };

  const openSmsModalForReport = async (reportType) => {
    try {
        const response = await fetch(apiUrl(`/api/sms/report/${reportType}`));
        const data = await response.json();
        if (data.message) {
            setSmsState({ to: '', message: data.message });
            setShowSmsModal(true);
        } else {
            alert('Could not generate report.');
        }
    } catch (error) {
        console.error('Failed to fetch report data.', error);
        alert('Failed to fetch report data.');
    }
  };

  const summaryCards = [
    { title: 'Patient Summary', reportType: 'patients', icon: Users, color: 'from-pink-500 to-rose-500', stats: [ { label: 'Total Patients', value: summaries.patients.total }, { label: 'Active', value: summaries.patients.active } ] },
    { title: 'OPD Cash Summary', reportType: 'opd', icon: DollarSign, color: 'from-green-500 to-emerald-500', stats: [ { label: 'Total Collection', value: `$${Number(summaries.receivables.totalCollection || 0).toLocaleString()}` } ] },
    { title: 'Ward / Bed Status', reportType: 'ward-status', icon: Bed, color: 'from-orange-500 to-amber-500', stats: [ { label: 'Total Beds', value: summaries.beds.total }, { label: 'Occupied', value: summaries.beds.occupied } ] },
    { title: 'Admissions Today', reportType: 'admit-discharge', icon: Activity, color: 'from-sky-500 to-blue-600', stats: [ { label: 'Admissions', value: '23' }, { label: 'Discharges', value: '18' } ] },
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold">SMS & Reports</h1>
                    <p className="text-gray-400 mt-2">Send summaries and hospital statistics via SMS.</p>
                </div>
            </div>
        </motion.div>

        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {summaryCards.map((summary) => (
                <ReportCard 
                    key={summary.title}
                    {...summary} 
                    onSend={() => openSmsModalForReport(summary.reportType)} 
                />
            ))}
        </motion.div>
      
      {showSmsModal && (
          <Modal onClose={() => setShowSmsModal(false)}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Send SMS Notification</h2>
                <button onClick={() => setShowSmsModal(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><X size={24} /></button>
              </div>
              <form className="space-y-4" onSubmit={handleSendSms}>
                  <input 
                    placeholder="Recipient Phone Number (e.g., +919876543210)" 
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={smsState.to}
                    onChange={(e) => setSmsState({...smsState, to: e.target.value})}
                    required 
                  />
                  <textarea 
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    value={smsState.message}
                    onChange={(e) => setSmsState({...smsState, message: e.target.value})}
                    required
                  ></textarea>
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                      <button type="button" onClick={() => setShowSmsModal(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                      <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600">
                        {isLoading ? 'Sending...' : 'Send Message'}
                      </button>
                  </div>
              </form>
          </Modal>
      )}
    </div>
  );
}
