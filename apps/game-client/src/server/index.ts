// Colyseus + Express
import { createServer } from "http";
import express from "express";
import cors from "cors";
import path from "path";

import { Server, matchMaker } from "@colyseus/core";
import { monitor } from "@colyseus/monitor";
// Comment out playground import to fix Docker build
// import { playground } from "@colyseus/playground";

import { WebSocketTransport } from "@colyseus/ws-transport";
import { GameRoom } from "./rooms/GameRoom";
import { ChatRoom } from "./rooms/ChatRoom";

import { Api } from "./Api";
import { Database } from "./Database";

import Logger from "./utils/Logger";
import { Config } from "../shared/Config";

import "dotenv/config";

// Import health endpoint
// @ts-ignore - This is a JS file we're importing into TS
const { initHealthEndpoint } = require('./health');

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

class GameServer {
    public api;
    public database: Database;
    public config: Config;

    constructor() {
        this.config = new Config();
        this.init();
    }

    async init() {
        // start db
        this.database = new Database(this.config);
        await this.database.init();
        await this.database.create();

        //////////////////////////////////////////////////
        ///////////// COLYSEUS GAME SERVER ///////////////
        //////////////////////////////////////////////////
        const port = this.config.port;
        const app = express();
        app.use(cors());

        // Register health endpoint
        initHealthEndpoint(app, {
            dbSchemaVersion: '1.0', // Hardcoded for now until we implement schema versioning
            e2eTestStatus: process.env.E2E_TESTS_PASS || 'not_run'
        });

        // create colyseus server
        const gameServer = new Server({
            transport: new WebSocketTransport({
                server: createServer(app),
            }),
        });

        // define all rooms
        gameServer.define("game_room", GameRoom);
        gameServer.define("chat_room", ChatRoom);

        // on localhost, simulate bad latency
        if (process.env.NODE_ENV !== "production") {
            Logger.info("[gameserver] Simulating 200ms of latency.");
            gameServer.simulateLatency(250);
        }

        // listen
        gameServer.listen(port).then(() => {
            // server is now running
            Logger.info("[gameserver] listening on http://0.0.0.0:" + port);

            // create town room
            //matchMaker.createRoom("game_room", { location: "lh_town" });

            // create island room
            //matchMaker.createRoom("game_room", { location: "lh_dungeon_01" });
        });

        // start monitor
        app.use("/colyseus", monitor());

        // start dev routes
        if (process.env.NODE_ENV !== "production") {
            // Comment out playground to fix Docker build
            // app.use("/playground", playground);
        }

        //////////////////////////////////////////////////
        //// SERVING CLIENT DIST FOLDER TO EXPRESS ///////
        /////////////////////////////////////////////////
        
        // Setup static file serving for client
        const clientPath = path.resolve(__dirname, "../../dist/client");
        app.use(express.static(clientPath));
        Logger.info(`[gameserver] serving client files from ${clientPath}`);
        
        // Catch-all route to serve index.html for client-side routing
        app.get('*', (req, res, next) => {
            // Skip API routes
            if (req.path.startsWith('/api') || 
                req.path.startsWith('/colyseus') || 
                req.path.startsWith('/health')) {
                return next();
            }
            
            res.sendFile(path.join(clientPath, 'index.html'));
        });

        //////////////////////////////////////////////////
        ///////////// API SERVER ////////////////////////
        //////////////////////////////////////////////////
        // start api
        this.api = new Api(app, this.database);
    }
}

// start the gameserver
const gameServer = new GameServer();

// export variables for testing
export { gameServer };
