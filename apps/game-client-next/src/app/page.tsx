'use client';

import { useEffect, useRef } from 'react';
import GameCanvas from '@/components/GameCanvas';
import LoadingScreen from '@/components/LoadingScreen';

export default function HomePage() {
  const gameInitialized = useRef(false);

  useEffect(() => {
    // Register service worker if needed
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/cors-worker.js').then(registration => {
          console.log('CORS Service Worker registered with scope:', registration.scope);
        }).catch(error => {
          console.error('CORS Service Worker registration failed:', error);
        });
      });
    }
  }, []);

  return (
    <main className="disable-selection">
      <LoadingScreen />
      <GameCanvas />
    </main>
  );
} 