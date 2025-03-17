const isLocal = function () {
    // Check if running on any localhost port
    return window.location.hostname === "localhost";
};


const apiUrl = function (port) {
    // Use the Network class's httpUrl property instead
    // This function is left for backward compatibility
    console.warn("apiUrl is deprecated. Use client.httpUrl instead");
    
    // If we're in local dev, use localhost with port
    if (isLocal()) {
        return "http://localhost:" + port;
    } else {
        // In production, use the production server IP
        return "http://134.199.184.18:80";
    }
};

export { isLocal, apiUrl };
