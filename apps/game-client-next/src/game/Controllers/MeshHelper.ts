import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Matrix } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

/**
 * Merges multiple meshes into a single mesh
 * @param sourceMesh Source mesh to merge
 * @param name Name of the resulting mesh
 * @returns Merged mesh
 */
export function mergeMesh(sourceMesh: Mesh, name: string): Mesh | null {
    try {
        if (!sourceMesh) {
            console.warn("No source mesh provided to mergeMesh");
            return null;
        }
        
        const scene = sourceMesh.getScene();
        const mergedMesh = sourceMesh.clone(name);
        
        console.log(`Created merged mesh: ${name}`);
        return mergedMesh;
    } catch (error) {
        console.error("Error in mergeMesh:", error);
        return null;
    }
}

/**
 * Creates a debug box around a given position
 * @param scene Scene to add the debug box to
 * @param position Position of the debug box
 * @param size Size of the debug box
 * @param color Color of the debug box
 * @returns Debug box mesh
 */
export function createDebugBox(scene: Scene, position: Vector3, size: number = 0.5, color: Color3 = Color3.Red()): Mesh {
    const debugBox = Mesh.CreateBox("debugBox", size, scene);
    debugBox.position = position;
    
    const material = new StandardMaterial("debugBoxMaterial", scene);
    material.diffuseColor = color;
    material.alpha = 0.5;
    debugBox.material = material;
    
    return debugBox;
}

/**
 * Creates debug arrows to visualize a direction
 * @param scene Scene to add the arrows to
 * @param position Start position of the arrow
 * @param direction Direction vector
 * @param length Length of the arrow
 * @param color Color of the arrow
 * @returns Arrow mesh
 */
export function createDebugArrow(scene: Scene, position: Vector3, direction: Vector3, length: number = 1, color: Color3 = Color3.Green()): Mesh {
    // Normalize direction vector
    const normalizedDirection = direction.normalize();
    
    // Create arrow body
    const arrowBody = Mesh.CreateCylinder("arrowBody", length, 0.1, 0.1, 8, 1, scene);
    
    // Position arrow
    arrowBody.position = position.add(normalizedDirection.scale(length / 2));
    
    // Create a simple rotation based on the direction
    if (normalizedDirection.y === 1) {
        // Pointing up, no rotation needed
    } else if (normalizedDirection.y === -1) {
        // Pointing down, rotate 180 degrees around X
        arrowBody.rotation.x = Math.PI;
    } else {
        // Get the angle in the XZ plane
        const angleY = Math.atan2(normalizedDirection.x, normalizedDirection.z);
        // Get the angle from the XZ plane
        const angleX = Math.atan2(normalizedDirection.y, 
            Math.sqrt(normalizedDirection.x * normalizedDirection.x + normalizedDirection.z * normalizedDirection.z));
        
        arrowBody.rotation.y = angleY;
        arrowBody.rotation.x = angleX;
    }
    
    // Create material
    const material = new StandardMaterial("arrowMaterial", scene);
    material.diffuseColor = color;
    arrowBody.material = material;
    
    return arrowBody;
} 