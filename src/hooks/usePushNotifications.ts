import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import apiUrl from '@/config/api';

interface PushNotificationHook {
  token: string | null;
  notifications: any[];
  error: string | null;
}

const usePushNotifications = (employeeId: string | null): PushNotificationHook => {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      console.log("Push notifications are only available on native devices.");
      return;
    }

    if (!employeeId) {
      setError("Employee ID is required for push notification registration.");
      return;
    }

    const register = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          setError('Push notification permission not granted.');
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener('registration', async (tokenResult) => {
          setToken(tokenResult.value);
          setError(null);
          console.log('Push registration success, token:', tokenResult.value);

          // Send token to your backend
          try {
            const response = await fetch(apiUrl('/api/ems/paramedic/register-device'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId, deviceToken: tokenResult.value }),
            });
            const data = await response.json();
            if (!data.success) {
              console.error('Failed to send device token to backend:', data.message);
              setError('Failed to register device token with backend.');
            } else {
              console.log('Device token sent to backend successfully.');
            }
          } catch (backendError) {
            console.error('Error sending device token to backend:', backendError);
            setError('Network error while sending device token to backend.');
          }
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration:', JSON.stringify(error));
          setError('Error registering for push notifications: ' + error.message);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received:', JSON.stringify(notification));
          setNotifications((prev) => [...prev, notification]);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed:', JSON.stringify(notification));
          setNotifications((prev) => [...prev, notification]);
        });
      } catch (e: any) {
        console.error('Error setting up push notifications:', e);
        setError('Error setting up push notifications: ' + e.message);
      }
    };

    register();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [employeeId]);

  return { token, notifications, error };
};

export default usePushNotifications;
