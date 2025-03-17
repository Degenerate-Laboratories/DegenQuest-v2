export class Config {
    // Server configuration
    public host: string = "localhost";
    public port: number = 4001;
    public protocol: string = "ws";
    public apiProtocol: string = "http";
    
    // Game configuration
    public debug: boolean = true;
    public showFPS: boolean = true;
    public showDebugUI: boolean = true;
    
    // Graphics configuration
    public shadows: boolean = true;
    public highQuality: boolean = false;
    public antialiasing: boolean = true;
    public SHADOW_ON: boolean = true;
    
    // Player configuration
    public playerSpeed: number = 0.15;
    public playerJumpHeight: number = 0.3;
    public playerGravity: number = -0.98;
    
    // Default location
    public initialLocation: string = "lh_town";
    
    constructor() {
        // Override settings based on environment
        if (process.env.NODE_ENV === "production") {
            this.debug = false;
            this.showDebugUI = false;
        }
        
        // Override settings based on URL parameters if in browser
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            
            if (urlParams.has("debug")) {
                this.debug = urlParams.get("debug") === "true";
            }
            
            if (urlParams.has("shadows")) {
                this.shadows = urlParams.get("shadows") === "true";
                this.SHADOW_ON = urlParams.get("shadows") === "true";
            }
            
            if (urlParams.has("quality")) {
                this.highQuality = urlParams.get("quality") === "high";
            }
        }
    }
}
