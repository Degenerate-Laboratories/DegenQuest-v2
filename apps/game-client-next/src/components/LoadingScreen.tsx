'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [loadingText, setLoadingText] = useState('.');
  const [loadingDetails, setLoadingDetails] = useState('');

  useEffect(() => {
    // Simulate loading with animated dots
    const timer = setInterval(() => {
      setLoadingText((prev) => {
        if (prev.length < 3) return prev + '.';
        return '.';
      });
    }, 400);

    // Handle any global loading events
    const handleLoadingUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.message) {
        setLoadingDetails(e.detail.message);
      }
    };

    window.addEventListener('loading-update' as any, handleLoadingUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('loading-update' as any, handleLoadingUpdate);
    };
  }, []);

  return (
    <div id="loadingScreen">
      <div className="vertical-center">
        <br />
        <div id="loadingText">{loadingText}</div>
        <div id="loadingTextDetails">{loadingDetails}</div>
      </div>
    </div>
  );
} 