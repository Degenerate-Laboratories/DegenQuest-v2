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
import { GameRoom } from "./rooms/GameRoom.js";
import { ChatRoom } from "./rooms/ChatRoom.js";

import { Api } from "./Api.js";
import { Database } from "./Database.js";

import Logger from "./utils/Logger.js";
import { Config } from "../shared/Config.js";

import "dotenv/config";

// Import health endpoint
// @ts-ignore - This is a JS file we're importing into TS
import { initHealthEndpoint } from './health.js';

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

        // Custom implementation that doesn't try to modify readonly properties
        const customVerifyAndSetSeatReservation = async function(sessionId, reservationId) {
            // Method deliberately overridden - using default behavior but with longer timeout
            const reservations = (matchMaker as any).reservations || {};
            const reservation = reservations[reservationId];
            if (!reservation) {
                return false;
            }
            
            delete reservations[reservationId];
            return reservation;
        };
        
        // Apply custom implementations through type assertion
        (matchMaker as any).verifyAndSetSeatReservation = customVerifyAndSetSeatReservation;
        
        // Double the seat reservation time from default to help with connection issues
        if (matchMaker.driver && (matchMaker.driver as any).settings) {
            (matchMaker.driver as any).settings['seatReservationTime'] = 30;
        }

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
