// Core BabylonJS imports required for the game
import "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Animations/animatable";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_materials_pbrSpecularGlossiness";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";
import "@babylonjs/core/Rendering/depthRendererSceneComponent";
import "@babylonjs/core/Rendering/outlineRenderer";
import "@babylonjs/core/Audio/audioSceneComponent";

// Set up Draco compression
import { DracoCompression } from "@babylonjs/core/Meshes/Compression/dracoCompression";
DracoCompression.Configuration = {
    decoder: {
        wasmUrl: "/lib/draco_wasm_wrapper_gltf.js",
        wasmBinaryUrl: "/lib/draco_decoder_gltf.wasm",
        fallbackUrl: "/lib/draco_decoder_gltf.js",
    },
};

// Conditionally import the inspector for non-production environments
if (process.env.NODE_ENV !== "production") {
  import("@babylonjs/core/Debug/debugLayer");
  import("@babylonjs/inspector");
}

// Primary BabylonJS classes
import { Engine } from "@babylonjs/core/Engines/engine";

// Game components
import State from "./Screens/Screens";
import { GameScene } from "./Screens/GameScene";
import { Config } from "./shared/Config";
import { Loading } from "./Controllers/Loading";
import { isLocal } from "./Utils";
import { GameController } from "./Controllers/GameController";

// App class is our entire game application
class App {
  // babylon
  public canvas: HTMLCanvasElement;
  public engine!: Engine; // Using the definite assignment assertion
  public config: Config;
  public game!: GameController; // Using the definite assignment assertion

  constructor(canvas: HTMLCanvasElement) {
    console.log("%c[App] Starting DegenQuest initialization...", "color: green; font-weight: bold");
    
    // store canvas reference
    this.canvas = canvas;
    console.log("%c[App] Canvas found", "color: green");

    // set config
    this.config = new Config();
    console.log("%c[App] Config initialized", "color: green");

    // initialize babylon scene and engine
    this._init();
  }

  private async _init(): Promise<void> {
    try {
      console.log("%c[App] Creating engine...", "color: blue");
      // create engine
      this.engine = new Engine(this.canvas, true, {
        adaptToDeviceRatio: true,
        antialias: true,
      });
      console.log("%c[App] Engine created", "color: green");

      //
      this.engine.setHardwareScalingLevel(1);

      // loading
      console.log("%c[App] Setting up loading screen...", "color: blue");
      var loadingScreen = new Loading("Loading Assets...");
      this.engine.loadingScreen = loadingScreen;
      console.log("%c[App] Loading screen created", "color: green");

      // preload game data
      console.log("%c[App] Initializing GameController...", "color: blue");
      this.game = new GameController(this);
      console.log("%c[App] Initializing game data...", "color: blue");
      await this.game.initializeGameData();
      console.log("%c[App] Game data initialized", "color: green");

      // set default scene to GAME since we're in Next.js now
      console.log("%c[App] Setting default scene to GAME...", "color: blue");
      this.game.setScene(State.GAME);

      // main render loop & state machine
      console.log("%c[App] Starting render loop...", "color: blue");
      await this._render();
      console.log("%c[App] Render loop started", "color: green");

      // Add global F key handler
      window.addEventListener("keydown", (evt) => {
        if (evt.code === "KeyF" && !evt.repeat) {
          console.log("Global F key handler - toggling FPS mode");
          if (this.game.toggleFPSMode) {
            this.game.toggleFPSMode();
          }
        }
      });
      
      // Hide loading screen when the game is ready
      const loadingScreenElement = document.getElementById('loadingScreen');
      if (loadingScreenElement) {
        loadingScreenElement.style.display = 'none';
      }
      
    } catch (error) {
      console.error("%c[App] Error during initialization:", "color: red; font-weight: bold", error);
    }
  }

  private async _render(): Promise<void> {
    // render loop
    this.engine.runRenderLoop(() => {
      try {
        // Since we're in Next.js, we only have the GAME state
        if (!this.game.currentScene) {
          this.clearScene();
          
          // Create a new GameScene instance
          const gameScene = new GameScene();
          
          // Initialize the game scene with the game controller
          gameScene._game = this.game;
          
          // First create the scene using createScene method
          gameScene.createScene(this.game).then(() => {
            console.log("Scene created successfully");
            
            // Now initialize the game with the created scene
            if (gameScene._initGame) {
              gameScene._initGame();
            }
            
            console.log("Original GameScene initialized successfully");
          });
          
          // Set the current scene
          this.game.currentScene = gameScene;
          this.game.gamescene = gameScene;
        }

        // render when scene is ready
        this._process();
      } catch (error) {
        console.error("Error in render loop:", error);
      }
    });

    // For development: make inspector visible/invisible
    if (isLocal()) {
      window.addEventListener("keydown", (ev) => {
        // Shift+Ctrl+Alt+I
        if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
          if (this.game.scene && this.game.scene.debugLayer && this.game.scene.debugLayer.isVisible()) {
            this.game.scene.debugLayer.hide();
          } else if (this.game.scene && this.game.scene.debugLayer) {
            this.game.scene.debugLayer.show();
          }
        }
      });
    }

    // Resize if the screen is resized/rotated
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private _process(): void {
    // make sure scene and camera is initialized
    if (this.game.scene && this.game.scene.activeCamera) {
      // render scene
      this.game.scene.render();
    } else if (this.game.currentScene && this.game.currentScene._scene && this.game.currentScene._scene.activeCamera) {
      // If game.scene isn't set but the currentScene has a scene, use that instead
      this.game.scene = this.game.currentScene._scene; // Sync the scenes
      this.game.scene.render();
    }
  }

  private clearScene() {
    if (this.game && this.game.scene) {
      this.game.engine.displayLoadingUI();
      this.game.scene.detachControl();
      this.game.scene.dispose();
      this.game.scene = null;
      this.game.currentScene = null;
    }
  }
}

// Export functions for Next.js to use
let gameApp: App | null = null;

export function initializeGame(canvas: HTMLCanvasElement) {
  if (!gameApp) {
    gameApp = new App(canvas);
  }
  return gameApp;
}

export function disposeGame() {
  if (gameApp && gameApp.engine) {
    gameApp.engine.dispose();
  }
  gameApp = null;
} 