if (process.env.NODE_ENV !== "production") {
    import("@babylonjs/core/Debug/debugLayer");
    import("@babylonjs/inspector");
}

// ES6 IMPORTS
// if there are cases where es6 dependencies could be causing issues just try and load the whole babylon core, and
// that fixes it, then it is a dependencies issue, check this link out for answers.
// bjs post: https://forum.babylonjs.com/t/pickedmesh-is-null-in-onpointerobservable-after-update-to-6-25-0/45076/7
// bjs docs: https://doc.babylonjs.com/setup/frameworkPackages/es6Support#faq
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

import { DracoCompression } from "@babylonjs/core/Meshes/Compression/dracoCompression";
DracoCompression.Configuration = {
    decoder: {
        wasmUrl: "/lib/draco_wasm_wrapper_gltf.js",
        wasmBinaryUrl: "/lib/draco_decoder_gltf.wasm",
        fallbackUrl: "/lib/draco_decoder_gltf.js",
    },
};

import { Engine } from "@babylonjs/core/Engines/engine";
import State from "./Screens/Screens";
import { LoginScene } from "./Screens/LoginScene";
import { CharacterSelectionScene } from "./Screens/CharacterSelection";
import { CharacterEditor } from "./Screens/CharacterEditor";
import { GameScene } from "./Screens/GameScene";
import { DebugScene } from "./Screens/DebugScene";
import { Config } from "../shared/Config";
import { Loading } from "./Controllers/Loading";
import { isLocal } from "./Utils";
import { GameController } from "./Controllers/GameController";
import "./FPS/index";

// App class is our entire game application
class App {
    // babylon
    public canvas;
    public engine: Engine;
    public config: Config;
    public game: GameController;

    constructor() {
        console.log("%c[App] Starting DegenQuest initialization...", "color: green; font-weight: bold");
        
        // create canvas
        this.canvas = document.getElementById("renderCanvas");
        if (!this.canvas) {
            console.error("%c[App] Failed to find renderCanvas element!", "color: red; font-weight: bold");
            return;
        }
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

            // set default scene
            console.log("%c[App] Setting default scene...", "color: blue");
            let defaultScene = isLocal() ? State.GAME : State.LOGIN;
            console.log("%c[App] Default scene selected:", "color: green", defaultScene === State.GAME ? "GAME" : "LOGIN");
            this.game.setScene(defaultScene);

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
        } catch (error) {
            console.error("%c[App] Error during initialization:", "color: red; font-weight: bold", error);
        }
    }

    private async _render(): Promise<void> {
        // render loop
        this.engine.runRenderLoop(() => {
            // monitor state
            const sceneChange = this.checkForSceneChange();
            if (sceneChange !== undefined) {
                this.game.state = sceneChange;
            }

            switch (this.game.state) {
                ///////////////////////////////////////
                // LOGIN SCENE
                case State.LOGIN:
                    this.clearScene();
                    this.game.currentScene = new LoginScene();
                    this.createScene();
                    break;

                ///////////////////////////////////////
                // CHARACTER SELECTION SCENE
                case State.CHARACTER_SELECTION:
                    this.clearScene();
                    this.game.currentScene = new CharacterSelectionScene();
                    this.createScene();
                    break;

                ///////////////////////////////////////
                // CHARACTER SELECTION SCENE
                case State.CHARACTER_EDITOR:
                    this.clearScene();
                    this.game.currentScene = new CharacterEditor();
                    this.createScene();
                    break;

                ///////////////////////////////////////
                // GAME
                case State.GAME:
                    this.clearScene();
                    this.game.currentScene = new GameScene();
                    this.createScene();
                    break;

                ///////////////////////////////////////
                // DEBUG
                case State.DEBUG_SCENE:
                    this.clearScene();
                    this.game.currentScene = new DebugScene();
                    this.createScene();
                    break;

                default:
                    break;
            }

            // render when scene is ready
            this._process();
        });

        //for development: make inspector visible/invisible
        if (isLocal()) {
            window.addEventListener("keydown", (ev) => {
                //Shift+Ctrl+Alt+I
                if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                    if (this.game.scene.debugLayer.isVisible()) {
                        this.game.scene.debugLayer.hide();
                    } else {
                        this.game.scene.debugLayer.show();
                    }
                }
            });
        }

        //resize if the screen is resized/rotated
        window.addEventListener("resize", () => {
            this.engine.resize();
            if (this.game.currentScene && this.game.currentScene.resize) {
                this.game.currentScene.resize();
            }
        });
    }

    private createScene() {
        this.game.currentScene.createScene(this.game);
        this.game.scene = this.game.currentScene._scene;
        this.game.state = State.NULL;
        
        // Initialize FPS mode if this is the game scene
        if (this.game.state === State.GAME || this.game.nextScene === State.GAME) {
            // Add a slight delay to ensure the scene is fully loaded
            setTimeout(() => {
                if (this.game.initializeFPSMode) {
                    console.log("Initializing FPS mode...");
                    this.game.initializeFPSMode();
                }
            }, 2000);
        }
    }

    private checkForSceneChange() {
        let currentScene = this.game.nextScene;
        if (this.game.nextScene !== State.NULL) {
            this.game.nextScene = State.NULL;
            return currentScene;
        }
    }

    private async _process(): Promise<void> {
        // make sure scene and camera is initialized
        if (this.game.scene && this.game.scene.activeCamera) {
            // render scene
            //this.game.currentScene.engineUpdate();
            this.game.scene.render();
        }
    }

    private clearScene() {
        if (this.game.scene) {
            this.game.engine.displayLoadingUI();
            this.game.scene.detachControl();
            this.game.scene.dispose();
            this.game.currentScene = null;
        }
    }
}
new App();
