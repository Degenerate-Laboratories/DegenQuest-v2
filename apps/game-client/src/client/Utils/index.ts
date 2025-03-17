const isLocal = function () {
    return window.location.host === "localhost:8080";
};

const apiUrl = function (port) {
    if (isLocal()) {
        return "http://localhost:" + port;
    } else {
        // In production, return base URL with no port (Network.ts already handles the port)
        return window.location.protocol + "//" + window.location.hostname;
    }
};

export { isLocal, apiUrl };
