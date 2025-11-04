import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiUrl from '@/config/api';
import { Pill, Check, X, Clock, Sun, Sunset, Moon } from 'lucide-react';

const MedicationCard = ({ item, onTrack }) => {
    const isActionable = item.status === 'scheduled';
    const isTaken = item.status === 'taken';
    const isSkipped = item.status === 'skipped';

    const time = new Date(item.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`p-4 rounded-2xl border ${isTaken ? 'bg-green-500/10 border-green-500/20' : isSkipped ? 'bg-red-500/10 border-red-500/20' : 'bg-card border-border'}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-bold text-lg text-foreground">{item.medication}</p>
                    <p className="text-sm text-muted-foreground">{item.dosage}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${isTaken ? 'text-green-400' : isSkipped ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {isTaken ? <Check size={16} /> : isSkipped ? <X size={16} /> : <Clock size={16} />}
                    {time}
                </div>
            </div>
            
            {isActionable && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                        onClick={() => onTrack(item, 'skipped')} 
                        className="w-full py-2.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <X size={16} /> Skip
                    </button>
                    <button 
                        onClick={() => onTrack(item, 'taken')} 
                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    >
                        <Check size={16} /> Take
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default function MedicationTracker({ patient }) {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMedications = async () => {
        if (!patient?.id) return;
        try {
            setLoading(true);
            const response = await fetch(apiUrl(`/api/medications/${patient.id}`));
            if (!response.ok) throw new Error('Failed to fetch medication schedule.');
            const data = await response.json();
            if (data.success) {
                setMedications(data.medications);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, [patient]);

    const handleTrack = async (item, status) => {
        // Optimistic UI update
        const originalMeds = [...medications];
        const updatedMeds = medications.map(med => 
            med.prescriptionId === item.prescriptionId && med.time === item.time 
            ? { ...med, status } 
            : med
        );
        setMedications(updatedMeds);

        try {
            const response = await fetch(apiUrl('/api/medications/track'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: patient.id,
                    prescriptionId: item.prescriptionId,
                    doseTime: item.time,
                    status: status
                })
            });
            if (!response.ok) throw new Error('Failed to save tracking data.');
            // No need to re-fetch, optimistic update is enough
        } catch (err) {
            setError('Could not save progress. Please try again.');
            // Revert UI on error
            setMedications(originalMeds);
        }
    };

    const groupedMeds = useMemo(() => {
        const groups = {
            morning: [],
            afternoon: [],
            evening: [],
        };
        medications.forEach(med => {
            const hour = new Date(med.time).getHours();
            if (hour < 12) groups.morning.push(med);
            else if (hour < 18) groups.afternoon.push(med);
            else groups.evening.push(med);
        });
        return groups;
    }, [medications]);

    const MedicationGroup = ({ title, items, icon: Icon }) => (
        items.length > 0 && (
            <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                    <Icon size={20} className="text-muted-foreground" />
                    {title}
                </h2>
                <div className="space-y-4">
                    <AnimatePresence>
                        {items.map(item => <MedicationCard key={`${item.prescriptionId}-${item.time}`} item={item} onTrack={handleTrack} />)}
                    </AnimatePresence>
                </div>
            </section>
        )
    );

    if (loading) return <div className="p-8 text-center">Loading medication schedule...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Medications</h1>
            <p className="text-muted-foreground mb-8">Log the medications you've taken today, {new Date().toLocaleDateString('en-US', { weekday: 'long' })}.</p>
            
            <div className="space-y-8">
                {medications.length > 0 ? (
                    <>
                        <MedicationGroup title="Morning" items={groupedMeds.morning} icon={Sun} />
                        <MedicationGroup title="Afternoon" items={groupedMeds.afternoon} icon={Sunset} />
                        <MedicationGroup title="Evening" items={groupedMeds.evening} icon={Moon} />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <Pill size={40} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold text-foreground">No Medications Scheduled</h3>
                        <p className="text-muted-foreground">You have no active prescriptions for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
