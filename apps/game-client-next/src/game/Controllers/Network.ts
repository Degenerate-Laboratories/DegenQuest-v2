// colyseus
import { Client, Room } from "colyseus.js";
import { isLocal, wsUrl, apiUrl, getServerUrl } from "../Utils";
import { ServerMsg } from "../shared/types";

export class Network {
    private client: Client | null = null;
    private serverUrl: string;
    
    constructor() {
        // Determine if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        
        if (isBrowser) {
            // Use the remote game server IP and port 3000
            const serverIP = '3.86.176.221';
            const serverPort = 80; // Game server runs on port 3000
            const protocol = 'ws'; // Use 'wss' for secure connections if needed
            
            // Connect to the remote server IP
            this.serverUrl = `${protocol}://${serverIP}:${serverPort}`;
            
            // Create Colyseus client
            this.client = new Client(this.serverUrl);
            console.log(`Network initialized with remote server URL: ${this.serverUrl}`);
        } else {
            // Server-side rendering - no actual connection
            this.serverUrl = `ws://localhost:3000`;
            console.log('Network initialized in SSR mode (no connection)');
        }
    }
    
    /**
     * Join a room by name
     */
    public async joinRoom(roomName: string, options: any = {}): Promise<Room | null> {
        if (!this.client) {
            console.error('Cannot join room: Client not initialized');
            return null;
        }
        
        try {
            console.log(`Joining room: ${roomName}`);
            const room = await this.client.joinOrCreate(roomName, options);
            console.log(`Joined room: ${roomName}`);
            return room;
        } catch (error) {
            console.error(`Failed to join room ${roomName}:`, error);
            return null;
        }
    }
    
    /**
     * Leave a room
     */
    public leaveRoom(room: Room): void {
        if (room) {
            console.log(`Leaving room: ${room.name}`);
            room.leave();
        }
    }
    
    /**
     * Get available rooms
     */
    public async getAvailableRooms(roomName: string): Promise<any[]> {
        if (!this.client) {
            console.error('Cannot get available rooms: Client not initialized');
            return [];
        }
        
        try {
            console.log(`Getting available rooms for: ${roomName}`);
            const rooms = await this.client.getAvailableRooms(roomName);
            console.log(`Found ${rooms.length} available rooms`);
            return rooms;
        } catch (error) {
            console.error(`Failed to get available rooms for ${roomName}:`, error);
            return [];
        }
    }
    
    /**
     * Get the client instance
     */
    public getClient(): Client | null {
        return this.client;
    }
    
    /**
     * Get the server URL
     */
    public getServerUrl(): string {
        return this.serverUrl;
    }

    // Create a mock room for testing
    async createTestRoom(): Promise<Room | null> {
        try {
            console.log("[Network] Creating test room...");
            return null;
        } catch (error) {
            console.error("[Network] Error creating test room:", error);
            return null;
        }
    }

    // Display connection info in the console
    displayConnectionInfo(url: string): void {
        console.log(`[Network] Connection info: ${url}`);
    }

    public async joinChatRoom(data: Record<string, any>): Promise<any> {
        // Add retry logic for joining chat room
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const chatRoom = await this.client?.joinOrCreate("chat_room", data);
                return chatRoom;
            } catch (error: unknown) {
                const err = error as Error;
                if (err.message && err.message.includes("seat reservation expired") && attempt < 2) {
                    console.warn(`%c[Network] Chat room seat reservation expired, retrying (${attempt + 1}/3)...`, "color: orange");
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
                    continue;
                }
                throw error;
            }
        }
    }

    public async findCurrentRoom(currentRoomKey: string): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            const rooms = await this.client?.getAvailableRooms("game_room") || [];
            if (rooms.length > 0) {
                rooms.forEach((room) => {
                    if (room.metadata.location === currentRoomKey) {
                        resolve(room);
                    }
                });
            }
            resolve(false);
        });
    }

    public async joinOrCreateRoom(location: string, token: string, character_id: number): Promise<any> {
        // Add retry logic for joining or creating rooms
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                // find all exisiting rooms
                const rooms = await this.client?.getAvailableRooms("game_room") || [];

                // rooms exists
                if (rooms.length > 0) {
                    // do we already have a room for the specified location
                    let roomIdFound: boolean | string = false;
                    rooms.forEach((room) => {
                        if (room.metadata.location === location) {
                            roomIdFound = room.roomId;
                        }
                    });

                    // if so, let's join it
                    if (roomIdFound !== false) {
                        return await this.joinRoom(roomIdFound, {
                            token: token,
                            character_id: character_id,
                        });
                    }
                }

                // else create a new room for that location
                const newRoom = await this.client?.create("game_room", {
                    location: location,
                    token: token,
                    character_id: character_id,
                });
                return newRoom;
            } catch (error: unknown) {
                const err = error as Error;
                if (err.message && err.message.includes("seat reservation expired") && attempt < 2) {
                    console.warn(`%c[Network] Join/Create room seat reservation expired, retrying (${attempt + 1}/3)...`, "color: orange");
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
                    continue;
                }
                throw error;
            }
        }
    }
}
