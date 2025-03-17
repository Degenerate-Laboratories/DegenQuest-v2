// Import BabylonJS components
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { GameController } from "./GameController";

// Simplified VatController for Next.js migration that maintains the original interface
export class VatController {
  private _scene: Scene;
  public _game: GameController;
  private _spawns: any[] = [];
  public _entityData = new Map();
  public _vatData = new Map();
  private _skeletonData = new Map();
  private activeMeshes: Map<string, Mesh> = new Map();
  
  constructor(game: GameController, spawns: any[] = []) {
    this._game = game;
    this._spawns = spawns;
    if (!game.scene) {
      throw new Error('VatController requires a valid scene in the GameController');
    }
    this._scene = game.scene;
    console.log('VatController initialized in Next.js with', spawns.length, 'spawns');
  }
  
  // Initialize method to match the original interface
  public async initialize(): Promise<void> {
    console.log('VatController.initialize() called');
    
    // Create a mock entity data entry to prevent errors
    this._entityData.set('humanoid', {
      mesh: this.createTestAvatar(),
      animations: {}
    });
    
    return Promise.resolve();
  }
  
  // Create a simple test mesh
  public createTestAvatar(): Mesh {
    const name = 'testAvatar';
    const mesh = Mesh.CreateBox(name, 1, this._scene);
    
    // Position the mesh
    mesh.position = new Vector3(0, 0.5, 0);
    
    // Create a simple material
    const material = new StandardMaterial('testAvatarMaterial', this._scene);
    material.diffuseColor = new Color3(0.5, 0.5, 1);
    mesh.material = material;
    
    // Store the mesh
    this.activeMeshes.set(name, mesh);
    
    return mesh;
  }
  
  // Customize avatar color
  public setAvatarColor(name: string, color: Color3): void {
    const mesh = this.activeMeshes.get(name);
    if (mesh && mesh.material instanceof StandardMaterial) {
      mesh.material.diffuseColor = color;
    }
  }
  
  // Dispose of resources
  public dispose(): void {
    this.activeMeshes.forEach(mesh => {
      if (mesh.material) mesh.material.dispose();
      mesh.dispose();
    });
    this.activeMeshes.clear();
  }
}
