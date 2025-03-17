import State from "../Screens/Screens";
// Import axios conditionally to prevent build errors
let axios: any;
if (typeof window !== 'undefined') {
  import('axios').then(module => {
    axios = module.default;
  });
}
import { apiUrl } from "../Utils/index";
import { Network } from "./Network";
import { AssetsController } from "./AssetsController";
import { VatController } from "./VatController";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Room } from "colyseus.js";
import { Config } from "../shared/Config";
import { ServerMsg } from "../shared/types";
import { GameScene } from "../Screens/GameScene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

// Simplified FPS game integrator mock
class GameIntegrator {
  constructor(game: any) {
    console.log('FPS Game Integrator initialized');
  }
  
  initialize() {
    console.log('FPS mode initialized');
  }
  
  dispose() {
    console.log('FPS mode disposed');
  }
}

export class GameController {
    // scene properties
    public scene: Scene | null = null;
    public assets: any = {};
    public engine: Engine;
    public config: Config;
    public characters: any[] = [];
    public currentScene: GameScene | null = null;
    public state: number;
    public nextScene: number;
    public gamescene: GameScene | null = null;
    
    // Asset controllers
    public _assetsCtrl: AssetsController | null = null;
    public _vatController: VatController | null = null;
    
    // player properties
    public username: string = 'Guest';
    public password: string = '';
    public activeCharacter: any = null;
    public _currentCharacter: any = { name: 'Guest', id: 1, location: 'test_location' };
    public character_name: string | null = null;
    public avatarAssetId: string | null = null;
    
    // Network properties
    public client: Network;
    
    // Core app reference
    private _app: any;
    
    // FPS mode
    private _fpsIntegrator: GameIntegrator | null = null;

    // all user data
    public currentSessionID: string = '';
    public currentChat: Room | null = null;
    public currentRoom: Room | null = null;

    // all user data
    public currentLocation: any = { 
        key: 'test_location',
        skyColor: [0.5, 0.6, 0.7, 1],
        sun: true,
        sunIntensity: 0.8,
        fog: false,
        dynamic: {
            spawns: []
        },
        waterPlane: false
    };
    public currentLocationKey: string = 'test_location';
    public _currentUser: any = { token: 'test_token' };
    public deltaCamY: number = 0;
    
    // Store loaded assets
    public _loadedAssets: { [key: string]: any } = {};
    
    constructor(app: any) {
        this._app = app;
        this.engine = app.engine;
        this.config = app.config;
        this.state = State.NULL;
        this.nextScene = State.NULL;
        
        // Create a simplified network client
        this.client = new Network(3000);
        
        // Initialize asset controller with default shadow setting
        this._assetsCtrl = new AssetsController(this);
        
        console.log('GameController initialized for Next.js');
    }
    
    // Initialize asset controller with optional shadow parameter
    public initializeAssetController(shadow?: any): void {
        if (!this._assetsCtrl) {
            this._assetsCtrl = new AssetsController(this, shadow);
        }
    }
    
    // Check if user is logged in
    public isLoggedIn(): boolean {
        return true; // Simplified for mock
    }
    
    // Force login for testing
    public async forceLogin(): Promise<boolean> {
        return Promise.resolve(true);
    }
    
    // Check if login is valid
    public async isValidLogin(): Promise<any> {
        return Promise.resolve(this._currentUser);
    }
    
    // Initialize the game data
    public async initializeGameData(): Promise<void> {
        console.log('Initializing game data for Next.js');
        
        // Create a test character
        this.characters = [{
            id: 1,
            name: 'TestCharacter',
            level: 1,
            health: 100,
            location: 'test_location'
        }];
        
        return Promise.resolve();
    }
    
    // Set the game scene
    public setScene(sceneState: number): void {
        console.log(`Setting scene to: ${sceneState}`);
        this.nextScene = sceneState;
    }
    
    // Set the game scene reference
    public setGameScene(scene: GameScene): void {
        console.log('Setting game scene reference');
        this.gamescene = scene;
    }
    
    // Toggle FPS mode
    public toggleFPSMode(): void {
        console.log('Toggling FPS mode');
        
        if (!this._fpsIntegrator) {
            this._fpsIntegrator = new GameIntegrator(this);
            this._fpsIntegrator.initialize();
        } else {
            this._fpsIntegrator.dispose();
            this._fpsIntegrator = null;
        }
    }
    
    // Mock method to initialize FPS mode
    public initializeFPSMode(): void {
        if (!this._fpsIntegrator) {
            console.log('Initializing FPS mode');
            this._fpsIntegrator = new GameIntegrator(this);
            this._fpsIntegrator.initialize();
        }
    }
    
    // Mock method to get game data
    public getGameData(dataType: string, key: string): any {
        console.log(`Getting game data: ${dataType} - ${key}`);
        
        // Return mock data based on data type
        if (dataType === 'race') {
            return {
                key: key,
                title: 'Test Race',
                speed: 1,
                scale: 1
            };
        }
        
        return null;
    }
    
    // Method for loading game data, similar to getGameData but returns the whole data set
    public loadGameData(dataType: string): any {
        console.log(`Loading full data set for: ${dataType}`);
        
        // Return mock data sets based on the type
        if (dataType === 'abilities') {
            return {
                fireball: { 
                    key: 'fireball', 
                    title: 'Fireball', 
                    icon: 'ability_fireball',
                    damage: 10
                },
                heal: { 
                    key: 'heal', 
                    title: 'Heal', 
                    icon: 'ability_heal',
                    healing: 20
                }
            };
        }
        
        if (dataType === 'items') {
            return {
                sword: {
                    key: 'sword',
                    title: 'Steel Sword',
                    icon: 'item_sword',
                    model: 'sword',
                    damage: 5
                },
                shield: {
                    key: 'shield',
                    title: 'Wooden Shield',
                    icon: 'item_shield',
                    model: 'shield',
                    defense: 3
                }
            };
        }
        
        if (dataType === 'races') {
            return {
                human: {
                    key: 'human',
                    title: 'Human',
                    icon: 'race_human',
                    vat: { key: 'human_vat' }
                },
                elf: {
                    key: 'elf',
                    title: 'Elf',
                    icon: 'race_elf',
                    vat: { key: 'elf_vat' }
                }
            };
        }
        
        return null;
    }
    
    // Mock method to send messages to the server
    public sendMessage(messageType: string, data: any = {}): void {
        console.log(`Sending message: ${messageType}`, data);
    }
}
