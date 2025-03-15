# Camera and First-Person View Fixes

## Current Issues

1. **Camera Height Issue**: Camera appears too low, not at proper character eye level
2. **Body Visibility**: Player cannot see their own body/character, even when zooming out
3. **Camera Control Problems**:
   - Left/right camera movement only works when right-clicking
   - Left/right controls are inverted
   - Up/down camera controls don't work properly

## Game Plan for Fixes

### 1. Camera Height Adjustment

#### Analysis
The camera height is controlled by the `FP_CAMERA_HEIGHT` constant in `PlayerCamera.ts`, currently set to `1.6`. This might be too low relative to the player character height, or the camera isn't being properly positioned during initialization and attachment.

#### Solution Steps
1. Increase the `FP_CAMERA_HEIGHT` value to `1.8` (typical eye level for human characters)
2. Ensure camera height is properly applied during initialization and after player attachment
3. Add debug visualization to see the exact position of the camera relative to player

```typescript
// In PlayerCamera.ts
private FP_CAMERA_HEIGHT: number = 1.8; // Increase to typical human eye level

// In _switchToFirstPerson method
private _switchToFirstPerson(): void {
    this._isFirstPerson = true;
    this._camRoot = this._fpsCamRoot;
    this.camera.parent = this._camRoot;
    this.camera.fov = 1.0; // Wider FOV for first-person
    
    if (this.player) {
        // Make sure the camera is at the right height relative to player root
        this._fpsCamRoot.position.y = this.FP_CAMERA_HEIGHT;
        
        // Add debug sphere to visualize camera position (remove in production)
        const debugSphere = MeshBuilder.CreateSphere("cameraPos", {diameter: 0.1}, this._scene);
        debugSphere.parent = this._fpsCamRoot;
        debugSphere.position = Vector3.Zero();
    }
    
    console.log('Switched to first-person mode with camera height:', this.FP_CAMERA_HEIGHT);
}
```

### 2. Player Body Visibility

#### Analysis
In traditional FPS games, players see a partial view of their character (arms, weapon) in first-person mode. Currently, there's no mesh/model attached to the first-person camera to represent the player's body.

#### Solution Steps
1. Create a first-person arms/weapon mesh to attach to the camera
2. Add a toggle option to switch between pure FPS mode and third-person mode
3. Implement appropriate colliders to prevent camera clipping through objects

```typescript
// In PlayerCamera.ts - add properties
private _fpArmsModel: Mesh | null = null;
private _weaponModel: Mesh | null = null;
private _showPlayerBody: boolean = true;

// Add method to load and attach arms model
private async _loadFirstPersonArms(): Promise<void> {
    try {
        // Load arms model from assets
        const armsModel = await this._game._assetsCtrl.fetchAsset("ARMS_FP_model");
        if (!armsModel) throw new Error("Failed to load arms model");
        
        // Clone and position it properly
        this._fpArmsModel = armsModel.clone("playerArms");
        this._fpArmsModel.parent = this.camera;
        
        // Position arms in camera view (adjust these values as needed)
        this._fpArmsModel.position = new Vector3(0, -0.6, 1);
        this._fpArmsModel.rotation = new Vector3(0, 0, 0);
        
        // Make sure it's only visible in first-person mode
        this._fpArmsModel.isVisible = this._isFirstPerson;
        
        console.log("First-person arms model loaded successfully");
    } catch (error) {
        console.error("Error loading first-person arms:", error);
    }
}

// Update _switchToFirstPerson and _switchToThirdPerson to handle arm visibility
private _switchToFirstPerson(): void {
    // Existing code...
    
    // Show arms in first-person
    if (this._fpArmsModel) {
        this._fpArmsModel.isVisible = true;
    }
    
    // Hide player mesh in first-person if we don't want to see body
    if (this.player && !this._showPlayerBody) {
        this.player.mesh.isVisible = false;
    }
}

private _switchToThirdPerson(): void {
    // Existing code...
    
    // Hide arms in third-person
    if (this._fpArmsModel) {
        this._fpArmsModel.isVisible = false;
    }
    
    // Always show player in third-person
    if (this.player) {
        this.player.mesh.isVisible = true;
    }
}
```

### 3. Camera Control Fixes

#### Analysis
The camera control issues suggest problems with how input is processed in the `_updateFirstPersonCamera` and `_updateThirdPersonCamera` methods. The inversion suggests we need to flip the movementX sign, and the non-working up/down indicates issues with vertical rotation handling.

#### Solution Steps
1. Fix inverted controls by adjusting the sign of `movementX`
2. Improve up/down camera rotation by properly handling `movementY`
3. Make first-person camera controls work independently of right-click state

```typescript
// Fix _updateFirstPersonCamera method
private _updateFirstPersonCamera(): void {
    if (!this.player) return;
    
    // Fix for inverted horizontal look by negating movementX if needed
    // If left/right is inverted, change the line below to:
    const horizontalLook = -this._input.movementX; // Negative for fixing inversion
    this.player.rotation.y += horizontalLook;
    
    // Fix for vertical look (up/down)
    // Apply vertical mouse movement to the camera (looking up/down)
    const verticalLook = this._input.movementY;
    const newRotationX = this._camRoot.rotation.x + verticalLook;
    
    // Clamp vertical rotation to prevent flipping (adjust range if needed)
    if (Math.abs(newRotationX) < 0.85) {
        this._camRoot.rotation.x = newRotationX;
    }
    
    // Update the game's camera delta (if needed)
    if (this.player._game) {
        this.player._game.deltaCamY = this.player.rotation.y;
    }
    
    // Add debugging output
    console.log(`Camera rotation - X: ${this._camRoot.rotation.x.toFixed(2)}, Y: ${this.player.rotation.y.toFixed(2)}`);
    console.log(`Input values - movementX: ${this._input.movementX.toFixed(2)}, movementY: ${this._input.movementY.toFixed(2)}`);
}

// Update the main update method to enable camera controls without requiring right-click in FPS mode
public update(): void {
    if (!this.player) return; // Prevent updates before player is attached
    
    // First-person mode always updates camera rotation, regardless of right-click
    if (this._isFirstPerson) {
        this._updateFirstPersonCamera();
    } 
    // Third-person mode only updates when middle button is pressed
    else if (!this._isFirstPerson && this._input.middle_click) {
        this._updateThirdPersonCamera();
    }

    // Cast ray for object interaction
    this.castRay();
}
```

### 4. Input System Review

Make sure the PlayerInput class is properly capturing and processing mouse movement:

```typescript
// In PlayerInput.ts
// Ensure mouse movement is being captured correctly
private _onMouseMove(e: MouseEvent): void {
    // Get movement delta
    const dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    
    // Apply sensitivity
    const sensitivity = 0.005; // Adjust as needed
    this.movementX = dx * sensitivity;
    this.movementY = dy * sensitivity;
    
    // Debug output
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        console.log(`Mouse move - raw dx: ${dx}, dy: ${dy}, processed: ${this.movementX.toFixed(3)}, ${this.movementY.toFixed(3)}`);
    }
}

// Make sure pointer lock is working for FPS controls
private _setupPointerLock(): void {
    // Request pointer lock when canvas is clicked
    this._gameScene._scene.getEngine().getRenderingCanvas().addEventListener("click", () => {
        this._gameScene._scene.getEngine().getRenderingCanvas().requestPointerLock();
    });
    
    // Handle pointer lock change
    document.addEventListener("pointerlockchange", () => {
        this.pointerLocked = document.pointerLockElement === this._gameScene._scene.getEngine().getRenderingCanvas();
        console.log("Pointer lock state:", this.pointerLocked);
    });
}
```

## Implementation Steps

Follow these steps to implement the fixes:

1. **First, verify camera positioning**:
   - Add the debug visualization code
   - Adjust FP_CAMERA_HEIGHT and test different values
   - Fix any attachment issues between camera and player

2. **Then fix camera controls**:
   - Update the update() method to remove right-click dependency in FPS mode
   - Fix inverted controls by negating movement values if needed
   - Test vertical look and adjust clamping values

3. **Finally, add player body visibility**:
   - Create or obtain a first-person arms mesh
   - Implement the arms attachment logic
   - Add toggle for player body visibility

## Testing Procedures

After implementing each fix, test the following scenarios:

1. **Camera Height**:
   - Does the camera feel like it's at eye level?
   - Does the player see the world from a realistic height?
   - Is the camera consistent across different character models?

2. **Camera Controls**:
   - Do left/right controls work correctly (not inverted)?
   - Do up/down controls allow looking up and down smoothly?
   - Does first-person mode work without requiring right-click?
   - Are movements smooth and responsive?

3. **Player Body**:
   - Are the arms/weapon visible in first-person mode?
   - Do they move naturally with camera movement?
   - Is the transition between first and third person clean?

## Expected Results

After implementing these fixes:

1. The camera will be positioned at proper eye level (1.8 units)
2. Camera controls will be intuitive (not inverted) and work in all directions
3. Players will see their arms/weapon in first-person mode
4. Switching between first and third person will be seamless

Record any additional issues discovered during implementation for future improvements. 