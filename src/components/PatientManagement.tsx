import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Eye, Trash2, Edit2, X, Users, UserCheck, UserX, Sparkles, CheckCircle, Send, History } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import PatientHistoryModal from './PatientHistoryModal'; // New import

// In a real app, these would be in separate files
import apiUrl from '../config/api';

// --- Reusable Components ---

const Modal = ({ children, onClose, width = "max-w-2xl" }) => (
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

// --- Main Patient Management Module ---

export default function PatientManagement() {
  const { theme } = useTheme();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showWelcomeSms, setShowWelcomeSms] = useState(null);
  const [generatedSms, setGeneratedSms] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsStatus, setSmsStatus] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false); // New state


  const [newPatient, setNewPatient] = useState({
    patientId: `PAT${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
    phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '', status: 'active'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json() || []);
    } catch (error) { console.error('Failed to fetch patients:', error); }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'new') {
      setNewPatient(prevState => ({ ...prevState, [name]: value }));
    } else if (selectedPatient) {
      setSelectedPatient(prevState => (prevState ? { ...prevState, [name]: value } : null));
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/patients/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      const data = await response.json();
      if (data.success) {
        setModal(null);
        fetchPatients();
        setShowWelcomeSms(newPatient); // Trigger Gemini Welcome SMS modal
      } else {
        alert(data.message);
      }
    } catch (error) { console.error('Failed to connect to the server.', error); alert('Failed to connect to the server.'); }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const response = await fetch(apiUrl(`/api/patients/${selectedPatient.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPatient),
      });
      const data = await response.json();
      if (data.success) {
        setModal(null);
        fetchPatients();
      } else {
        alert(data.message);
      }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeletePatient = async (patientId) => {
    try {
        const response = await fetch(apiUrl(`/api/patients/${patientId}`), {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            fetchPatients();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
    setShowDeleteConfirm(null);
  };
  
    const handleGenerateSms = async (patient) => {
        setIsGenerating(true);
        setGeneratedSms('');
        setSmsStatus('');
        const systemPrompt = "You are an assistant for 'Shree Medicare Hospital'. Your tone is welcoming, professional, and very brief, suitable for an SMS message.";
        const userQuery = `Draft a welcome SMS for a new patient named ${patient.firstName} ${patient.lastName}. Inform them their registration is complete and they can now use the patient portal.`;
        
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
            setGeneratedSms(text || "Could not generate SMS draft.");
        } catch (error) {
            console.error("Gemini API error:", error);
            setGeneratedSms("Error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSendWelcomeSms = async () => {
        if (!showWelcomeSms?.phone || !generatedSms) {
            setSmsStatus('Error: Phone number or message is missing.');
            return;
        }
        setIsSendingSms(true);
        setSmsStatus('Sending...');
        try {
            const response = await fetch(apiUrl('/api/sms/send'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: showWelcomeSms.phone, message: generatedSms }),
            });
            const data = await response.json();
            if (data.success) {
                setSmsStatus('Sent Successfully!');
            } else {
                setSmsStatus(`Error: ${data.error || data.message}`);
            }
        } catch (error) {
            console.error('SMS send error:', error);
            setSmsStatus('Error: Failed to connect to the SMS service.');
        } finally {
            setIsSendingSms(false);
        }
    };


  const openModal = (type, patient = null) => {
    setModal(type);
    if (patient) setSelectedPatient(JSON.parse(JSON.stringify(patient)));
    if (type === 'add') {
      setNewPatient({
        patientId: `PAT${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
        phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '', status: 'active'
      });
    }
  };

  const filteredPatients = useMemo(() =>
    patients.filter(p =>
      Object.values(p).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ), [patients, searchTerm]
  );
  
  const getStatusPill = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'discharged': return 'bg-gray-500/20 text-gray-400';
      case 'transferred': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Patient Management</h1>
                    <p className="text-gray-400 mt-2">Manage all patient records and information.</p>
                </div>
                <button onClick={() => openModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    <span>Register Patient</span>
                </button>
            </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}><StatCard title="Total Patients" value={patients.length} icon={Users} color="text-blue-400"/></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Active" value={patients.filter(p=>p.status === 'active').length} icon={UserCheck} color="text-green-400"/></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Discharged" value={patients.filter(p=>p.status === 'discharged').length} icon={UserX} color="text-gray-500"/></motion.div>
        </motion.div>

        <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input type="text" placeholder="Search by name, email, or patient ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead><tr className="border-b border-gray-800"><th className="p-4 text-left text-sm font-semibold text-gray-400">Photo</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Patient ID</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Name</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Contact</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th></tr></thead>
                    <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                        {filteredPatients.map((p) => (
                            <motion.tr key={p.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-4">
                                    <img 
                                        src={p.profileImageUrl ? `${apiUrl('')}${p.profileImageUrl}` : `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=1c1c1e&color=a0a0a0&bold=true`} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover border border-gray-700"
                                    />
                                </td>
                                <td className="p-4"><span className="font-semibold text-pink-400">{p.patientId}</span></td>
                                <td className="p-4"><div className="font-semibold">{p.firstName} {p.lastName}</div><div className="text-sm text-gray-400">{p.email}</div></td>
                                <td className="p-4 text-sm text-gray-300">{p.phone}</td>
                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusPill(p.status)}`}>{p.status.toUpperCase()}</span></td>
                                <td className="p-4"><div className="flex items-center justify-end space-x-2"><button onClick={() => openModal('details', p)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Eye size={18}/></button><button onClick={() => openModal('edit', p)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit2 size={18}/></button><button onClick={() => setShowDeleteConfirm(p)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button></div></td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredPatients.length === 0 && <p className="text-center py-12 text-gray-500">No patients found.</p>}
            </div>
        </div>

        {modal && (
            <Modal onClose={() => setModal(null)} width={modal === 'details' ? 'max-w-lg' : 'max-w-2xl'}>
                {modal === 'add' && (
                    <form onSubmit={handleAddPatient}>
                        <h2 className="text-2xl font-bold mb-6">Register New Patient</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" onChange={(e) => handleInputChange(e, 'new')} placeholder="First Name" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                            <input name="lastName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Last Name" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                            <input name="email" type="email" onChange={(e) => handleInputChange(e, 'new')} placeholder="Email" className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                            <input name="phone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Phone (for SMS)" className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                        </div>
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                           <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                           <button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700">Register Patient</button>
                       </div>
                    </form>
                )}
                 {modal === 'edit' && selectedPatient && (
                    <form onSubmit={handleUpdatePatient}>
                         <h2 className="text-2xl font-bold mb-6">Edit Patient Details</h2>
                         <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" value={selectedPatient.firstName} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                            <input name="lastName" value={selectedPatient.lastName} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                            <input name="phone" value={selectedPatient.phone} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                             <select name="status" value={selectedPatient.status} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg">
                                <option value="active">Active</option>
                                <option value="discharged">Discharged</option>
                                <option value="transferred">Transferred</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                            <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Save Changes</button>
                        </div>
                    </form>
                )}
                 {modal === 'details' && selectedPatient && (
                    <div>
                        <div className="flex justify-between items-start mb-4">
                             <h2 className="text-2xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                             <button onClick={() => setModal(null)} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-700"><X size={20}/></button>
                        </div>
                        <div className="flex flex-col items-center mb-6">
                            <img 
                                src={selectedPatient.profileImageUrl ? `${apiUrl('')}${selectedPatient.profileImageUrl}` : `https://ui-avatars.com/api/?name=${selectedPatient.firstName}+${selectedPatient.lastName}&background=1c1c1e&color=a0a0a0&bold=true`} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                            />
                            <p className="text-sm text-gray-400 mt-2">Patient ID: {selectedPatient.patientId}</p>
                        </div>
                        <div className="space-y-3 text-gray-300">
                           <p><strong>Email:</strong> {selectedPatient.email || 'N/A'}</p>
                           <p><strong>Phone:</strong> {selectedPatient.phone || 'N/A'}</p>
                           <p><strong>Status:</strong> <span className={`font-semibold ${selectedPatient.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>{selectedPatient.status.toUpperCase()}</span></p>
                        </div>
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-800">
                            <button onClick={() => setShowHistoryModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">View Full History</button>
                        </div>
                    </div>
                )}
            </Modal>
        )}

        {showHistoryModal && selectedPatient && (
            <PatientHistoryModal
                patientId={selectedPatient.patientId}
                patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                onClose={() => setShowHistoryModal(false)}
            />
        )}

        {showDeleteConfirm && (
            <Modal onClose={() => setShowDeleteConfirm(null)} width="max-w-md">
                <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                <p className="text-gray-400 mb-6">Are you sure you want to delete patient "{showDeleteConfirm.firstName} {showDeleteConfirm.lastName}"? This cannot be undone.</p>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                    <button type="button" onClick={() => handleDeletePatient(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
                </div>
            </Modal>
        )}

        {showWelcomeSms && (
             <Modal onClose={() => setShowWelcomeSms(null)} width="max-w-xl">
                 <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><CheckCircle className="text-green-400"/> Patient Registered Successfully!</h2>
                 <p className="text-gray-400 mb-6">Use the AI assistant to generate and send a welcome SMS to {showWelcomeSms.firstName}.</p>

                 {!generatedSms && !isGenerating && (
                    <button onClick={() => handleGenerateSms(showWelcomeSms)} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Sparkles size={20} /> Generate Welcome SMS
                    </button>
                 )}

                {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">AI is drafting a message...</p>}
                
                {generatedSms && (
                    <div className="space-y-4">
                        <textarea 
                            value={generatedSms} 
                            onChange={(e) => setGeneratedSms(e.target.value)}
                            className="w-full p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 h-40 resize-none"
                        />
                        <div className="flex justify-end gap-4">
                            <button onClick={() => navigator.clipboard.writeText(generatedSms)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy</button>
                            <button 
                                onClick={handleSendWelcomeSms} 
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
