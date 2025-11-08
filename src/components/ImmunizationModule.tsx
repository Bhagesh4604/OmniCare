import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Syringe, Calendar, User, X } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

import apiUrl from '@/config/api';

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

export default function ImmunizationModule() {
    const { theme } = useTheme();
    const [immunizations, setImmunizations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(null); // 'add', 'edit', 'delete'
    const [selectedImmunization, setSelectedImmunization] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const [newImmunization, setNewImmunization] = useState({
        patientId: '', vaccineName: '', vaccinationDate: '', doseNumber: 1, administeredByDoctorId: '', notes: '', nextDueDate: ''
    });

    useEffect(() => {
        fetchImmunizations();
        fetchPatients();
        fetchDoctors();
    }, []);

    const fetchImmunizations = async () => {
        try {
            const response = await fetch(apiUrl('/api/immunizations')); // Use the new GET / endpoint
            const data = await response.json();
            setImmunizations(Array.isArray(data) ? data : []);
        } catch (error) { console.error('Failed to fetch immunizations:', error); }
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch(apiUrl('/api/patients'));
            setPatients(await response.json() || []);
        } catch (error) { console.error('Failed to fetch patients:', error); }
    };

    const fetchDoctors = async () => {
        try {
            const response = await fetch(apiUrl('/api/employees'));
            const allEmployees = await response.json();
            setDoctors(allEmployees.filter(emp => emp.role === 'doctor') || []);
        } catch (error) { console.error('Failed to fetch doctors:', error); }
    };

    const handleInputChange = (e, formType) => {
        const { name, value } = e.target;
        if (formType === 'new') {
            setNewImmunization(prev => ({ ...prev, [name]: value }));
        } else if (selectedImmunization) {
            setSelectedImmunization(prev => (prev ? { ...prev, [name]: value } : null));
        }
    };

    const handleAddImmunization = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(apiUrl('/api/immunizations/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newImmunization),
            });
            const data = await response.json();
            if (data.success) {
                setModal(null);
                fetchImmunizations();
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to the server.'); }
    };

    const handleUpdateImmunization = async (e) => {
        e.preventDefault();
        if (!selectedImmunization) return;
        try {
            const response = await fetch(apiUrl(`/api/immunizations/${selectedImmunization.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedImmunization),
            });
            const data = await response.json();
            if (data.success) {
                setModal(null);
                fetchImmunizations();
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to server.'); }
    };

    const handleDeleteImmunization = async (id) => {
        try {
            const response = await fetch(apiUrl(`/api/immunizations/${id}`), { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                fetchImmunizations();
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to server.'); }
        setShowDeleteConfirm(null);
    };

    const openModal = (type, immunization = null) => {
        setModal(type);
        if (immunization) setSelectedImmunization(JSON.parse(JSON.stringify(immunization)));
        if (type === 'add') {
            setNewImmunization({ patientId: '', vaccineName: '', vaccinationDate: '', doseNumber: 1, administeredByDoctorId: '', notes: '', nextDueDate: '' });
        }
    };

    const filteredImmunizations = useMemo(() =>
        immunizations.filter(imm =>
            Object.values(imm).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        ),
        [immunizations, searchTerm]
    );

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Immunization Tracking</h1>
                        <p className="text-gray-400 mt-2">Manage patient vaccination records.</p>
                    </div>
                    <button onClick={() => openModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                        <Plus size={20} />
                        <span>Add Immunization</span>
                    </button>
                </div>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}><StatCard title="Total Records" value={immunizations.length} icon={Syringe} color="text-blue-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Upcoming Doses" value={immunizations.filter(imm => imm.nextDueDate && new Date(imm.nextDueDate) > new Date()).length} icon={Calendar} color="text-yellow-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Patients Vaccinated" value={new Set(immunizations.map(imm => imm.patientId)).size} icon={User} color="text-green-400"/></motion.div>
            </motion.div>

            <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input type="text" placeholder="Search by vaccine, patient, or doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Patient</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Vaccine</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Date</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Dose</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-400">Administered By</th>
                                <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                            {filteredImmunizations.map(imm => (
                                <motion.tr key={imm.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-semibold">{imm.patientName}</td>
                                    <td className="p-4">{imm.vaccineName}</td>
                                    <td className="p-4 text-sm text-gray-400">{new Date(imm.vaccinationDate).toLocaleDateString()}</td>
                                    <td className="p-4">{imm.doseNumber}</td>
                                    <td className="p-4 text-sm text-gray-400">{imm.administeredByDoctorName || 'N/A'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => openModal('edit', imm)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit2 size={18}/></button>
                                            <button onClick={() => setShowDeleteConfirm(imm)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                    {filteredImmunizations.length === 0 && <p className="text-center py-12 text-gray-500">No immunization records found.</p>}
                </div>
            </div>

            {modal && (
                <Modal onClose={() => setModal(null)}>
                    {modal === 'add' && (
                        <form onSubmit={handleAddImmunization}>
                            <h2 className="text-2xl font-bold mb-6">Add New Immunization</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <select name="patientId" onChange={(e) => handleInputChange(e, 'new')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required>
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                </select>
                                <input name="vaccineName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Vaccine Name" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="date" name="vaccinationDate" onChange={(e) => handleInputChange(e, 'new')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="number" name="doseNumber" onChange={(e) => handleInputChange(e, 'new')} placeholder="Dose Number" defaultValue={1} className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                                <select name="administeredByDoctorId" onChange={(e) => handleInputChange(e, 'new')} className="p-3 bg-gray-800 border-gray-700 rounded-lg">
                                    <option value="">Administered By (Doctor)</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                                </select>
                                <input type="date" name="nextDueDate" onChange={(e) => handleInputChange(e, 'new')} placeholder="Next Due Date (Optional)" className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                                <textarea name="notes" onChange={(e) => handleInputChange(e, 'new')} placeholder="Notes (Optional)" className="p-3 bg-gray-800 border-gray-700 rounded-lg" rows={3}></textarea>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                                <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add Record</button>
                            </div>
                        </form>
                    )}
                    {modal === 'edit' && selectedImmunization && (
                        <form onSubmit={handleUpdateImmunization}>
                            <h2 className="text-2xl font-bold mb-6">Edit Immunization Record</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <select name="patientId" value={selectedImmunization.patientId} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                </select>
                                <input name="vaccineName" value={selectedImmunization.vaccineName} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Vaccine Name" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="date" name="vaccinationDate" value={selectedImmunization.vaccinationDate.split('T')[0]} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="number" name="doseNumber" value={selectedImmunization.doseNumber} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Dose Number" className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                                <select name="administeredByDoctorId" value={selectedImmunization.administeredByDoctorId || ''} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg">
                                    <option value="">Administered By (Doctor)</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                                </select>
                                <input type="date" name="nextDueDate" value={selectedImmunization.nextDueDate ? selectedImmunization.nextDueDate.split('T')[0] : ''} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Next Due Date (Optional)" className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                                <textarea name="notes" value={selectedImmunization.notes || ''} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Notes (Optional)" className="p-3 bg-gray-800 border-gray-700 rounded-lg" rows={3}></textarea>
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
                    <p className="text-gray-400 mb-6">Are you sure you want to delete the immunization record for "{selectedImmunization?.patientName}" ({selectedImmunization?.vaccineName})?</p>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={() => handleDeleteImmunization(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
