import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast'; // Assuming we have toast, if not we'll use console/alert logic replacement

interface SyncItem {
    id: string;
    endpoint: string;
    method: string;
    body: any;
    timestamp: number;
    retryCount: number;
}

export default function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Load queue from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('ems_offline_queue');
        if (stored) {
            try {
                setSyncQueue(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse offline queue", e);
            }
        }
    }, []);

    // Update localStorage whenever queue changes
    useEffect(() => {
        localStorage.setItem('ems_offline_queue', JSON.stringify(syncQueue));
    }, [syncQueue]);

    // Network Listeners
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success("Back Online! Syncing data...");
            processQueue();
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error("You are Offline. Data will be saved locally.");
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncQueue]); // Re-bind processQueue with latest state? better to use ref or functional update

    // Process the Queue
    const processQueue = useCallback(async () => {
        if (syncQueue.length === 0) return;
        setIsSyncing(true);

        const remainingItems: SyncItem[] = [];

        for (const item of syncQueue) {
            try {
                console.log(`Syncing item: ${item.id}`);
                const res = await fetch(item.endpoint, {
                    method: item.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.body)
                });

                if (res.ok) {
                    toast.success("Synced offline record", { icon: '☁️' });
                } else {
                    // If server error (500), keep in queue? Or discard?
                    console.warn(`Sync failed for ${item.id}: ${res.status}`);
                    if (res.status >= 500) {
                        remainingItems.push({ ...item, retryCount: item.retryCount + 1 });
                    }
                }
            } catch (error) {
                console.error(`Network error syncing ${item.id}`, error);
                remainingItems.push(item); // Keep in queue
            }
        }

        setSyncQueue(remainingItems);
        setIsSyncing(false);
    }, [syncQueue]);

    // Add to Queue (Main Function exposed to components)
    const addToQueue = (endpoint: string, body: any, method = 'POST') => {
        const newItem: SyncItem = {
            id: Date.now().toString(),
            endpoint,
            method,
            body,
            timestamp: Date.now(),
            retryCount: 0
        };

        setSyncQueue(prev => [...prev, newItem]);
        toast("Saved to Offline Outbox", { icon: '📁' });
    };

    return { isOnline, addToQueue, syncQueue, isSyncing, processQueue };
}
