import axios from "axios";
import { Ability, Race, Item, Quest } from "../../../shared/types";
import { GameData } from "../../GameData";

export class gameDataCTRL {
    private _gameData = {
        items: [],
        abilities: [],
        locations: [],
        races: [],
        quests: [],
    };

    constructor() {}

    async initialize() {
        try {
            // Direct initialization instead of API call to avoid localhost dependencies
            this._gameData = {
                items: GameData.load("items"),
                abilities: GameData.load("abilities"),
                locations: GameData.load("locations"),
                races: GameData.load("races"),
                quests: GameData.load("quests"),
            };
            
            console.log("[gameDataCTRL] Game data initialized successfully");
        } catch (error) {
            console.error("[gameDataCTRL] Failed to initialize game data:", error);
            // Initialize with empty data to prevent crashes
            this._gameData = {
                items: [],
                abilities: [],
                locations: [],
                races: [],
                quests: [],
            };
        }
    }

    public get(type, key) {
        let returnData;
        switch (type) {
            case "ability":
                returnData = (this._gameData.abilities[key] as Ability) ?? false;
                break;
            case "race":
                returnData = (this._gameData.races[key] as Race) ?? false;
                break;
            case "location":
                returnData = this._gameData.locations[key] ?? false;
                break;
            case "item":
                returnData = (this._gameData.items[key] as Item) ?? false;
                break;
            case "quest":
                returnData = (this._gameData.quests[key] as Quest) ?? false;
                break;
            case "":
                returnData = false;
                break;
        }
        return returnData;
    }

    public load(type) {
        let returnData;
        switch (type) {
            case "abilities":
                returnData = this._gameData.abilities ?? false;
                break;
            case "races":
                returnData = this._gameData.races ?? false;
                break;
            case "locations":
                returnData = this._gameData.locations ?? false;
                break;
            case "items":
                returnData = this._gameData.items ?? false;
                break;
            case "quests":
                returnData = this._gameData.quests ?? false;
                break;
            case "":
                returnData = false;
                break;
        }

        return returnData;
    }
}
