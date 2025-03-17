// colyseus
import { Client, Room } from "colyseus.js";
import { isLocal } from "../Utils";
import { ServerMsg } from "../../shared/types";

export class Network {
    public _client: Client;
    public connectionSuccessful: boolean = false;
    public serverUrl: string = "";
    public httpUrl: string = "";

    constructor(port = 3000) {
        try {
            // Use appropriate WebSocket URL based on environment
            let url;
            let httpBase;
            
            if (isLocal()) {
                url = "ws://localhost:" + port;
                httpBase = "http://localhost:" + port;
            } else {
                // Use port 80 for the production server (standard HTTP port)
                // Using the new service IP with session affinity
                url = "ws://134.199.184.144:80";
                httpBase = "http://134.199.184.144:80";
            }
            
            this.serverUrl = url;
            this.httpUrl = httpBase;
            
            console.log("%c[Network] Connecting to game server: " + url, "color: green; font-weight: bold");
            console.log("%c[Network] HTTP endpoint: " + httpBase, "color: green; font-weight: bold");
            
            // Configure client with both endpoints
            this._client = new Client(url);
            
            // Enable debug logging
            console.log("%c[Network] Client created with debug enabled", "color: blue");
            console.log("%c[Network] Matchmaking endpoint is /matchmake", "color: blue");
            
            // Display connection info in game
            this.displayConnectionInfo(url);
            
            // Test the connection by creating an actual game room
            this.createTestRoom();
        } catch (error) {
            console.error("%c[Network] Failed to initialize client:", "color: red; font-weight: bold", error);
        }
    }

    private displayConnectionInfo(url: string) {
        // Create debug overlay element
        const debugInfo = document.createElement('div');
        debugInfo.style.position = 'fixed';
        debugInfo.style.bottom = '10px';
        debugInfo.style.left = '10px';
        debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugInfo.style.color = '#00ff00';
        debugInfo.style.padding = '5px 10px';
        debugInfo.style.fontFamily = 'monospace';
        debugInfo.style.fontSize = '12px';
        debugInfo.style.zIndex = '9999';
        debugInfo.textContent = `Server: ${url}`;
        
        // Add to document when DOM is loaded
        if (document.body) {
            document.body.appendChild(debugInfo);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(debugInfo);
            });
        }
    }
    
    private async createTestRoom() {
        try {
            // Get available rooms to verify connection
            console.log("%c[Network] Testing connection by creating a test room...", "color: yellow; font-weight: bold");
            
            // Create a test token and character ID
            const testToken = "test_token_" + Date.now();
            const testCharacterId = 1; // Use character ID 1 for testing
            
            // Use a valid location name and include required parameters
            const room = await this._client.create("game_room", { 
                location: "lh_town", // Valid location with existing navmesh file
                token: testToken,
                character_id: testCharacterId
            });
            
            console.log("%c[Network] TEST SUCCESSFUL! Room created with ID:", "color: green; font-weight: bold", room.id);
            console.log("%c[Network] Connection to game server is FULLY OPERATIONAL!", "color: green; font-weight: bold");
            
            // Clean up by leaving the test room
            room.leave();
            this.connectionSuccessful = true;
        } catch (error) {
            console.error("%c[Network] Room creation test failed:", "color: red; font-weight: bold", error);
            console.error("%c[Network] Error details:", "color: red", error);
        }
    }

    public async joinRoom(roomId, token, character_id): Promise<any> {
        try {
            console.log(`%c[Network] Attempting to join room: ${roomId}`, "color: yellow");
            const room = await this._client.joinById(roomId, {
                token: token,
                character_id: character_id,
            });
            console.log(`%c[Network] Successfully joined room: ${roomId}`, "color: green");
            return room;
        } catch (error) {
            console.error(`%c[Network] Failed to join room: ${roomId}`, "color: red", error);
            throw error;
        }
    }

    public async joinChatRoom(data): Promise<any> {
        return await this._client.joinOrCreate("chat_room", data);
    }

    public async findCurrentRoom(currentRoomKey): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            let rooms = await this._client.getAvailableRooms("game_room");
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

    public async joinOrCreateRoom(location, token, character_id): Promise<any> {
        // find all exisiting rooms
        let rooms = await this._client.getAvailableRooms("game_room");

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
                return await this.joinRoom(roomIdFound, token, character_id);
            }
        }

        // else create a new room for that location
        return await this._client.create("game_room", {
            location: location,
            token: token,
            character_id: character_id,
        });
    }
}
