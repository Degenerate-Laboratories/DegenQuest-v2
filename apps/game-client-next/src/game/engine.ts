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

// Conditionally import the inspector for non-production environments
if (process.env.NODE_ENV !== "production") {
  import("@babylonjs/core/Debug/debugLayer");
  import("@babylonjs/inspector");
}

// Primary BabylonJS classes
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color3,
  ArcRotateCamera,
} from "@babylonjs/core";

// Game state
let engine: Engine | null = null;
let scene: Scene | null = null;

/**
 * Initializes the BabylonJS game engine with the provided canvas
 */
export function initializeGame(canvas: HTMLCanvasElement) {
  // Create the BabylonJS engine
  engine = new Engine(canvas, true, { 
    preserveDrawingBuffer: true, 
    stencil: true,
    disableWebGL2Support: false,
  });

  // Create the scene
  scene = new Scene(engine);
  
  // Create a basic camera
  const camera = new ArcRotateCamera(
    "camera1",
    Math.PI / 2,
    Math.PI / 3,
    10,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  
  // Add a light
  const light = new HemisphericLight(
    "light1",
    new Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;
  
  // Create a simple sphere for testing
  const sphere = MeshBuilder.CreateSphere(
    "sphere1",
    { diameter: 2, segments: 16 },
    scene
  );
  sphere.position.y = 1;
  
  // Create ground
  const ground = MeshBuilder.CreateGround(
    "ground1",
    { width: 6, height: 6, subdivisions: 2 },
    scene
  );
  
  // Enable inspector in development mode
  if (process.env.NODE_ENV !== "production") {
    scene.debugLayer.show({
      embedMode: true,
    });
  }
  
  // Start the render loop
  engine.runRenderLoop(() => {
    if (scene) {
      scene.render();
    }
  });
  
  // Handle window resize
  window.addEventListener("resize", () => {
    if (engine) {
      engine.resize();
    }
  });
}

/**
 * Cleans up the BabylonJS engine and scene
 */
export function disposeGame() {
  if (scene) {
    scene.dispose();
    scene = null;
  }
  
  if (engine) {
    engine.dispose();
    engine = null;
  }
} 