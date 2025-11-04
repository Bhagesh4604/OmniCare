
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiUrl from '@/config/api';
import {
  Calendar, 
  Stethoscope, 
  FileText, 
  Pill, 
  Activity, 
  Scissors, 
  DollarSign, 
  Bed
} from 'lucide-react';

const eventIcons = {
  appointment: Calendar,
  medical_record: Stethoscope,
  lab_test: Activity,
  prescription: Pill,
  surgery: Scissors,
  bill: DollarSign,
  admission: Bed,
  default: FileText
};

const TimelineItem = ({ item, isLast }) => {
  const Icon = eventIcons[item.type] || eventIcons.default;
  const date = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      className="relative pl-8 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isLast && <div className="absolute left-[1.1rem] top-5 h-full w-0.5 bg-border" />} 
      <div className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 bg-card border rounded-full">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="ml-4">
        <p className="font-semibold text-foreground">{date}</p>
        <div className="mt-2 p-4 bg-card border rounded-lg shadow-sm">
          <h4 className="font-bold capitalize text-lg text-foreground">{item.type.replace('_', ' ')}</h4>
          <div className="mt-2 text-sm text-muted-foreground">
            {Object.entries(item.details).map(([key, value]) => {
              if (key === 'date') return null;
              return (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span>{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HealthTimeline({ patient }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patient?.patientId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl(`/api/patients/${patient.patientId}/full-history`));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Sort descending by date
        const sortedHistory = data.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(sortedHistory);
      } catch (e) {
        setError('Failed to connect to the server or retrieve history.');
        console.error("Error fetching patient history:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patient]);

  if (loading) {
    return <div className="p-8 text-center">Loading health timeline...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Medical History for {patient.firstName} {patient.lastName}</h1>
      <div className="relative">
        {history.length > 0 ? (
          history.map((item, index) => (
            <TimelineItem key={index} item={item} isLast={index === history.length - 1} />
          ))
        ) : (
          <p className="text-center text-muted-foreground">No medical history found.</p>
        )}
      </div>
    </div>
  );
}
