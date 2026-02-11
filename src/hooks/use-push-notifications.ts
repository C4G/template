'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const { data: session } = useSession();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // Check if push notifications are supported and get current subscription status
  useEffect(() => {
    const checkSupport = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          error: 'Push notifications are not supported in this browser',
        }));
        return;
      }

      setState((prev) => ({ ...prev, isSupported: true }));

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState((prev) => ({
          ...prev,
          isSubscribed: !!subscription,
        }));
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to check subscription status',
        }));
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setState((prev) => ({
        ...prev,
        error: 'This browser does not support notifications',
      }));
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async (): Promise<boolean> => {
    if (!session?.user) {
      setState((prev) => ({
        ...prev,
        error: 'You must be logged in to subscribe to notifications',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Notification permission denied',
        }));
        return false;
      }

      // Get VAPID public key
      const response = await fetch('/api/notifications/subscribe');
      const { publicKey } = await response.json();

      // Register service worker and get subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to subscribe to notifications');
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to subscribe to notifications',
      }));
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from notifications');
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to unsubscribe from notifications',
      }));
      return false;
    }
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
