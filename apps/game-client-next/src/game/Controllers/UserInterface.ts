import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { GameController } from "./GameController";

/**
 * Simplified UserInterface class for Next.js version
 * Provides a minimal implementation for compatibility
 */
export class UserInterface {
    private _scene: Scene;
    private _game: GameController;
    private _advancedTexture: AdvancedDynamicTexture;
    private _debugText: TextBlock;
    private _fpsText: TextBlock;
    private _currentPlayer: any = null;
    public _ChatBox: {
        addNotificationMessage: (type: string, title: string, message: string) => void;
    };
    
    constructor(game: GameController, scene: Scene) {
        this._game = game;
        this._scene = scene;
        
        // Create fullscreen UI
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
        
        // Initialize chat box
        this._ChatBox = {
            addNotificationMessage: (type: string, title: string, message: string) => {
                console.log(`Notification [${type}]: ${title} - ${message}`);
                this.showMessage(`${title}: ${message}`);
            }
        };
        
        // Create debug text
        this._debugText = new TextBlock();
        this._debugText.text = "Debug Info";
        this._debugText.color = "white";
        this._debugText.fontSize = 14;
        this._debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._debugText.left = 10;
        this._debugText.top = 10;
        this._advancedTexture.addControl(this._debugText);
        
        // Create FPS counter
        this._fpsText = new TextBlock();
        this._fpsText.text = "FPS: 0";
        this._fpsText.color = "white";
        this._fpsText.fontSize = 14;
        this._fpsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._fpsText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._fpsText.left = -10;
        this._fpsText.top = 10;
        this._advancedTexture.addControl(this._fpsText);
        
        // Update FPS counter - only add if scene is properly initialized
        if (scene && scene.onBeforeRenderObservable) {
            scene.onBeforeRenderObservable.add(() => {
                this._fpsText.text = `FPS: ${Math.round(scene.getEngine().getFps())}`;
            });
        } else {
            console.warn("Scene not properly initialized in UserInterface constructor");
        }
        
        console.log("UserInterface initialized for Next.js");
    }
    
    /**
     * Set the current player
     */
    public setCurrentPlayer(player: any): void {
        this._currentPlayer = player;
        this.updateDebugInfo();
    }
    
    /**
     * Update debug information
     */
    private updateDebugInfo(): void {
        if (this._currentPlayer) {
            this._debugText.text = `Player: ${this._currentPlayer.sessionId || 'Unknown'}\nLocation: ${this._game.currentLocationKey}`;
        } else {
            this._debugText.text = "No player connected";
        }
    }
    
    /**
     * Show a message to the user
     */
    public showMessage(message: string, duration: number = 3000): void {
        // Create message container
        const messageContainer = new Rectangle();
        messageContainer.width = 0.4;
        messageContainer.height = "40px";
        messageContainer.cornerRadius = 10;
        messageContainer.color = "white";
        messageContainer.thickness = 1;
        messageContainer.background = "black";
        messageContainer.alpha = 0.7;
        messageContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        messageContainer.top = -50;
        
        // Create message text
        const messageText = new TextBlock();
        messageText.text = message;
        messageText.color = "white";
        messageText.fontSize = 16;
        
        // Add text to container
        messageContainer.addControl(messageText);
        
        // Add container to UI
        this._advancedTexture.addControl(messageContainer);
        
        // Remove after duration
        setTimeout(() => {
            this._advancedTexture.removeControl(messageContainer);
        }, duration);
    }
    
    /**
     * Dispose of UI resources
     */
    public dispose(): void {
        if (this._advancedTexture) {
            this._advancedTexture.dispose();
        }
    }
    
    /**
     * Update method called on regular interval from GameScene
     */
    public update(): void {
        // Update UI elements that need regular updates
        this.updateDebugInfo();
    }
    
    /**
     * Slow update method called less frequently from GameScene
     */
    public slow_update(): void {
        // Update UI elements that don't need frequent updates
    }
    
    /**
     * Resize method called when window is resized
     */
    public resize(): void {
        // Handle resize events if needed
        if (this._advancedTexture) {
            this._advancedTexture.markAsDirty();
        }
    }
}
