# Camera-Character Rotation Fix Implementation Plan

This document provides a concrete implementation plan for fixing the character rotation issue, where the character model doesn't turn when the camera turns. This is especially problematic when casting spells or when other players need to see which direction someone is looking.

## Phase 1: Diagnostic Implementation

### Step 1: Add Build Version Marker

First, we need to verify our changes are included in the build.

```typescript
// Add at top of PlayerCamera.ts
const CAMERA_VERSION = "rotation-fix-v1.0";
console.log(`[CAMERA] Loading PlayerCamera: ${CAMERA_VERSION}`);
```

### Step 2: Add Visual Debug Elements

Create visual indicators to help diagnose rotation issues.

```typescript
// Add to PlayerCamera.ts
private _debugArrows: {[key: string]: Mesh} = {};

private _createDebugVisuals(): void {
    if (!this._debugMode) return;
    
    try {
        // Direction arrow for camera
        this._debugArrows.camera = MeshBuilder.CreateCylinder(
            "camDirection", 
            {height: 2, diameter: 0.1}, 
            this._scene
        );
        this._debugArrows.camera.rotation.x = Math.PI/2; // Point forward
        this._debugArrows.camera.parent = this.camera;
        
        const cameraMat = new StandardMaterial("camDirMat", this._scene);
        cameraMat.emissiveColor = new Color3(0, 0, 1); // Blue
        this._debugArrows.camera.material = cameraMat;
        
        // Direction arrow for player
        this._debugArrows.player = MeshBuilder.CreateCylinder(
            "playerDirection", 
            {height: 2, diameter: 0.1}, 
            this._scene
        );
        this._debugArrows.player.rotation.x = Math.PI/2; // Point forward
        
        const playerMat = new StandardMaterial("playerDirMat", this._scene);
        playerMat.emissiveColor = new Color3(1, 0, 0); // Red
        this._debugArrows.player.material = playerMat;
        
        console.log("[CAMERA] Debug visuals created");
    } catch (error) {
        console.error("[CAMERA] Failed to create debug visuals:", error);
    }
}

// Add to attach() method
public attach(player: Player) {
    this.player = player;
    this._camRoot.parent = player;
    
    // Attach debug arrow to player if it exists
    if (this._debugMode && this._debugArrows.player) {
        this._debugArrows.player.parent = player;
    }
    
    // Force first-person mode on attach and ensure correct height
    if (this._isFirstPerson) {
        this._switchToFirstPerson();
    }
    
    console.log('[CAMERA] Attached to player', {
        playerPosition: player.position.toString(),
        cameraPosition: this.camera.position.toString()
    });
}
```

### Step 3: Add Rotation Logging

```typescript
// Add to PlayerCamera.ts
private _logRotationData(force: boolean = false): void {
    if (!this._debugMode && !force) return;
    
    const rotationData = {
        camera: {
            absoluteRotation: this.camera.absoluteRotation.toEulerAngles().toString(),
            rotation: this.camera.rotation.toString()
        },
        camRoot: this._camRoot ? {
            rotation: this._camRoot.rotation.toString()
        } : "no camRoot",
        player: this.player ? {
            rotation: this.player.rotation.toString(),
            mesh: this.player.mesh ? this.player.mesh.rotation.toString() : "no mesh"
        } : "no player",
        input: this._input ? {
            movementX: this._input.movementX,
            movementY: this._input.movementY
        } : "no input"
    };
    
    console.log("[CAMERA] Rotation data:", rotationData);
    
    // Store in localStorage for persistence
    try {
        const logs = JSON.parse(localStorage.getItem('cameraRotationLogs') || '[]');
        logs.push({timestamp: Date.now(), ...rotationData});
        if (logs.length > 50) logs.shift(); // Keep last 50 logs
        localStorage.setItem('cameraRotationLogs', JSON.stringify(logs));
    } catch (error) {
        console.error("[CAMERA] Failed to store rotation logs:", error);
    }
}

// Call this from update() method periodically
// e.g., if (Date.now() % 1000 < 50) this._logRotationData(); // Log every second(ish)
```

## Phase 2: Fix Implementation

### Step 1: Update the First-Person Camera Method

This is the most critical fix - ensuring the player model rotates with the camera.

```typescript
private _updateFirstPersonCamera(): void {
    if (!this.player) return;
    
    try {
        // Store original rotation for logging
        const originalPlayerRotation = this.player.rotation.y;
        
        // Fix for inverted horizontal look by negating movementX
        const horizontalLook = -this._input.movementX; // Negative to fix inversion
        
        // CRITICAL FIX: Update player model rotation to match camera look
        if (Math.abs(horizontalLook) > 0.001) { // Only update if significant movement
            // Update player body rotation
            this.player.rotation.y += horizontalLook;
            
            // Ensure mesh rotation matches if it exists
            if (this.player.mesh && this.player.mesh.rotation) {
                this.player.mesh.rotation.y = this.player.rotation.y;
            }
            
            // Log significant rotation changes
            if (Math.abs(originalPlayerRotation - this.player.rotation.y) > 0.01) {
                console.log(`[CAMERA] Player rotation updated: ${originalPlayerRotation.toFixed(2)} → ${this.player.rotation.y.toFixed(2)}`);
            }
        }
        
        // Fix for vertical look (up/down)
        const verticalLook = this._input.movementY;
        const newRotationX = this._camRoot.rotation.x + verticalLook;
        
        // Clamp vertical rotation to prevent flipping (increased range for more natural looking)
        if (Math.abs(newRotationX) < 0.85) {
            this._camRoot.rotation.x = newRotationX;
        }
        
        // Update the game's camera delta (if needed)
        if (this.player._game) {
            this.player._game.deltaCamY = this.player.rotation.y;
        }
        
        // Update animation controller if exists
        if (this.player._animationController) {
            try {
                // Update facing direction in animation controller
                this.player._animationController.setFacingDirection(this.player.rotation.y);
            } catch (animError) {
                console.warn("[CAMERA] Failed to update animation controller:", animError);
            }
        }
        
        // Debug logging
        if (this._debugMode && (Math.abs(horizontalLook) > 0.01 || Math.abs(verticalLook) > 0.01)) {
            console.log(`[CAMERA] Camera update - horizontal: ${horizontalLook.toFixed(3)}, vertical: ${verticalLook.toFixed(3)}`);
        }
    } catch (error) {
        console.error("[CAMERA] Error in _updateFirstPersonCamera:", error);
    }
}
```

### Step 2: Add Error Handling to Update Method

Ensure the main update method has proper error handling.

```typescript
public update(): void {
    try {
        if (!this.player) return; // Prevent updates before player is attached
        
        // First-person mode always updates camera rotation, regardless of right-click state
        if (this._isFirstPerson) {
            this._updateFirstPersonCamera();
        } 
        // Third-person mode only updates when middle button is pressed
        else if (!this._isFirstPerson && this._input.middle_click) {
            this._updateThirdPersonCamera();
        }

        // Cast ray for object interaction
        this.castRay();
        
        // Periodically log rotation data in debug mode
        if (this._debugMode && (Date.now() % 2000 < 20)) { // Log every ~2 seconds
            this._logRotationData();
        }
    } catch (error) {
        console.error("[CAMERA] Error in update method:", error);
    }
}
```

### Step 3: Add Network Synchronization (if applicable)

If this is a multiplayer game, ensure rotation updates are properly synchronized.

```typescript
// Add to PlayerCamera.ts
private _lastNetworkUpdateTime: number = 0;
private _networkUpdateInterval: number = 100; // ms between updates

private _sendRotationUpdate(): void {
    if (!this.player || !this.player._game || !this.player._game.network) return;
    
    const now = Date.now();
    if (now - this._lastNetworkUpdateTime < this._networkUpdateInterval) return;
    
    try {
        // Send player rotation to network
        this.player._game.network.sendPlayerUpdate({
            type: 'rotation',
            bodyRotation: this.player.rotation.y,
            headRotation: this._camRoot.rotation.x,
            timestamp: now
        });
        
        this._lastNetworkUpdateTime = now;
    } catch (error) {
        console.warn("[CAMERA] Failed to send rotation update:", error);
    }
}

// Call this from update() method
// e.g., this._sendRotationUpdate();
```

## Phase 3: Feature Flag Implementation

### Step 1: Create FeatureFlags System

```typescript
// src/client/Utils/FeatureFlags.ts
export class FeatureFlags {
    private static _flags: {[key: string]: boolean} = {};
    
    static init(): void {
        // Read from query params
        const params = new URLSearchParams(window.location.search);
        
        // Set default flags
        this._flags = {
            // Camera flags
            cameraDebug: params.get('cam-debug') === '1',
            useNewRotation: true, // Default to using new rotation system
            useNativeCameraControls: params.get('native-cam') === '1',
            logCameraRotation: params.get('log-cam') === '1'
        };
        
        console.log('[FLAGS] Feature flags initialized:', this._flags);
        
        // Store in localStorage for dev convenience
        try {
            localStorage.setItem('featureFlags', JSON.stringify(this._flags));
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    static isEnabled(flag: string): boolean {
        return this._flags[flag] === true;
    }
}
```

### Step 2: Update PlayerCamera Constructor to Use Feature Flags

```typescript
// Update PlayerCamera constructor
constructor(gameScene) {
    this._scene = gameScene._scene;
    this._input = gameScene._input;
    
    // Use feature flags if available
    if (typeof FeatureFlags !== 'undefined') {
        this._debugMode = FeatureFlags.isEnabled('cameraDebug');
        this._useNewRotation = FeatureFlags.isEnabled('useNewRotation');
    } else {
        // Default values if no feature flags
        this._debugMode = false;
        this._useNewRotation = true;
    }
    
    this.init();
    
    console.log(`[CAMERA] PlayerCamera initialized with options:`, {
        debugMode: this._debugMode,
        useNewRotation: this._useNewRotation,
        version: CAMERA_VERSION
    });
    
    if (this._debugMode) {
        this._createDebugVisuals();
    }
}
```

### Step 3: Create UI Controls for Testing

```typescript
// Add to PlayerCamera.ts
private _createDebugUI(): void {
    if (!this._debugMode) return;
    
    try {
        const AdvancedDynamicTexture = require("@babylonjs/gui/2D/advancedDynamicTexture").AdvancedDynamicTexture;
        const Button = require("@babylonjs/gui/2D/controls/button").Button;
        const StackPanel = require("@babylonjs/gui/2D/controls/stackPanel").StackPanel;
        const TextBlock = require("@babylonjs/gui/2D/controls/textBlock").TextBlock;
        
        // Create UI
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("CameraDebugUI");
        
        // Create panel for controls
        const panel = new StackPanel();
        panel.width = "200px";
        panel.horizontalAlignment = StackPanel.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_TOP;
        panel.top = "10px";
        panel.left = "10px";
        ui.addControl(panel);
        
        // Status text
        const statusText = new TextBlock();
        statusText.text = "Camera: " + CAMERA_VERSION;
        statusText.height = "30px";
        statusText.color = "white";
        panel.addControl(statusText);
        
        // Toggle camera mode button
        const toggleBtn = Button.CreateSimpleButton("toggleCamera", "Toggle Camera Mode");
        toggleBtn.width = "180px";
        toggleBtn.height = "40px";
        toggleBtn.color = "white";
        toggleBtn.background = "black";
        toggleBtn.onPointerUpObservable.add(() => {
            this.toggleCameraMode();
            statusText.text = `Camera: ${this._isFirstPerson ? 'First-Person' : 'Third-Person'}`;
        });
        panel.addControl(toggleBtn);
        
        // Log rotation button
        const logBtn = Button.CreateSimpleButton("logRotation", "Log Rotation Data");
        logBtn.width = "180px";
        logBtn.height = "40px";
        logBtn.color = "white";
        logBtn.background = "blue";
        logBtn.onPointerUpObservable.add(() => {
            this._logRotationData(true);
        });
        panel.addControl(logBtn);
        
        console.log("[CAMERA] Debug UI created");
    } catch (error) {
        console.error("[CAMERA] Failed to create debug UI:", error);
    }
}
```

## Testing Procedures

### Test 1: Verify Build Inclusion

1. After implementation, add `?cam-debug=1` to the URL to enable debug mode
2. Check browser console for the version marker message: `[CAMERA] Loading PlayerCamera: rotation-fix-v1.0`
3. If present, our changes are included in the build

### Test 2: Verify Rotation Binding

1. Run the game with debug mode enabled
2. Look around using mouse
3. Observe the red (player) and blue (camera) debug arrows
4. Verify they rotate together when looking left/right
5. Check console for rotation updates

### Test 3: Spell Casting Test

1. Position character to face a specific target
2. Cast a spell without moving the camera
3. Note the spell direction
4. Look to a different direction
5. Cast again and verify the spell goes in the new direction
6. Repeat multiple times with different angles

### Test 4: Multiplayer Test (if applicable)

1. Have two players join the same game
2. One player remains stationary while the other observes
3. The stationary player should look in different directions
4. The observing player should verify the character model rotates correctly
5. Test with different camera movement speeds

## Conclusion

This implementation plan provides a comprehensive approach to fixing the character-camera rotation synchronization issue, starting with diagnostics and verification, implementing the core fix, and finally adding feature flags for flexible testing and deployment.

The key aspects of the fix are:
1. Ensuring player.rotation.y is updated with camera movement
2. Explicitly updating the mesh rotation if needed
3. Adding animation controller integration
4. Providing robust error handling and diagnostics

By following this plan, we should resolve the issue where spells are cast in directions that don't match where the camera is pointing, and ensure other players can accurately see where someone is looking in multiplayer scenarios. 