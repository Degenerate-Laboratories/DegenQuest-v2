import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    StackPanel,
    TextBlock,
    Rectangle,
} from "@babylonjs/gui/2D";
import State from "./Screens";
import { Config } from "../../shared/Config";
import { Network } from "../Controllers/Network";

export class ServerSelectionScene {
    _scene: Scene;
    _ui: AdvancedDynamicTexture;
    config: Config;
    game: any;
    selectedServer: string = "remote"; // Default to remote server
    statusText: TextBlock;

    createScene(game) {
        console.log("%c[ServerSelection] Creating server selection scene", "color: red; font-weight: bold");
        
        try {
            // store ref to game
            this.game = game;
            this.config = game.config || new Config();
    
            // create scene
            this._scene = new Scene(game.engine);
            this._scene.clearColor.set(0, 0, 0, 1); // Black background for better contrast
            
            console.log("%c[ServerSelection] Scene created with black background", "color: green; font-weight: bold");
            
            // Create a camera - REQUIRED for rendering
            const camera = new ArcRotateCamera("Camera", 0, 0, 10, Vector3.Zero(), this._scene);
            camera.setPosition(new Vector3(0, 0, -10));
            camera.attachControl(game.engine.getRenderingCanvas(), true);
            console.log("%c[ServerSelection] Camera created", "color: green; font-weight: bold");
            
            // create fullscreen UI
            this._ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
            
            console.log("%c[ServerSelection] UI created", "color: green; font-weight: bold");
    
            // create main container
            const mainContainer = new Rectangle();
            mainContainer.width = this.config.UI_CENTER_PANEL_WIDTH || 0.6;
            mainContainer.height = "0.8";
            mainContainer.cornerRadius = 10;
            mainContainer.color = "white"; // White border for better visibility
            mainContainer.thickness = 3;
            mainContainer.background = "rgba(0,0,0,0.8)"; // Darker background for better contrast
            this._ui.addControl(mainContainer);
            
            console.log("%c[ServerSelection] Main container created", "color: green; font-weight: bold");
    
            // create stack panel for content
            const stackPanel = new StackPanel();
            stackPanel.width = "100%";
            stackPanel.top = "-50px";
            mainContainer.addControl(stackPanel);
    
            // title
            const titleText = new TextBlock();
            titleText.text = "SELECT SERVER";
            titleText.height = "100px";
            titleText.color = "white";
            titleText.fontSize = 36;
            titleText.fontStyle = "bold";
            stackPanel.addControl(titleText);
            
            console.log("%c[ServerSelection] Title added", "color: green; font-weight: bold");
    
            // server options
            const serversPanel = new StackPanel();
            serversPanel.width = "80%";
            serversPanel.height = "200px";
            serversPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            serversPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            stackPanel.addControl(serversPanel);
    
            // Remote server option
            const remoteButton = this.createServerButton("REMOTE SERVER", "Connect to the official remote server");
            remoteButton.onPointerClickObservable.add(() => {
                this.selectedServer = "remote";
                this.highlightSelectedButton(remoteButton, localButton);
                titleText.text = "REMOTE SERVER SELECTED";
                console.log("%c[ServerSelection] Remote server selected", "color: green; font-weight: bold");
            });
            serversPanel.addControl(remoteButton);
    
            // Local server option
            const localButton = this.createServerButton("LOCAL SERVER", "Connect to a server running on your local machine");
            localButton.onPointerClickObservable.add(() => {
                this.selectedServer = "local";
                this.highlightSelectedButton(localButton, remoteButton);
                titleText.text = "LOCAL SERVER SELECTED";
                console.log("%c[ServerSelection] Local server selected", "color: green; font-weight: bold");
            });
            serversPanel.addControl(localButton);
    
            // Highlight the default option
            this.highlightSelectedButton(remoteButton, localButton);
            
            console.log("%c[ServerSelection] Server buttons created", "color: green; font-weight: bold");
    
            // Create status text
            this.statusText = new TextBlock();
            this.statusText.text = "Ready to connect";
            this.statusText.color = "yellow";
            this.statusText.fontSize = 16;
            this.statusText.height = "30px";
            stackPanel.addControl(this.statusText);
            
            // Continue button
            const continueButton = Button.CreateSimpleButton("continueButton", "CONTINUE");
            continueButton.width = "200px";
            continueButton.height = "60px";
            continueButton.color = "white";
            continueButton.background = this.config.UI_PRIMARY_COLOR || "rgba(35, 168, 28, 0.8)";
            continueButton.fontSize = 18;
            continueButton.thickness = 0;
            continueButton.cornerRadius = 5;
            continueButton.top = "80px";
            continueButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            continueButton.onPointerClickObservable.add(() => {
                console.log("%c[ServerSelection] Continue button clicked", "color: green; font-weight: bold");
                titleText.text = "CONNECTING...";
                this.updateStatusText("Establishing connection...");
                
                try {
                    // Recreate the network client with the selected server
                    if (this.selectedServer === "local") {
                        // Replace the client with local server URL
                        const port = this.config.port || 3000;
                        const serverUrl = `ws://localhost:${port}`;
                        this.game.client = new Network(port, serverUrl);
                        console.log("%c[ServerSelection] LOCAL SERVER SELECTED", "color: red; font-weight: bold");
                    } else {
                        // Replace the client with remote server URL
                        const remoteUrl = "ws://134.199.184.18";
                        this.game.client = new Network(this.config.port || 3000, remoteUrl);
                        console.log("%c[ServerSelection] REMOTE SERVER SELECTED", "color: red; font-weight: bold");
                    }
                    
                    // Update status after connection attempt
                    this.updateStatusText("Connection successful, moving to login...");
                    
                    // Remove the alert that blocks the UI
                    // Move directly to login screen
                    if (this.game.setScene) {
                        this.game.setScene(State.LOGIN);
                        console.log("%c[ServerSelection] Moving to LOGIN scene", "color: green; font-weight: bold");
                    } else {
                        console.error("%c[ServerSelection] Game.setScene method not found!", "color: red; font-weight: bold");
                    }
                    
                } catch (error) {
                    console.error("%c[ServerSelection] ERROR:", "color: red; font-weight: bold", error);
                    titleText.text = "ERROR: " + error.message;
                    
                    // Create error message in UI
                    const errorMsg = new TextBlock();
                    errorMsg.text = "Error details: " + error.toString();
                    errorMsg.color = "red";
                    errorMsg.fontSize = 14;
                    errorMsg.height = "60px";
                    stackPanel.addControl(errorMsg);
                    
                    // Try again button
                    const retryButton = Button.CreateSimpleButton("retryButton", "TRY AGAIN");
                    retryButton.width = "150px";
                    retryButton.height = "40px";
                    retryButton.color = "white";
                    retryButton.background = "red";
                    retryButton.thickness = 0;
                    retryButton.cornerRadius = 5;
                    retryButton.onPointerClickObservable.add(() => {
                        // Reload the page to retry
                        window.location.reload();
                    });
                    stackPanel.addControl(retryButton);
                }
            });
            stackPanel.addControl(continueButton);
            
            console.log("%c[ServerSelection] Continue button added", "color: green; font-weight: bold");
            console.log("%c[ServerSelection] Scene setup COMPLETE", "color: red; font-weight: bold");
            
            return this._scene;
        } catch (error) {
            console.error("%c[ServerSelection] CRITICAL ERROR:", "color: red; font-weight: bold", error);
            alert("Error creating server selection: " + error.message);
            throw error;
        }
    }

    private createServerButton(title: string, description: string): Button {
        const button = Button.CreateSimpleButton(`button_${title}`, "");
        button.width = "100%";
        button.height = "80px";
        button.thickness = 2;
        button.cornerRadius = 5;
        button.color = "white";
        button.background = "rgba(0, 0, 0, 0.3)";
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.paddingBottom = "20px";

        const innerPanel = new StackPanel();
        innerPanel.isVertical = true;
        innerPanel.width = "100%";
        button.addControl(innerPanel);

        const titleText = new TextBlock();
        titleText.text = title;
        titleText.color = "white";
        titleText.fontSize = 20;
        titleText.height = "30px";
        innerPanel.addControl(titleText);

        const descText = new TextBlock();
        descText.text = description;
        descText.color = "lightgray";
        descText.fontSize = 14;
        descText.height = "20px";
        innerPanel.addControl(descText);

        return button;
    }

    private highlightSelectedButton(selectedButton: Button, otherButton: Button): void {
        // Highlight selected
        selectedButton.color = "white";
        selectedButton.background = this.config.UI_PRIMARY_COLOR;
        selectedButton.thickness = 2;
        
        // Unhighlight other
        otherButton.color = "white";
        otherButton.background = "rgba(0, 0, 0, 0.3)";
        otherButton.thickness = 2;
    }

    private updateStatusText(message: string): void {
        if (this.statusText) {
            this.statusText.text = message;
        }
    }

    public resize(): void {
        // Handle resize if needed
        if (this._ui) {
            this._ui.update();
        }
    }
} 