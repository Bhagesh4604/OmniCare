import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { BedDouble, UserPlus, X, Wind } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import apiUrl from '@/config/api';
const wsUrl = import.meta.env.VITE_API_BASE ? new URL(import.meta.env.VITE_API_BASE).hostname : 'localhost:8080';

// Modal Component
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
                className={`bg-[#1C1C1E] rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl text-white`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const DraggablePatient = ({ patient, index }) => (
    <Draggable draggableId={`patient-${patient.id}`} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`p-3 rounded-lg bg-gray-800 border border-gray-700 flex items-center gap-3 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
                <UserPlus size={18} className="text-blue-400"/>
                <span className="font-medium text-sm">{patient.firstName} {patient.lastName}</span>
            </div>
        )}
    </Draggable>
);

const DroppableBed = ({ bed, onBedClick }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'occupied': return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300';
            case 'available': return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300';
            case 'maintenance': return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300';
            case 'cleaning': return 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/50 dark:border-purple-700 dark:text-purple-300';
            case 'reserved': return 'bg-gray-200 border-gray-300 text-gray-800 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400';
            default: return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300';
        }
    };

    return (
        <Droppable droppableId={`bed-${bed.id}`}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={() => onBedClick(bed)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${getStatusStyles(bed.status)} ${snapshot.isDraggingOver ? 'ring-4 ring-blue-500/50 scale-105' : 'hover:shadow-lg hover:scale-105'}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{bed.bedNumber}</span>
                        {bed.status === 'cleaning' ? <Wind size={16} /> : <BedDouble size={16} />}
                    </div>
                    <div className="mt-2 text-xs truncate h-4">
                        {bed.status === 'occupied' ? <span>{bed.firstName} {bed.lastName}</span> : <span className="capitalize font-semibold">{bed.status}</span>}
                    </div>
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default function BedManagement() {
    const { theme } = useTheme();
    const [wards, setWards] = useState([]);
    const [unassignedPatients, setUnassignedPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBed, setSelectedBed] = useState(null);

    const formatFloorNumber = (floor) => {
        if (floor % 100 >= 11 && floor % 100 <= 13) {
            return `${floor}th`;
        }
        switch (floor % 10) {
            case 1: return `${floor}st`;
            case 2: return `${floor}nd`;
            case 3: return `${floor}rd`;
            default: return `${floor}th`;
        }
    };

    const fetchData = async () => {
        try {
            if (wards.length === 0) setLoading(true);
            setError(null);
            const [wardsRes, patientsRes] = await Promise.all([ fetch(apiUrl('/api/beds')), fetch(apiUrl('/api/patients')) ]);
            if (!wardsRes.ok || !patientsRes.ok) throw new Error('Failed to fetch data from server');
            const wardsData = await wardsRes.json();
            const patientsData = await patientsRes.json();
            const assignedPatientIds = new Set();
            if (Array.isArray(wardsData)) {
                wardsData.forEach(ward => ward.beds.forEach(bed => bed.patientId && assignedPatientIds.add(bed.patientId)));
            }
            const unassigned = patientsData.filter(p => !assignedPatientIds.has(p.id) && p.status === 'active');
            setWards(wardsData || []);
            setUnassignedPatients(unassigned || []);
        } catch (error) {
            console.error("Failed to fetch bed management data:", error);
            setError(`Failed to load hospital layout. Details: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => console.log('WebSocket connected');
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'beds-updated') fetchData();
        };
        ws.onclose = () => console.log('WebSocket disconnected');
        ws.onerror = (error) => console.error('WebSocket error:', error);
        return () => ws.close();
    }, []);

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        // Dropped within the same droppable
        if (source.droppableId === destination.droppableId) {
            return;
        }

        // Moving from unassigned to a bed
        if (source.droppableId === 'unassigned-patients' && destination.droppableId.startsWith('bed-')) {
            const patientId = parseInt(result.draggableId.split('-')[1]);
            const bedId = parseInt(destination.droppableId.split('-')[1]);
            handleAssignPatientToBed(patientId, bedId);
        }
    };

    const handleAssignPatientToBed = async (patientId, bedId) => {
        const patientToAssign = unassignedPatients.find(p => p.id === patientId);
        if (!patientToAssign) return;

        const originalWards = JSON.parse(JSON.stringify(wards));
        const originalUnassigned = [...unassignedPatients];

        setUnassignedPatients(unassignedPatients.filter(p => p.id !== patientId));
        setWards(wards.map(w => ({
            ...w,
            beds: w.beds.map(b => b.id === bedId ? { ...b, status: 'occupied', patientId, firstName: patientToAssign.firstName, lastName: patientToAssign.lastName } : b)
        })));

        try {
            const response = await fetch(apiUrl('/api/beds/assign'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, bedId })
            });

            if (!response.ok) {
                throw new Error('Server responded with an error during assignment');
            }

        } catch (error) {
            console.error("Failed to assign bed:", error);
            alert("An error occurred while assigning the bed. Reverting changes.");
            setWards(originalWards);
            setUnassignedPatients(originalUnassigned);
        }
    };

    const handleUnassign = async (bedId) => {
        if (!bedId) return;

        const originalWards = JSON.parse(JSON.stringify(wards));
        const patientToUnassign = wards.flatMap(w => w.beds).find(b => b.id === bedId);

        setWards(wards.map(w => ({ ...w, beds: w.beds.map(b => b.id === bedId ? { ...b, status: 'available', patientId: null, firstName: null, lastName: null } : b) })));
        if (patientToUnassign) {
            setUnassignedPatients([...unassignedPatients, { id: patientToUnassign.patientId, firstName: patientToUnassign.firstName, lastName: patientToUnassign.lastName, status: 'active' }]);
        }

        try {
            const response = await fetch(apiUrl('/api/beds/unassign'), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bedId }) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server responded with an error');
            }
            setSelectedBed(null);
        } catch (error) {
            alert(`Failed to unassign patient: ${error.message}`);
            setWards(originalWards);
            if (patientToUnassign) {
                setUnassignedPatients(unassignedPatients.filter(p => p.id !== patientToUnassign.patientId));
            }
        }
    };

    const handleStatusChange = async (bedId, newStatus) => {
        if (!bedId || !newStatus) return;

        const originalWards = JSON.parse(JSON.stringify(wards));

        setWards(wards.map(w => ({ ...w, beds: w.beds.map(b => b.id === bedId ? { ...b, status: newStatus } : b) })));

        try {
            const response = await fetch(apiUrl('/api/beds/status'), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bedId, newStatus }) });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server responded with an error');
            }
            setSelectedBed(null);
        } catch (error) {
            alert(`Failed to update bed status: ${error.message}`);
            setWards(originalWards);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-4xl font-bold mb-8">Real-Time Bed Management</h1>
                </motion.div>

                {loading ? <div className="text-center py-20">Loading Bed Layout...</div> : error ? <div className="text-center py-20 text-red-500">{error}</div> : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-9 space-y-8">
                            {wards.map(ward => (
                                <div key={ward.id} className="p-6 rounded-2xl shadow-lg border bg-white dark:bg-[#1C1C1E] dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ward.name}</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFloorNumber(ward.floorNumber)} Floor</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-green-500 dark:text-green-400">{ward.beds.filter(b => b.status === 'available').length} / {ward.capacity}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Available Beds</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {ward.beds.map(bed => <DroppableBed key={bed.id} bed={bed} onBedClick={setSelectedBed} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-3">
                            <div className="p-6 rounded-2xl shadow-lg border bg-white dark:bg-[#1C1C1E] dark:border-gray-800 sticky top-8">
                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Unassigned Patients</h3>
                                <Droppable droppableId="unassigned-patients">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`space-y-3 p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                                            {unassignedPatients.length > 0 ? unassignedPatients.map((patient, index) => <DraggablePatient key={patient.id} patient={patient} index={index} />) : <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No patients waiting for a bed.</p>}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    </div>
                )}

                {selectedBed && (
                    <Modal onClose={() => setSelectedBed(null)}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Bed {selectedBed.bedNumber}</h2>
                            <button onClick={() => setSelectedBed(null)} className="p-1 rounded-full hover:bg-gray-700"><X size={20}/></button>
                        </div>
                        {selectedBed.status === 'occupied' && (
                            <div className="mb-4">
                                <p className="text-gray-400">Occupied by:</p>
                                <p className="font-bold text-lg">{selectedBed.firstName} {selectedBed.lastName}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400">Change Status</label>
                                <select 
                                    defaultValue={selectedBed.status}
                                    onChange={(e) => handleStatusChange(selectedBed.id, e.target.value)}
                                    className="w-full p-2 mt-1 bg-gray-800 border-gray-700 rounded-lg"
                                >
                                    <option value="available">Available</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="reserved">Reserved</option>
                                </select>
                            </div>
                            {selectedBed.status === 'occupied' && (
                                <button 
                                    onClick={() => handleUnassign(selectedBed.id)}
                                    className="w-full p-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                >
                                    Unassign Patient
                                </button>
                            )}
                        </div>
                    </Modal>
                )}
            </div>
        </DragDropContext>
    );
}
