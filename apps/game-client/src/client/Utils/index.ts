const isLocal = function () {
    return window.location.host === "localhost:8080";
};


const apiUrl = function (port) {
    // Use the Network class's httpUrl property instead
    // This function is left for backward compatibility
    console.warn("apiUrl is deprecated. Use client.httpUrl instead");
    
    // If we're in local dev, use localhost with port
    if (isLocal()) {
        return "http://localhost:" + port;
    } else {
        // In production, return empty string - forcing use of client.httpUrl
        return "";
    }
};

export { isLocal, apiUrl };
