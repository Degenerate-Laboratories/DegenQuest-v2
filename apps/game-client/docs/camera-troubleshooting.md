# Camera Changes Troubleshooting Guide

## Top 5 Reasons Why Camera Changes Aren't Working

1. **Build/Bundling Issues**: The modified files might not be properly included in the final bundle.js file that's being served to the browser.

2. **Code Execution Order**: Other components might be initializing after our camera code and overriding our changes.

3. **Input System Problems**: The PlayerInput system might not be capturing mouse movements correctly or pointer lock isn't being established.

4. **Player/Camera Attachment**: The player entity might not be properly attaching to the camera, or the attachment might be happening too late.

5. **JavaScript Errors**: Silent runtime errors might be preventing our camera code from executing completely.

## Scientific Method Approach

### 1. Observation

We've made changes to the camera system but observe no difference in behavior.

### 2. Question

Why aren't our camera changes taking effect despite successful code edits?

### 3. Hypothesis

For each potential cause:

- **Hypothesis A**: The build process isn't including our changes in the final bundle
- **Hypothesis B**: Mouse input events aren't being captured correctly
- **Hypothesis C**: The camera is being initialized but not properly attached to the player
- **Hypothesis D**: Another script is overriding our camera settings after initialization
- **Hypothesis E**: Silent JavaScript errors are preventing execution

### 4. Experimentation

Below are experiments designed to test each hypothesis:

## Experiment 1: Verify Build Process

**Goal**: Confirm our changes are included in the final bundle.js file

**Method**:
1. Add a distinctive console log message in the PlayerCamera.ts file:
   ```typescript
   console.log("CAMERA_TEST_ID_12345: Camera code is loaded");
   ```
2. Rebuild the project
3. Open browser dev tools and check if this message appears in the console
4. Examine the bundle.js file to verify our code is included

**Expected Results**: If our code is properly bundled, we'll see the test message in the console when the game loads.

## Experiment 2: Input System Testing

**Goal**: Verify mouse input is being captured and processed

**Method**:
1. Add logging to the PlayerInput class:
   ```typescript
   // In _onMouseMove handler
   console.log(`Mouse move detected - RAW dx: ${e.movementX}, dy: ${e.movementY}`);
   console.log(`Processed movement - x: ${this.movementX}, y: ${this.movementY}`);
   ```
2. Add logging to PlayerCamera.update():
   ```typescript
   console.log(`Camera update - input.movementX: ${this._input.movementX}, movementY: ${this._input.movementY}`);
   ```
3. Check if pointer lock is being established:
   ```typescript
   // Add to PlayerInput class
   document.addEventListener("pointerlockchange", () => {
     console.log("Pointer lock state changed:", 
       document.pointerLockElement === this._scene.getEngine().getRenderingCanvas());
   });
   ```

**Expected Results**: We should see continuous logging of mouse movements when moving the mouse, and confirmation that pointer lock is established.

## Experiment 3: Player-Camera Attachment

**Goal**: Verify the camera is properly attached to the player entity

**Method**:
1. Add visual debug elements:
   ```typescript
   // In PlayerCamera.attach() method
   const debugSphere = MeshBuilder.CreateSphere("playerAttachDebug", {diameter: 0.3}, this._scene);
   debugSphere.parent = this.player;
   debugSphere.position = new Vector3(0, this.FP_CAMERA_HEIGHT, 0);
   const debugMaterial = new StandardMaterial("debugMat", this._scene);
   debugMaterial.emissiveColor = new Color3(0, 1, 0); // Green for visibility
   debugSphere.material = debugMaterial;
   ```
2. Add attachment logging:
   ```typescript
   console.log("ATTACHMENT_TEST: Camera attached to player", {
     playerExists: !!this.player,
     playerPosition: this.player ? this.player.position : null,
     cameraPosition: this.camera.position,
     camRootPosition: this._camRoot.position
   });
   ```

**Expected Results**: We should see a green sphere at eye level on the player, and detailed logs about the attachment process.

## Experiment 4: Code Execution Order

**Goal**: Determine if other code is overriding our camera settings

**Method**:
1. Add timestamped logs to track initialization sequence:
   ```typescript
   console.log(`[${Date.now()}] PlayerCamera initialized`);
   ```
2. Add similar logs in other components that might affect the camera
3. Add a delayed verification check:
   ```typescript
   // In PlayerCamera constructor
   setTimeout(() => {
     console.log("DELAYED_CHECK: Verifying camera settings after 2 seconds", {
       fpCameraHeight: this.FP_CAMERA_HEIGHT,
       actualCameraY: this._fpsCamRoot.position.y,
       isFirstPerson: this._isFirstPerson
     });
   }, 2000);
   ```

**Expected Results**: We should see a clear sequence of initialization events and confirmation that our settings persist after 2 seconds.

## Experiment 5: Error Detection

**Goal**: Catch any silent errors that might be preventing camera code execution

**Method**:
1. Wrap key methods in try/catch blocks:
   ```typescript
   public update(): void {
     try {
       // Existing update code
     } catch (error) {
       console.error("ERROR IN CAMERA UPDATE:", error);
     }
   }
   ```
2. Add global error handler:
   ```typescript
   // Add to the main initialization code
   window.addEventListener('error', (event) => {
     console.error('Global error caught:', event.error);
   });
   ```

**Expected Results**: Any errors in the camera code will be explicitly logged rather than failing silently.

## Logging Framework

To systematically collect data across these experiments, implement a dedicated logging system:

```typescript
// Add to a new file: src/client/Utils/DebugLogger.ts
export class DebugLogger {
  static CAMERA_DEBUG = true;
  
  static log(category: string, message: string, data?: any): void {
    if (!this.CAMERA_DEBUG) return;
    
    console.log(`[${category}] ${message}`, data || '');
    
    // Optionally save to localStorage for persistence
    const logs = JSON.parse(localStorage.getItem('cameraDebugLogs') || '[]');
    logs.push({
      timestamp: Date.now(),
      category,
      message,
      data: data ? JSON.stringify(data) : null
    });
    
    // Keep only last 100 logs
    if (logs.length > 100) logs.shift();
    localStorage.setItem('cameraDebugLogs', JSON.stringify(logs));
  }
  
  static showStoredLogs(): void {
    console.table(JSON.parse(localStorage.getItem('cameraDebugLogs') || '[]'));
  }
}
```

Use this logger in your experiments:

```typescript
// Example usage
import { DebugLogger } from "../Utils/DebugLogger";
// ...
DebugLogger.log("CAMERA", "Initialized with height", this.FP_CAMERA_HEIGHT);
```

## Analysis Procedure

After running the experiments:

1. Review all console logs chronologically
2. Look for any error messages or unexpected values
3. Compare actual values to expected values
4. Identify any missing log messages that should have appeared
5. Note the timing of events to understand execution order

Based on the results, you'll be able to determine which hypothesis is correct and proceed with the appropriate fix. 