import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Scissors, Calendar, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTheme } from '../context/ThemeContext';

// In a real app, these would be in separate files
import apiUrl from '../config/api';
// interface Patient { id: string; firstName: string; lastName: string; }
// interface Employee { id: string; firstName: string; lastName: string; }
// interface SurgeryRecord { id: string; surgeryNumber: string; patientName: string; surgeonName: string; surgeryType: string; surgeryDate: string; status: 'scheduled' | 'completed' | 'canceled'; }

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

export default function SurgicalModule() {
  const { theme } = useTheme();
  const [surgeries, setSurgeries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [patients, setPatients] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [newSurgery, setNewSurgery] = useState({ 
    surgeryNumber: `SURG-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: '', 
    surgeonId: '', 
    surgeryType: '', 
    surgeryDate: '', 
    notes: '' 
  });

  useEffect(() => {
    fetchSurgeries();
    fetchPatients();
    fetchSurgeons();
  }, []);

  const fetchSurgeries = async () => {
    try {
      const res = await fetch(apiUrl('/api/surgical'));
      const data = await res.json();
      setSurgeries(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Failed to fetch surgeries:", e); }
  };
  
  const fetchPatients = async () => {
    try {
      const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json());
    } catch (error) { console.error('Failed to fetch patients:', error); }
  };
  
  const fetchSurgeons = async () => {
    try {
      const response = await fetch(apiUrl('/api/employees'));
      const allEmployees = await response.json();
      setSurgeons(allEmployees.filter(emp => emp.role === 'doctor' || emp.position.toLowerCase().includes('surgeon')));
    } catch (error) { console.error('Failed to fetch surgeons:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSurgery(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSurgery = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/surgical/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSurgery),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchSurgeries();
      } else {
        alert(data.message);
      }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleUpdateStatus = async (surgeryId, newStatus) => {
    try {
      const response = await fetch(apiUrl(`/api/surgical/${surgeryId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchSurgeries(); // Refresh list
      } else {
        alert(data.message);
      }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeleteSurgery = async (surgeryId) => {
    try {
        const response = await fetch(apiUrl(`/api/surgical/${surgeryId}`), { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            fetchSurgeries();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
    setShowDeleteConfirm(null);
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'canceled': return 'bg-red-500/20 text-red-300';
      case 'scheduled':
      default: return 'bg-blue-500/20 text-blue-300';
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
  
  const surgeriesToday = useMemo(() => surgeries.filter(s => new Date(s.surgeryDate).toDateString() === new Date().toDateString()).length, [surgeries]);

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Surgical Module</h1>
            <p className="text-gray-400 mt-2">Manage all scheduled and completed surgeries.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
            <Plus size={20} />
            <span>Schedule Surgery</span>
          </button>
        </div>
      </motion.div>

       <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><StatCard title="Total Surgeries" value={surgeries.length} icon={Scissors} color="text-blue-400" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Scheduled Today" value={surgeriesToday} icon={Calendar} color="text-orange-400" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Completed" value={surgeries.filter(s => s.status === 'completed').length} icon={CheckCircle} color="text-green-400" /></motion.div>
      </motion.div>

        <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Procedure</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Patient & Surgeon</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Date & Time</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                        {surgeries.map(surg => (
                            <motion.tr key={surg.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="p-4">
                                    <p className="font-semibold">{surg.surgeryType}</p>
                                    <p className="text-xs text-gray-500">{surg.surgeryNumber}</p>
                                </td>
                                <td className="p-4 text-sm text-gray-300">
                                    <div>{surg.patientName}</div>
                                    <div className="text-gray-500 text-xs">Dr. {surg.surgeonName}</div>
                                </td>
                                <td className="p-4 text-gray-400 text-sm">{new Date(surg.surgeryDate).toLocaleString()}</td>
                                <td className="p-4">
                                    <select value={surg.status} onChange={(e) => handleUpdateStatus(surg.id, e.target.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none outline-none appearance-none transition-colors ${getStatusPill(surg.status)} bg-opacity-100`}>
                                        <option value="scheduled" className="bg-gray-800 text-white">Scheduled</option>
                                        <option value="completed" className="bg-gray-800 text-white">Completed</option>
                                        <option value="canceled" className="bg-gray-800 text-white">Canceled</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end">
                                        <button onClick={() => setShowDeleteConfirm(surg)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {surgeries.length === 0 && <p className="text-center py-12 text-gray-500">No surgeries scheduled.</p>}
            </div>
        </div>
      
        {showAddModal && (
          <Modal onClose={() => setShowAddModal(false)}>
              <form onSubmit={handleAddSurgery}>
                  <h2 className="text-2xl font-bold mb-6 text-white">Schedule New Surgery</h2>
                  <div className="grid grid-cols-2 gap-4">
                      <select name="patientId" onChange={handleInputChange} className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required>
                          <option value="">Select Patient</option>
                          {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                      </select>
                      <select name="surgeonId" onChange={handleInputChange} className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required>
                          <option value="">Select Surgeon</option>
                          {surgeons.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                      </select>
                      <input name="surgeryType" onChange={handleInputChange} placeholder="Surgery Type / Procedure" className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required/>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-400">Surgery Date & Time</label>
                        <input name="surgeryDate" type="datetime-local" onChange={handleInputChange} className="w-full p-3 bg-gray-800 border-gray-700 rounded-lg text-white mt-1" required />
                      </div>
                      <textarea name="notes" onChange={handleInputChange} placeholder="Notes..." className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" rows={3}></textarea>
                  </div>
                   <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                      <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Schedule</button>
                  </div>
              </form>
          </Modal>
      )}

       {showDeleteConfirm && (
          <Modal onClose={() => setShowDeleteConfirm(null)}>
              <h2 className="text-2xl font-bold mb-4 text-white">Confirm Deletion</h2>
              <p className="text-gray-400 mb-6">Are you sure you want to delete the surgery record for "{showDeleteConfirm.patientName}"? This action cannot be undone.</p>
               <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                  <button type="button" onClick={() => handleDeleteSurgery(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
              </div>
          </Modal>
      )}
    </div>
  );
}
