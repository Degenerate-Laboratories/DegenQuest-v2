// Type definitions for the game

// Declare custom event types
interface LoadingUpdateEvent extends CustomEvent {
  detail: {
    message: string;
    progress?: number;
  };
}

// Declare global window interface extensions
declare global {
  interface WindowEventMap {
    'loading-update': LoadingUpdateEvent;
  }
}

// Allow importing non-TS files
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module '*.glb';
declare module '*.gltf';
declare module '*.mp3';
declare module '*.wav';
declare module '*.ogg'; 