const isLocal = function () {
    // Check if running on any localhost port
    return window.location.hostname === "localhost";
};

const getServerUrl = function() {
    // If we're in local dev, use localhost
    if (isLocal()) {
        return "localhost:3000";
    }
    
    // Check if we're in a Vercel environment
    if (window.location.hostname.includes('vercel.app')) {
        return "api.degenquest.io"; // Use your domain
    }
    
    // Default production server
    return "api.degenquest.io";
};

const apiUrl = function (port) {
    // Use the Network class's httpUrl property instead
    // This function is left for backward compatibility
    console.warn("apiUrl is deprecated. Use client.httpUrl instead");
    
    // If we're in local dev, use localhost with port
    if (isLocal()) {
        return "http://localhost:" + port;
    } else {
        // Get domain or IP from environment or defaults
        const server = getServerUrl();
        return `http://${server}`;
    }
};

const wsUrl = function (port) {
    // For WebSocket connections
    if (isLocal()) {
        return "ws://localhost:" + port;
    } else {
        // Get domain or IP from environment or defaults
        const server = getServerUrl();
        return `ws://${server}`;
    }
};

export { isLocal, apiUrl, wsUrl, getServerUrl };
