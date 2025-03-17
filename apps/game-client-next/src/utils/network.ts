import { Client } from 'colyseus.js';

// Initialize the Colyseus client
export const createClient = () => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3000';
  return new Client(socketUrl);
};

// Connect to a specific room
export const connectToRoom = async (
  client: Client,
  roomName: string,
  options = {}
) => {
  try {
    const room = await client.joinOrCreate(roomName, options);
    console.log(`Successfully connected to room ${roomName}`);
    return room;
  } catch (error) {
    console.error(`Failed to connect to room ${roomName}:`, error);
    throw error;
  }
};

// Helper to parse query parameters
export const parseQueryString = () => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}; 