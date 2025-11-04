import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import apiUrl from '../config/api';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSchedule = daysOfWeek.map((day, index) => ({
    dayOfWeek: index,
    dayName: day,
    isWorkDay: false,
    startTime: '09:00',
    endTime: '17:00',
}));

export default function DoctorScheduleModule({ user }) {
    const { theme } = useTheme();
    const [schedule, setSchedule] = useState(defaultSchedule);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            fetchSchedule();
        }
    }, [user]);

    const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(apiUrl(`/api/schedules/${user.id}`));
            const data = await response.json();
            const formattedSchedule = daysOfWeek.map((day, index) => {
                const existing = data.find(d => d.dayOfWeek === index);
                return {
                    dayOfWeek: index,
                    dayName: day,
                    isWorkDay: !!existing,
                    startTime: existing ? existing.startTime.substring(0, 5) : '09:00',
                    endTime: existing ? existing.endTime.substring(0, 5) : '17:00',
                };
            });
            setSchedule(formattedSchedule);
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        const payload = schedule.filter(s => s.isWorkDay).map(s => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
        }));

        try {
            const response = await fetch(apiUrl('/api/schedules'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: user.id, schedules: payload }),
            });
            const data = await response.json();
            if (data.success) {
                alert('Schedule saved successfully!');
            } else {
                alert('Failed to save schedule.');
            }
        } catch (error) {
            console.error("Failed to save schedule:", error);
            alert('Error saving schedule.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">My Schedule</h1>
                        <p className="text-gray-400 mt-2">Set your weekly availability for patient appointments.</p>
                    </div>
                    <button onClick={handleSaveChanges} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 disabled:bg-gray-500">
                        <Save size={20} />
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </motion.div>

            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#1C1C1E] border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="space-y-4">
                    {schedule.map((day, index) => (
                        <motion.div 
                            key={day.dayOfWeek} 
                            className={`p-4 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center gap-4">
                                <input 
                                    type="checkbox" 
                                    checked={day.isWorkDay}
                                    onChange={(e) => handleScheduleChange(index, 'isWorkDay', e.target.checked)}
                                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="w-28 font-semibold">{day.dayName}</span>
                            </div>
                            <div className={`flex items-center gap-4 ${!day.isWorkDay ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-400">From</label>
                                    <input 
                                        type="time" 
                                        value={day.startTime} 
                                        disabled={!day.isWorkDay}
                                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                        className={`p-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-400">To</label>
                                    <input 
                                        type="time" 
                                        value={day.endTime} 
                                        disabled={!day.isWorkDay}
                                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                        className={`p-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
