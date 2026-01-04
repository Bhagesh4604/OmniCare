import React, { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';
import { Calendar, FileText, DollarSign, LogOut, Plus, X, User, Clock, Bell, Pill, Edit, Beaker, Sparkles, Download, ArrowRight, BookUser, ShieldCheck, HeartPulse, Sun, Moon, LayoutGrid, ArrowLeft, Ambulance, Globe, Languages, Search, Video, Upload, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fromZonedTime, format } from 'date-fns-tz';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import apiUrl from '../../config/api';
import TriageChatModal from '../TriageChatModal';
import HealthTimeline from './HealthTimeline';
import MedicationTracker from './MedicationTracker';
import HeartHealthDashboard from '../../pages/HeartHealthDashboard'; // Import new module
import UploadReport from '../UploadReport';
import HealthTwinCanvas from '../3d/HealthTwin';
import EarlyDetectionModule from '../EarlyDetectionModule';
import MedicationScanner from './MedicationScanner';
import MedicineVerifier from '../../components/blockchain/MedicineVerifier';

import NewSidebar from '../NewSidebar';
import VoiceController from '../VoiceController';
import TiltCard from '../ui/TiltCard';
import Profile from '../../components/Profile';

// --- ANIMATIONS & STYLES ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

// --- SPATIAL COMPONENTS ---
const SpatialCard = ({ children, className = "", onClick }: any) => (
    <div onClick={onClick} className={`spatial-card p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}>
        {children}
    </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass = "text-blue-500", bgClass = "bg-blue-500/10" }) => (
    <SpatialCard className="flex items-center justify-between group">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 dark:group-hover:from-blue-400 dark:group-hover:to-cyan-300 transition-all">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${bgClass} backdrop-blur-md group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className={`${colorClass} drop-shadow-md`} size={24} />
        </div>
    </SpatialCard>
);

export default function PatientDashboard({ patient, onLogout, updateUser }) {
    const { theme, toggleTheme } = useTheme();
    const [healthRisks, setHealthRisks] = useState<{ heart: 'Low' | 'Medium' | 'High'; skin: 'Low' | 'Medium' | 'High'; general: 'Low' | 'Medium' | 'High' }>({ heart: 'High', skin: 'Low', general: 'Medium' }); // Mock Risk Data
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [billing, setBilling] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [labResults, setLabResults] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [showModal, setShowModal] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showMedScanner, setShowMedScanner] = useState(false);
    const navigate = useNavigate();

    // Refactored state for appointment booking
    const [newAppointment, setNewAppointment] = useState({ doctorId: '', notes: '', consultationType: 'in-person' });
    const [bookingDate, setBookingDate] = useState('');
    const [bookingSlot, setBookingSlot] = useState('');

    const fileInputRef = useRef(null);

    const handleUploadSuccess = (data) => {
        // Mock saving to local state for instant feedback
        const newRecord = {
            recordId: Date.now(),
            diagnosis: "Uploaded Report",
            doctorName: "AI Analysis",
            recordDate: new Date().toISOString(),
            treatment: data.healthPlan?.summary || "Report analyzed by AI",
            notes: "Uploaded via Patient Portal"
        };
        setRecords([newRecord, ...records]);
        setShowUploadModal(false);
        alert("Report uploaded and analyzed successfully!");
    };
    const [showTriageModal, setShowTriageModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryContent, setSummaryContent] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    // Language & Explain Features
    const [language, setLanguage] = useState('English');
    const languages = ['English', 'Spanish', 'French', 'Hindi', 'German', 'Chinese'];
    const [explainTerm, setExplainTerm] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    const handleExplainTerm = async (e) => {
        e.preventDefault();
        if (!explainTerm) return;

        setIsExplaining(true);
        setExplanation('');

        const systemPrompt = `You are a helpful medical translator and simplifier. 
        Explain the medical term provided by the user in simple, easy-to-understand ${language}. 
        Keep the explanation concise (2-3 sentences). 
        If the term is not medical, politely say you can only explain medical terms.`;

        try {
            const res = await fetch(apiUrl('/api/ai/ask'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: explainTerm }] }),
            });
            const data = await res.json();
            setExplanation(data.reply || "Could not generate explanation.");
        } catch (err) {
            setExplanation('Error: Could not connect to the AI service.');
        } finally {
            setIsExplaining(false);
        }
    };

    const fetchAllData = () => {
        if (!patient || !patient.id) return;
        const patientId = patient.id;
        Promise.all([
            fetch(apiUrl(`/api/portal/my-appointments/${patientId}`)).then(res => res.json()),
            fetch(apiUrl(`/api/portal/my-records/${patientId}`)).then(res => res.json()),
            fetch(apiUrl(`/api/portal/my-billing/${patientId}`)).then(res => res.json()),
            fetch(apiUrl(`/api/portal/my-lab-results/${patientId}`)).then(res => res.json()),
            fetch(apiUrl(`/api/portal/my-prescriptions/${patientId}`)).then(res => res.json()),
            fetch(apiUrl('/api/employees')).then(res => res.json())
        ]).then(([appointmentsData, recordsData, billingData, labData, prescData, doctorsData]) => {
            console.log('Appointments Data:', JSON.stringify(appointmentsData, null, 2));
            setAppointments(appointmentsData || []);
            setRecords(recordsData || []);
            setBilling(billingData || []);
            setLabResults(labData || []);
            setPrescriptions(prescData || []);
            setDoctors(doctorsData.filter(emp => emp.role === 'doctor') || []);
        }).catch(error => { console.error("Failed to fetch patient data:", error); });
    };

    useEffect(() => {
        // Voice Navigation Handler
        const handleVoiceSwitch = (e: any) => {
            const tab = e.detail;
            if (tab === 'medications') setActiveTab('medication-tracker');
            else if (tab === 'records') setActiveTab('records');
            else if (tab === 'appointments') setActiveTab('appointments');
            else if (tab === 'billing') setActiveTab('billing');
            else if (tab === 'health-twin') setActiveTab('health-twin');
            else if (tab === 'early-detection') setActiveTab('early-detection');
            else setActiveTab(tab);
        };
        window.addEventListener('switch-patient-tab', handleVoiceSwitch);

        // Voice Action Handler (Modals)
        const handleVoiceAction = (e: any) => {
            const modal = e.detail;
            if (modal === 'triage') setShowTriageModal(true);
        };
        window.addEventListener('open-modal', handleVoiceAction);

        return () => {
            window.removeEventListener('switch-patient-tab', handleVoiceSwitch);
            window.removeEventListener('open-modal', handleVoiceAction);
        };
    }, []);

    useEffect(() => {
        if (patient && patient.id) {
            fetchAllData();
        }
    }, [patient]);

    const handlePhotoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profilePhoto', file);
        try {
            const response = await fetch(apiUrl(`/api/patients/${patient.id}/upload-photo`), {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                updateUser({ profileImageUrl: data.profileImageUrl });
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    const [availableSlots, setAvailableSlots] = useState([]);

    const fetchAvailableSlots = async (doctorId, date) => {
        if (!doctorId || !date) {
            setAvailableSlots([]);
            return;
        }
        try {
            const response = await fetch(apiUrl(`/api/schedules/available-slots/${doctorId}/${date}`));
            setAvailableSlots(await response.json());
        } catch (error) {
            console.error("Failed to fetch available slots:", error);
            setAvailableSlots([]);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!bookingSlot) {
            alert("Please select an available time slot.");
            return;
        }
        const timeZone = 'Asia/Kolkata';
        const utcAppointmentDate = fromZonedTime(bookingSlot, timeZone);
        try {
            const response = await fetch(apiUrl('/api/portal/book-appointment'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAppointment, patientId: patient.id, appointmentDate: utcAppointmentDate }),
            });
            const data = await response.json();
            if (data.success) {
                setShowModal(null);
                setNewAppointment({ doctorId: '', notes: '' });
                setBookingDate('');
                setBookingSlot('');
                setAvailableSlots([]);
                fetchAllData();
            } else {
                alert(data.message || 'Failed to book appointment.');
            }
        } catch (error) { console.error(error); }
    };

    const handleSummarizeHistory = async () => {
        setIsSummarizing(true);
        setShowSummaryModal(true);
        setSummaryContent('');

        const historyText = records.map(r => `On ${new Date(r.recordDate).toLocaleDateString()}, Dr. ${r.doctorName} diagnosed '${r.diagnosis}' and prescribed the following treatment: ${r.treatment}`).join('\n');
        const systemPrompt = `You are a helpful medical assistant. Your task is to summarize the provided medical history for a patient in simple, easy-to-understand ${language}. Organize it chronologically if possible. Do not provide new medical advice. Start by saying 'Here is a summary of your medical history (in ${language}):'.`;
        const userQuery = `Please summarize the following medical records:\n\n${historyText}`;

        try {
            const res = await fetch(apiUrl('/api/ai/ask'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userQuery }] }),
            });
            const data = await res.json();
            setSummaryContent(data.reply || "Could not generate summary.");
        } catch (err) {
            setSummaryContent('Error: Could not connect to the AI service.');
        } finally {
            setIsSummarizing(false);
        }
    };

    useEffect(() => {
        if (newAppointment.doctorId && bookingDate) {
            fetchAvailableSlots(newAppointment.doctorId, bookingDate);
        }
    }, [newAppointment.doctorId, bookingDate]);

    const nextAppointment = appointments.find(a => new Date(a.appointmentDate) > new Date() && a.status === 'scheduled');


    // --- DASHBOARD CONTENT ---

    const dashboardJSX = (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {/* Greeting Banner */}
                <motion.div variants={itemVariants} className="relative p-6 md:p-10 rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-2xl border border-white/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {patient?.firstName}</h1>
                            <p className="text-indigo-200 text-base md:text-lg max-w-2xl font-light">Your health metrics are stable. You have <span className="font-bold text-white">{appointments.filter(a => new Date(a.appointmentDate) > new Date()).length} upcoming</span> activities.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => setShowUploadModal(true)} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-xl h-12 px-6">
                                <Upload size={18} className="mr-2" /> Upload Report
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { title: 'Symptom Checker', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10', action: () => setShowTriageModal(true) },
                        { title: 'Emergency SOS', icon: Ambulance, color: 'text-red-400', bg: 'bg-red-500/10', action: () => navigate('/patient/book-ambulance') },
                        { title: 'Medications', icon: Pill, color: 'text-green-400', bg: 'bg-green-500/10', action: () => setActiveTab('medications') },
                        { title: 'Scan Medicine', icon: Scan, color: 'text-blue-400', bg: 'bg-blue-500/10', action: () => setShowMedScanner(true) },
                        { title: 'Verify Batch', icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', action: () => setActiveTab('medicine-verifier') },
                    ].map((item, idx) => (
                        <SpatialCard
                            key={idx}
                            onClick={item.action}
                            className="flex flex-col items-center justify-center text-center hover:bg-white/10 dark:hover:bg-white/5"
                        >
                            <div className={`p-4 rounded-full ${item.bg} mb-3 group-hover:scale-110 transition-transform`}>
                                <item.icon className={item.color} size={28} />
                            </div>
                            <h3 className="font-bold text-gray-700 dark:text-white text-sm">{item.title}</h3>
                        </SpatialCard>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Appointment Card */}
                <SpatialCard className="flex flex-col h-full !bg-gradient-to-br from-blue-900/40 to-slate-900/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-xl"><Calendar className="text-blue-400" size={20} /></div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Next Visit</h3>
                    </div>

                    {nextAppointment ? (
                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <div>
                                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-1">{new Date(nextAppointment.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                <p className="text-xl text-gray-600 dark:text-gray-300">{new Date(nextAppointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl">👨‍⚕️</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">Dr. {nextAppointment.doctorName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">General Physician</p>
                                </div>
                            </div>
                            {nextAppointment.consultationType === 'virtual' && nextAppointment.roomUrl && (
                                <button onClick={() => window.open(nextAppointment.roomUrl, '_blank')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                                    <Video size={20} /> Join Consultation
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                            <Calendar className="w-16 h-16 text-gray-700 mb-4" />
                            <p className="text-gray-400 mb-6">No upcoming visits scheduled.</p>
                            <Button onClick={() => setActiveTab('appointments')} className="bg-blue-600 text-white rounded-full px-8">Book Now</Button>
                        </div>
                    )}
                </SpatialCard>

                {/* Medical Explainer Tool */}
                <SpatialCard className="flex flex-col h-full !bg-gradient-to-br from-indigo-50 dark:from-indigo-900/40 to-slate-50 dark:to-slate-900/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-xl"><Languages className="text-indigo-400" size={20} /></div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Medical Translator</h3>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Type a medical term (e.g. Hypertension)..."
                            value={explainTerm}
                            onChange={(e) => setExplainTerm(e.target.value)}
                            className="spatial-input w-full"
                        />
                        <Button onClick={handleExplainTerm} disabled={isExplaining || !explainTerm} className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 rounded-xl text-lg font-medium">
                            {isExplaining ? 'Translating...' : 'Explain in Simple English'}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {explanation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-5 bg-black/20 rounded-2xl border border-white/5"
                            >
                                <p className="text-indigo-300 text-sm font-bold mb-2">AI Explanation:</p>
                                <p className="text-gray-300 leading-relaxed">{explanation}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SpatialCard>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Visits" value={appointments.length} icon={Calendar} colorClass="text-blue-400" bgClass="bg-blue-500/20" />
                <StatCard title="Test Results" value={labResults.length} icon={Beaker} colorClass="text-teal-400" bgClass="bg-teal-500/20" />
                <StatCard title="Bills Due" value={`$${billing.filter(b => b.paymentStatus !== 'paid').reduce((acc, curr) => acc + curr.amount, 0)}`} icon={DollarSign} colorClass="text-amber-400" bgClass="bg-amber-500/20" />
                <StatCard title="Pending" value={billing.filter(b => b.paymentStatus === 'pending').length} icon={Clock} colorClass="text-red-400" bgClass="bg-red-500/20" />
            </div>
        </motion.div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return dashboardJSX;
            case 'appointments':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <div className="flex justify-between items-center p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Visits</h2>
                            <Button onClick={() => setShowModal('bookAppointment')} className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">Book New</Button>
                        </div>
                        <div className="grid gap-4">
                            {appointments.map((apt) => (
                                <SpatialCard key={apt.id} className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl border border-white/10">👨‍⚕️</div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Dr. {apt.doctorName}</h3>
                                            <p className="text-gray-400">{apt.reason || 'General Consultation'}</p>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-blue-400">
                                                <Calendar size={14} />
                                                {new Date(apt.appointmentDate).toLocaleDateString()} at {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${apt.status === 'scheduled' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                        {apt.status.toUpperCase()}
                                    </span>
                                </SpatialCard>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'records':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Medical History</h2>
                            <Button onClick={() => setShowUploadModal(true)}><Upload className="mr-2" size={18} /> Upload Report</Button>
                        </div>
                        <div className="grid gap-4">
                            {records.map(rec => (
                                <SpatialCard key={rec.recordId}>
                                    <div className="flex justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{rec.diagnosis}</h3>
                                        <span className="text-sm text-gray-500">{new Date(rec.recordDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">{rec.treatment}</p>
                                </SpatialCard>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'medications': return <MedicationTracker patient={patient} />;
            case 'billing':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Billing</h2>
                        {billing.map(bill => (
                            <SpatialCard key={bill.billId} className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-400 text-sm">Invoice #{bill.billId}</p>
                                    <p className="text-2xl font-bold text-white">${bill.amount}</p>
                                </div>
                                <Button className="bg-indigo-600">Pay Now</Button>
                            </SpatialCard>
                        ))}
                    </motion.div>
                );
            case 'health-twin':
                return <motion.div variants={containerVariants} initial="hidden" animate="visible"><HealthTwinCanvas risks={healthRisks} /></motion.div>;
            case 'profile': return <Profile user={patient} updateUser={updateUser} />;
            case 'medicine-verifier': return <MedicineVerifier isEmbedded={true} />;
            case 'early-detection': return <EarlyDetectionModule />;
            case 'heart-health':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <HeartHealthDashboard />
                    </motion.div>
                );
            case 'prescriptions':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Prescriptions</h2>
                        <div className="grid gap-4">
                            {prescriptions.length > 0 ? prescriptions.map((pres: any) => (
                                <SpatialCard key={pres.id || Math.random()}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-400"><Pill size={24} /></div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pres.medicationName}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{pres.dosage} - {pres.frequency}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between text-sm">
                                        <span className="text-gray-500">Prescribed by Dr. {pres.doctorName}</span>
                                        <span className="text-blue-500 dark:text-blue-400">{new Date(pres.dateIssued).toLocaleDateString()}</span>
                                    </div>
                                </SpatialCard>
                            )) : <p className="text-gray-500 dark:text-gray-400">No active prescriptions.</p>}
                        </div>
                    </motion.div>
                );
            case 'lab_results':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lab Results</h2>
                            <Button onClick={() => setShowUploadModal(true)}><Upload className="mr-2" size={18} /> Upload Report</Button>
                        </div>
                        <div className="grid gap-4">
                            {labResults.length > 0 ? labResults.map((lab: any) => (
                                <SpatialCard key={lab.id || Math.random()}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{lab.testName}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">{new Date(lab.testDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${lab.status === 'completed' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>{lab.status}</span>
                                    </div>
                                    <div className="mt-4 bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{lab.resultSummary || "Results pending or file attached."}</p>
                                    </div>
                                </SpatialCard>
                            )) : <p className="text-gray-500 dark:text-gray-400">No lab results found.</p>}
                        </div>
                    </motion.div>
                );
            default: return dashboardJSX;
        }
    };

    return (
        // SPATIAL CONTAINER
        <div className="flex h-screen overflow-hidden font-sans spatial-bg text-white selection:bg-blue-500/30">
            {/* VoiceController removed (handled globally in App.tsx) */}

            {/* Ambient Light/Glows */}
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="relative z-20 h-full">
                <NewSidebar
                    activeModule={activeTab}
                    setActiveModule={setActiveTab}
                    userType="patient"
                    onLogout={onLogout}
                    user={patient}
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="p-6 flex justify-between items-center bg-transparent sticky top-0 z-30">
                    <div className="flex items-center gap-3 lg:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white/10 text-white"><LayoutGrid size={24} /></button>
                        <span className="font-bold text-xl text-white">Omni Care</span>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                            <Bell size={20} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Apple ease
                            className="max-w-7xl mx-auto pb-20"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showModal === 'bookAppointment' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1c1c1e] w-[95%] max-w-lg rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setShowModal(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full"><X size={18} /></button>
                            <h2 className="text-2xl font-bold text-white mb-6">Book Appointment</h2>
                            <form onSubmit={handleBookAppointment} className="space-y-6">
                                {/* Doctor Selector */}
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Doctor</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {doctors.filter(d => d.role === 'doctor').map(doc => (
                                            <div key={doc.id} onClick={() => { setNewAppointment(p => ({ ...p, doctorId: doc.id })); setBookingDate(''); setBookingSlot(''); }}
                                                className={`flex-shrink-0 w-24 p-3 rounded-2xl border cursor-pointer text-center transition-all ${newAppointment.doctorId === doc.id ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5'}`}>
                                                <div className="w-10 h-10 rounded-full bg-white/10 mx-auto mb-2" />
                                                <p className="text-xs font-bold truncate text-white">{doc.firstName}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Date & Time - Simplified for UI demo */}
                                <input type="date" className="spatial-input w-full" onChange={(e) => setBookingDate(e.target.value)} />
                                {bookingDate && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map((slot: string) => (
                                                <div
                                                    key={slot}
                                                    onClick={() => setBookingSlot(slot)}
                                                    className={`p-2 rounded-lg text-xs text-center border cursor-pointer ${bookingSlot === slot
                                                        ? 'bg-blue-600 border-blue-500 text-white'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="col-span-3 text-sm text-gray-400 text-center py-2">No slots available for this date.</p>
                                        )}
                                    </div>
                                )}
                                <Button className="w-full bg-blue-600 h-12 rounded-xl">Confirm Booking</Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showTriageModal && <TriageChatModal onClose={() => setShowTriageModal(false)} />}
            {showUploadModal && <UploadReport onClose={() => setShowUploadModal(false)} onSave={handleUploadSuccess} />}
            {showMedScanner && <MedicationScanner onClose={() => setShowMedScanner(false)} />}
        </div>
    );
}
