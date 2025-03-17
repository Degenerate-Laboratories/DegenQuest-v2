import { Scene } from "@babylonjs/core/scene";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { GameController } from "./GameController";
import { UserInterface } from "./UserInterface";
import { GameScene } from "../Screens/GameScene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ServerMsg } from "../shared/types";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

export class PlayerInput {
    private _gameScene: GameScene;
    private _scene: Scene;
    private _game: GameController;
    private _room: any;
    private _ui: any;

    // Simple movement (legacy)
    public angle: number = 0;
    public horizontal: number = 0;
    public vertical: number = 0;

    // FPS movement keys
    public key_w: boolean = false;
    public key_a: boolean = false;
    public key_s: boolean = false;
    public key_d: boolean = false;
    public key_space: boolean = false;
    public key_shift: boolean = false;
    
    // Jumping properties
    public canJump: boolean = true;
    public jumpForce: number = 0.7;
    
    // Directional movement for FPS
    public moveForward: number = 0;
    public moveRight: number = 0;
    public moveDirection: Vector3 = new Vector3();

    // Legacy keyboard
    public top_arrow: boolean = false;
    public down_arrow: boolean = false;
    public left_arrow: boolean = false;
    public right_arrow: boolean = false;

    // Mouse
    public left_click: boolean = false;
    public right_click: boolean = false;
    public middle_click: boolean = false;
    public mouse_moving: boolean = false;
    public left_alt_pressed: boolean = false;
    public keyboard_c: boolean = false;

    // Movement control flags
    public player_can_move: boolean = true; // Default to true for FPS
    
    // Digits
    public digit_pressed: number = 0;

    public movementX: number = 0;
    public movementY: number = 0;

    // Timers
    public movementTimer: ReturnType<typeof setInterval> | null = null;
    public movementTimerNow: number = 0;
    public movementTimerDelay: number = 200;

    constructor(gameScene: GameScene) {
        this._gameScene = gameScene;
        this._game = gameScene._game;
        this._scene = gameScene._scene;
        this._room = this._game.currentRoom;
        this._ui = gameScene._ui;

        // Initialize input handlers if scene is available
        if (this._scene) {
            this._setupMouseInputs();
            this._setupKeyboardInputs();
            
            // Set up rendering observable for movement direction calculation
            if (this._scene.onBeforeRenderObservable) {
                this._scene.onBeforeRenderObservable.add(() => {
                    this._updateMovementDirection();
                });
            } else {
                console.warn("onBeforeRenderObservable not available in scene");
            }
        } else {
            console.warn("Scene not available in PlayerInput constructor");
        }
    }

    private _setupMouseInputs(): void {
        // Make sure scene and pointer observable are available
        if (!this._scene || !this._scene.onPointerObservable) {
            console.warn("Scene or pointer observable not available for mouse input setup");
            return;
        }
        
        // Detect mouse movement
        this._scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                // Left click
                if (pointerInfo.event.button == 0) {
                    this.left_click = true;
                    this.startMovementTimer();
                }

                // Middle click
                if (pointerInfo.event.button == 1) {
                    this.middle_click = true;
                }

                // Right click
                if (pointerInfo.event.button == 2) {
                    this.right_click = true;
                }
            }

            if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                // Left click
                if (pointerInfo.event.button == 0) {
                    this.left_click = false;

                    if (this.movementTimer) {
                        this.movementTimerNow = 0;
                        clearInterval(this.movementTimer);
                        this.movementTimer = null;
                    }
                }

                // Middle click
                if (pointerInfo.event.button == 1) {
                    this.middle_click = false;
                }

                // Right click
                if (pointerInfo.event.button == 2) {
                    this.right_click = false;
                }

                this.mouse_moving = false;
            }

            // Mouse movement handling
            if (this.left_click) {
                let dpi = window.devicePixelRatio;
                const x = ((pointerInfo.event.clientX * dpi) / pointerInfo.event.target.width) * 2 - 1;
                const y = ((pointerInfo.event.clientY * dpi) / pointerInfo.event.target.height) * 2 - 1;
                this.angle = Math.atan2(x, y);
                this.calculateVelocityForces();
            }

            if (this.right_click) {
                this.mouse_moving = true;
            }

            if (this.middle_click) {
                this.movementX = pointerInfo.event.movementX / 100;
                this.movementY = pointerInfo.event.movementY / 75;
            }
        });
    }

    private _setupKeyboardInputs(): void {
        // Make sure scene and keyboard observable are available
        if (!this._scene || !this._scene.onKeyboardObservable) {
            console.warn("Scene or keyboard observable not available for keyboard input setup");
            return;
        }
        
        this._scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    // FPS controls - WASD
                    if (kbInfo.event.code === "KeyW") this.key_w = true;
                    if (kbInfo.event.code === "KeyA") this.key_a = true;
                    if (kbInfo.event.code === "KeyS") this.key_s = true;
                    if (kbInfo.event.code === "KeyD") this.key_d = true;
                    
                    // Jump
                    if (kbInfo.event.code === "Space") {
                        this.key_space = true;
                        this._handleJump();
                    }
                    
                    // Sprint
                    if (kbInfo.event.code === "ShiftLeft" || kbInfo.event.code === "ShiftRight") {
                        this.key_shift = true;
                    }
                    
                    // Game UI and chat controls
                    if (kbInfo.event.code === "Enter") {
                        if (this._ui && this._ui._ChatBox) {
                            this._ui._ChatBox.chatInput.focus();
                        }
                    }

                    // Digit keys for hotbar and abilities
                    this._handleDigitPress(kbInfo.event.code);
                    
                    // Debug mode not needed for Next.js version
                    
                    break;

                case KeyboardEventTypes.KEYUP:
                    // FPS controls - WASD
                    if (kbInfo.event.code === "KeyW") this.key_w = false;
                    if (kbInfo.event.code === "KeyA") this.key_a = false;
                    if (kbInfo.event.code === "KeyS") this.key_s = false;
                    if (kbInfo.event.code === "KeyD") this.key_d = false;
                    if (kbInfo.event.code === "Space") this.key_space = false;
                    
                    // Sprint
                    if (kbInfo.event.code === "ShiftLeft" || kbInfo.event.code === "ShiftRight") {
                        this.key_shift = false;
                    }

                    // Legacy movement reset
                    if (
                        kbInfo.event.code === "ArrowUp" ||
                        kbInfo.event.code === "ArrowLeft" ||
                        kbInfo.event.code === "ArrowRight" ||
                        kbInfo.event.code === "ArrowDown"
                    ) {
                        // Only reset legacy movement
                        this.vertical = 0;
                        this.horizontal = 0;
                        this.angle = 0;
                    }

                    // Other key releases
                    if (kbInfo.event.code === "KeyC") {
                        this.keyboard_c = false;
                    }

                    if (kbInfo.event.code === "ControlLeft") {
                        this.left_alt_pressed = false;
                    }
                    break;
            }
        });
    }
    
    /**
     * Handle jump functionality
     */
    private _handleJump(): void {
        if (this.canJump && this._gameScene && this._gameScene._scene) {
            // Apply upward force for jump
            this._gameScene._scene.gravity = new Vector3(0, this.jumpForce, 0);
            this.canJump = false;
            
            // Debug
            console.log("Jump initiated");
        }
    }
    
    /**
     * Handle digit key presses (1-9)
     */
    private _handleDigitPress(keyCode: string): void {
        if (keyCode === "Digit1") this.digit_pressed = 1;
        if (keyCode === "Digit2") this.digit_pressed = 2;
        if (keyCode === "Digit3") this.digit_pressed = 3;
        if (keyCode === "Digit4") this.digit_pressed = 4;
        if (keyCode === "Digit5") this.digit_pressed = 5;
        if (keyCode === "Digit6") this.digit_pressed = 6;
        if (keyCode === "Digit7") this.digit_pressed = 7;
        if (keyCode === "Digit8") this.digit_pressed = 8;
        if (keyCode === "Digit9") this.digit_pressed = 9;
        if (keyCode === "Digit0") this.digit_pressed = 0;
    }

    /**
     * Update movement direction based on input keys
     */
    private _updateMovementDirection(): void {
        // Reset movement values
        this.moveForward = 0;
        this.moveRight = 0;
        
        // Only process movement if player can move
        if (!this.player_can_move) return;
        
        // Calculate forward/backward movement
        if (this.key_w) this.moveForward = 1;
        if (this.key_s) this.moveForward = -1;
        
        // Calculate left/right movement
        if (this.key_a) this.moveRight = -1;
        if (this.key_d) this.moveRight = 1;
        
        // If we have any movement, normalize for diagonal movement
        if (this.moveForward !== 0 || this.moveRight !== 0) {
            const camera = this._gameScene._camera as FreeCamera;
            if (!camera) return;
            
            // Get camera forward and right directions
            const forward = camera.getDirection(Vector3.Forward());
            const right = camera.getDirection(Vector3.Right());
            
            // Zero out Y component for ground movement
            forward.y = 0;
            right.y = 0;
            
            // Normalize the vectors
            if (forward.length() > 0) forward.normalize();
            if (right.length() > 0) right.normalize();
            
            // Calculate movement direction
            const moveDirection = new Vector3(0, 0, 0);
            moveDirection.addInPlace(forward.scale(this.moveForward));
            moveDirection.addInPlace(right.scale(this.moveRight));
            
            // Normalize if not zero length
            if (moveDirection.length() > 0) {
                moveDirection.normalize();
            }
            
            // Apply sprint multiplier if shift is pressed
            const speedMultiplier = this.key_shift ? 1.5 : 1.0;
            moveDirection.scaleInPlace(speedMultiplier);
            
            // Set the final movement direction
            this.moveDirection = moveDirection;
        }
    }

    /**
     * Starts the movement timer for continuous movement
     */
    private startMovementTimer(): void {
        // Clear any existing timer
        if (this.movementTimer) {
            clearInterval(this.movementTimer);
            this.movementTimer = null;
        }
        
        // Start a new timer
        this.movementTimer = setInterval(() => {
            this.movementTimerNow += 1;
            // Add logic here for continuous movement if needed
        }, this.movementTimerDelay);
    }
    
    /**
     * Calculate velocity forces based on mouse input
     */
    private calculateVelocityForces(): void {
        // Calculate horizontal and vertical movement based on angle
        this.horizontal = Math.sin(this.angle);
        this.vertical = Math.cos(this.angle);
    }
}
