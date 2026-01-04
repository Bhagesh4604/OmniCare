
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function useMedicationReminders(medications: any[]) {
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
    const [remindersEnabled, setRemindersEnabled] = useState(false);

    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem('med_reminders_enabled');
        if (stored === 'true') {
            setRemindersEnabled(true);
        }
    }, []);

    // Permission Handler
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            toast.error("This browser does not support notifications.");
            return false;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            setRemindersEnabled(true);
            localStorage.setItem('med_reminders_enabled', 'true');
            toast.success("Medication Reminders Enabled");
            new Notification("Test Reminder", { body: "You will be notified when it's time for your meds." });
            return true;
        } else {
            setRemindersEnabled(false);
            localStorage.setItem('med_reminders_enabled', 'false');
            toast.error("Permission Denied. Cannot send reminders.");
            return false;
        }
    }, []);

    const toggleReminders = () => {
        if (remindersEnabled) {
            setRemindersEnabled(false);
            localStorage.setItem('med_reminders_enabled', 'false');
            toast("Reminders Paused");
        } else {
            if (permission === 'granted') {
                setRemindersEnabled(true);
                localStorage.setItem('med_reminders_enabled', 'true');
                toast.success("Reminders Resumed");
            } else {
                requestPermission();
            }
        }
    };

    // Check Logic
    useEffect(() => {
        if (!remindersEnabled || permission !== 'granted' || !medications.length) return;

        const checkInterval = setInterval(() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            medications.forEach(med => {
                if (med.status !== 'taken' && med.status !== 'skipped') {
                    const medTime = new Date(med.time);
                    if (medTime.getHours() === currentHour && medTime.getMinutes() === currentMinute) {
                        // Prevent duplicate alert for the same minute
                        const lastAlertKey = `last_alert_${med.prescriptionId}_${med.time}`;
                        const lastAlert = sessionStorage.getItem(lastAlertKey);

                        // Only alert if we haven't alerted in the last 60 seconds
                        if (!lastAlert || (Date.now() - parseInt(lastAlert)) > 60000) {
                            new Notification(`Time for ${med.medication}`, {
                                body: `${med.dosage} - ${med.instructions || 'Take with water'}`,
                                icon: '/pills-icon.png' // Optional fallback
                            });
                            sessionStorage.setItem(lastAlertKey, Date.now().toString());
                            toast(`Time to take ${med.medication}!`, { icon: '💊' });
                        }
                    }
                }
            });
        }, 1000 * 30); // Check every 30 seconds

        return () => clearInterval(checkInterval);
    }, [medications, remindersEnabled, permission]);

    return { permission, remindersEnabled, requestPermission, toggleReminders };
}
