'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function ServiceWorkerRegistration() {
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Force update the service worker if there's a new version
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    toast({
                      title: 'Update Available',
                      description: 'A new version of the app is available.',
                      action: (
                        <ToastAction
                          altText='Update now'
                          onClick={() => {
                            window.location.reload();
                          }}
                        >
                          Update
                        </ToastAction>
                      ),
                      duration: Infinity,
                    });
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.open(cacheName).then((cache) => {
              cache.keys().then((requests) => {
                requests.forEach((request) => {
                  if (
                    request.url.includes('/api/auth') ||
                    request.url.includes('signin') ||
                    request.url.includes('signout')
                  ) {
                    cache.delete(request);
                  }
                });
              });
            });
          });
        });
      }
    }
  }, []);

  return null;
}
