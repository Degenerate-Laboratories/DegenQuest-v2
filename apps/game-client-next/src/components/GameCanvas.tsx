'use client';

import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameInitializedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || gameInitializedRef.current) return;
    gameInitializedRef.current = true;

    const initGame = async () => {
      try {
        // Dynamically import the game engine
        const { initializeGame } = await import('@/game/engine');
        const canvas = canvasRef.current;
        
        if (canvas) {
          // Initialize the game with the canvas
          initializeGame(canvas);
          
          // Hide loading screen once game is initialized
          const loadingScreen = document.getElementById('loadingScreen');
          if (loadingScreen) {
            loadingScreen.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    // Load the pep.js library first
    const pepScript = document.createElement('script');
    pepScript.src = '/lib/pep.js';
    pepScript.onload = () => {
      // Initialize the game after pep.js loads
      initGame();
    };
    pepScript.onerror = (error) => {
      console.error('Failed to load pep.js:', error);
    };
    document.body.appendChild(pepScript);

    return () => {
      // Cleanup function if component is unmounted
      document.body.removeChild(pepScript);
    };
  }, []);

  return <canvas ref={canvasRef} id="renderCanvas" />;
} 