import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Sparkles, X, User } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

// In a real app, these would be in separate files
import apiUrl from '@/config/api';

// --- Reusable Components ---

const Modal = ({ children, onClose, width = "max-w-xl" }) => (
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

// --- Main Appointments View Module ---

export default function AppointmentsView({ user }) {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('upcoming'); // 'upcoming' or 'past'
  const [showSummaryModal, setShowSummaryModal] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const url = isAdmin
          ? apiUrl('/api/appointments/all')
          : apiUrl(`/api/appointments/doctor/${user.id}`);
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching appointments:', errorData);
            setAppointments([]);
            return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            setAppointments(data);
        } else {
            console.warn('API did not return an array for appointments:', data);
            setAppointments([]);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, [user, isAdmin]);

  const handleGenerateSummary = async (appointment) => {
    setIsGenerating(true);
    setGeneratedSummary('');
    const systemPrompt = "You are a medical assistant AI. Your task is to provide a very brief, structured pre-consultation summary for a doctor. Focus on the key information provided. Use bullet points for clarity.";
    const userQuery = `Summarize the upcoming appointment for patient ${appointment.patientName}. The appointment is for the ${appointment.departmentName} department. The provided reason for the visit is: "${appointment.notes}". Highlight the main complaint.`;

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
        setGeneratedSummary(text || "Could not generate summary.");
    } catch (error) {
        console.error("Gemini API error:", error);
        setGeneratedSummary("Error connecting to AI service.");
    } finally {
        setIsGenerating(false);
    }
  };

  const filteredAppointments = useMemo(() => appointments.filter(app => app.appointmentDate).filter(app => {
    const appDate = new Date(app.appointmentDate);
    const now = new Date();
    if (view === 'upcoming') {
      return appDate >= now && app.status === 'scheduled';
    }
    return appDate < now;
  }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()), [appointments, view]);

  if (!user || !user.role) {
    return <div className="p-8 text-center text-gray-500">Loading user data or user not authorized...</div>;
  }
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const tabs = ['upcoming', 'past'];

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">{isAdmin ? 'All Appointments' : 'My Appointments'}</h1>
            <p className="text-gray-400 mt-2">View upcoming and past patient consultations.</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}><StatCard title="Total Appointments" value={appointments.length} icon={Calendar} color="text-blue-400"/></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Upcoming Today" value={appointments.filter(a => a.appointmentDate && new Date(a.appointmentDate).toDateString() === new Date().toDateString() && new Date(a.appointmentDate) >= new Date()).length} icon={Clock} color="text-yellow-400"/></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Completed This Week" value={appointments.filter(a => a.appointmentDate && a.status === 'completed' && new Date(a.appointmentDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} icon={CheckCircle} color="text-green-400"/></motion.div>
      </motion.div>
      
      <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
        <div className="w-full max-w-sm border-b border-gray-800 mb-6">
            <div className="flex space-x-2 relative">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setView(tab)} className={`flex-1 py-2.5 text-sm rounded-lg font-semibold transition-colors z-10 ${view === tab ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
                <motion.div layoutId="activeApptTab" className="absolute h-full w-1/2 bg-blue-600 rounded-lg" transition={{ type: 'spring', stiffness: 300, damping: 25 }} animate={{ x: `${tabs.indexOf(view) * 100}%` }} />
            </div>
        </div>
        
        <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {filteredAppointments.length > 0 ? (
                    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                        {filteredAppointments.map(app => (
                            <motion.div key={app.id} variants={itemVariants} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-white">{app.patientName}</p>
                                    <p className="text-sm text-gray-400">
                                        {isAdmin && <span className="flex items-center"><User size={12} className="mr-1"/>Dr. {app.doctorName}</span>}
                                        {app.departmentName} - <span className="text-xs">{app.appointmentDate ? new Date(app.appointmentDate).toLocaleString() : 'No date'}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${app.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>{app.status}</span>
                                    {view === 'upcoming' && (
                                         <button onClick={() => {setShowSummaryModal(app); setGeneratedSummary('');}} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="AI Pre-Consultation Summary"><Sparkles size={18}/></button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Calendar className="mx-auto w-12 h-12 mb-4" />
                        No {view} appointments found.
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>

      {showSummaryModal && (
        <Modal onClose={() => setShowSummaryModal(null)}>
             <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">✨ AI Pre-Consultation Summary</h2>
             <p className="text-gray-400 mb-6">A quick summary for {showSummaryModal.patientName}'s upcoming appointment.</p>
             
             {!generatedSummary && !isGenerating && (
                <button onClick={() => handleGenerateSummary(showSummaryModal)} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Sparkles size={20} /> Generate Summary
                </button>
             )}

            {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">AI is preparing the summary...</p>}
            
            {generatedSummary && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: generatedSummary.replace(/\n/g, '<br />') }} />
                    <div className="flex justify-end gap-4">
                         <button onClick={() => navigator.clipboard.writeText(generatedSummary)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy Text</button>
                         <button onClick={() => setShowSummaryModal(null)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Done</button>
                    </div>
                </div>
            )}
        </Modal>
      )}
    </div>
  );
}
