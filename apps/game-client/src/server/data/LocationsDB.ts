import { PlayerSlots, Speed } from "../../shared/types";
import { Vector3 } from "../../shared/Libs/yuka-min";
import { LootTableEntry } from "../../shared/Class/LootTable";

const DEFAULT_LOOT = [
    LootTableEntry("sword_01", 10, 1, 1, 1, 1),
    LootTableEntry("potion_small_blue", 40, 1, 1, 1, 1),
    LootTableEntry("potion_small_red", 25, 1, 1, 1, 1),
    LootTableEntry("shield_01", 5, 1, 1, 1, 1),
    LootTableEntry("armor_01", 5, 1, 1, 1, 1),
    LootTableEntry("amulet_01", 1, 1, 1, 1, 1),
];

let LocationsDB = {
    lh_town: {
        title: "House Defense",
        key: "lh_town",
        mesh: "lh_town",
        sun: true,
        sunIntensity: 0.6,
        spawnPoint: {
            x: 30,
            y: 0.06,
            z: -25,
            rot: -180,
        },
        waterPlane: true,
        skyColor: [0, 0, 0, 1],
        fog: true,
        music: "MUSIC_01",
        dynamic: {
            interactive: [],
            spawns: [
                // Friendly NPCs inside the house
                {
                    key: "house_friendly_1",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(30, 0.06, -25), // Inside house coordinates
                        new Vector3(32, 0.06, -22),
                        new Vector3(28, 0.06, -23),
                        new Vector3(29, 0.06, -27)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 0,
                    head: "Head_Base",
                    name: "Friendly Villager 1",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "The skeletons are outside! I'm glad we're safe in here.",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_2",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(33, 0.06, -24),
                        new Vector3(35, 0.06, -26),
                        new Vector3(34, 0.06, -28),
                        new Vector3(31, 0.06, -27)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 1,
                    head: "Head_Mage",
                    name: "Friendly Villager 2",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "Thank goodness you're here! Those skeletons have surrounded us!",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_3",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(27, 0.06, -26),
                        new Vector3(25, 0.06, -24),
                        new Vector3(28, 0.06, -22),
                        new Vector3(30, 0.06, -23)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 4,
                    head: "Head_Engineer",
                    name: "Friendly Villager 3",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "I've barricaded the windows. Should hold them off for now.",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_4",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(31, 0.06, -21),
                        new Vector3(34, 0.06, -23),
                        new Vector3(33, 0.06, -25),
                        new Vector3(29, 0.06, -24)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 8,
                    head: "Head_Rogue",
                    name: "Friendly Villager 4",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "I managed to grab some food before the skeletons surrounded the house.",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_5",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(26, 0.06, -28),
                        new Vector3(29, 0.06, -30),
                        new Vector3(32, 0.06, -29),
                        new Vector3(28, 0.06, -27)
                    ],
                    amount: 1,
                    race: "humanoid", 
                    material: 12,
                    head: "Head_Paladin",
                    name: "Friendly Villager 5",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "I'll stand guard by the door. No skeleton is getting in here!",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                
                // Skeletons outside the house - North
                {
                    key: "skeleton_north",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(20, 0.06, -40),
                        new Vector3(30, 0.06, -45),
                        new Vector3(40, 0.06, -40),
                        new Vector3(30, 0.06, -35)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
                
                // Skeletons outside the house - South
                {
                    key: "skeleton_south",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(20, 0.06, -10),
                        new Vector3(30, 0.06, -5),
                        new Vector3(40, 0.06, -10),
                        new Vector3(30, 0.06, -15)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
                
                // Skeletons outside the house - East
                {
                    key: "skeleton_east",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(50, 0.06, -20),
                        new Vector3(55, 0.06, -25),
                        new Vector3(50, 0.06, -30),
                        new Vector3(45, 0.06, -25)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
                
                // Skeletons outside the house - West
                {
                    key: "skeleton_west",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(10, 0.06, -20),
                        new Vector3(5, 0.06, -25),
                        new Vector3(10, 0.06, -30),
                        new Vector3(15, 0.06, -25)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
            ],
        },
    },
    training_ground: {
        title: "Training Ground",
        key: "training_ground",
        mesh: "training_ground",
        sun: true,
        sunIntensity: 1,
        fog: false,
        spawnPoint: {
            x: 0,
            y: 0,
            z: 0,
            rot: -180,
        },
        waterPlane: false,
        skyColor: [0, 0, 0, 1],
        music: "MUSIC_01",
        dynamic: {
            interactive: [],
            spawns: [
                {
                    key: "spawn_01",
                    type: "static",
                    behaviour: "idle",
                    aggressive: true,
                    canAttack: true,
                    points: [new Vector3(8.67, 0, -14.59)],
                    amount: 1,
                    baseHealth: 8000,
                    race: "skeleton_01",
                    material: 0,
                    name: "Dummy 2",
                    baseSpeed: Speed.VERY_SLOW,
                },
                {
                    key: "spawn_02",
                    type: "global",
                    behaviour: "area",
                    aggressive: true,
                    canAttack: true,
                    points: [new Vector3(12, 0, -14.59)],
                    amount: 1,
                    race: "skeleton_01",
                    material: 0,
                    name: "Dummy 1",

                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 2, // multiplicater for damage
                    experienceGain: { min: 5000, max: 10000 },
                    goldGain: { min: 100, max: 200 },
                    equipment: [
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [
                        { key: "base_attack", chance: 0.3 },
                        { key: "fire_dart", chance: 0.7 },
                    ],
                },
            ],
        },
    },
    lh_dungeon_01: {
        title: "Dungeon Level 1",
        key: "lh_dungeon_01",
        mesh: "lh_dungeon_01",
        sun: false,
        sunIntensity: 1,
        fog: false,
        spawnPoint: {
            x: 0,
            y: 0,
            z: 0,
            rot: -180,
        },
        waterPlane: false,
        skyColor: [0, 0, 0, 1],
        music: "MUSIC_01",
        dynamic: {
            interactive: [
                {
                    type: "zone_change",
                    from: new Vector3(1.3, 0.5, -3.3),
                    to_map: "lh_town",
                    to_vector: new Vector3(13, 0, -25.7),
                },
            ],
            spawns: [
                {
                    key: "spawn_01",
                    type: "global",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(-10.6, 0.1, -2.55),
                        new Vector3(-20.54, 0.1, 7.72),
                        new Vector3(-20.75, 0.1, -2.05),
                        new Vector3(-21.42, 0.1, -19.39),
                        new Vector3(-14.59, 0.1, -30.15),
                        new Vector3(2.78, 0.1, -30.45),
                    ],
                    radius: 0,
                    amount: 25,
                    race: "rat_01",
                    material: 0,
                    name: "Rat",
                    baseSpeed: Speed.VERY_SLOW,
                },
            ],
        },
    },
    house_defense: {
        title: "House Defense",
        key: "house_defense",
        mesh: "lh_town", // Reusing an existing mesh for now
        sun: true,
        sunIntensity: 0.6,
        spawnPoint: {
            x: 30, // Inside the house coordinates
            y: 0,
            z: -25,
            rot: -180,
        },
        waterPlane: false,
        skyColor: [0, 0, 0, 1],
        fog: true,
        music: "MUSIC_01",
        dynamic: {
            interactive: [],
            spawns: [
                // Friendly NPCs inside the house
                {
                    key: "house_friendly_1",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(30, 0.06, -25), // Inside house coordinates
                        new Vector3(32, 0.06, -22),
                        new Vector3(28, 0.06, -23),
                        new Vector3(29, 0.06, -27)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 0,
                    head: "Head_Base",
                    name: "Friendly Villager 1",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "The skeletons are outside! I'm glad we're safe in here.",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_2",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(33, 0.06, -24),
                        new Vector3(35, 0.06, -26),
                        new Vector3(34, 0.06, -28),
                        new Vector3(31, 0.06, -27)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 1,
                    head: "Head_Mage",
                    name: "Friendly Villager 2",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "Thank goodness you're here! Those skeletons have surrounded us!",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_3",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(27, 0.06, -26),
                        new Vector3(25, 0.06, -24),
                        new Vector3(28, 0.06, -22),
                        new Vector3(30, 0.06, -23)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 4,
                    head: "Head_Engineer",
                    name: "Friendly Villager 3",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "I've barricaded the windows. Should hold them off for now.",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_4",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(31, 0.06, -21),
                        new Vector3(34, 0.06, -23),
                        new Vector3(33, 0.06, -25),
                        new Vector3(29, 0.06, -24)
                    ],
                    amount: 1,
                    race: "humanoid",
                    material: 8,
                    head: "Head_Rogue",
                    name: "Friendly Villager 4",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "I managed to grab some food before the skeletons surrounded the house.",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                {
                    key: "house_friendly_5",
                    type: "static",
                    behaviour: "patrol",
                    aggressive: false,
                    canAttack: false,
                    points: [
                        new Vector3(26, 0.06, -28),
                        new Vector3(29, 0.06, -30),
                        new Vector3(32, 0.06, -29),
                        new Vector3(28, 0.06, -27)
                    ],
                    amount: 1,
                    race: "humanoid", 
                    material: 12,
                    head: "Head_Paladin",
                    name: "Friendly Villager 5",
                    baseSpeed: Speed.VERY_SLOW,
                    interactable: {
                        title: "Talk",
                        data: [
                            {
                                type: "text",
                                text: "I'll stand guard by the door. No skeleton is getting in here!",
                                isEndOfDialog: true,
                            },
                        ],
                    },
                },
                
                // Skeletons outside the house - North
                {
                    key: "skeleton_north",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(20, 0.06, -40),
                        new Vector3(30, 0.06, -45),
                        new Vector3(40, 0.06, -40),
                        new Vector3(30, 0.06, -35)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
                
                // Skeletons outside the house - South
                {
                    key: "skeleton_south",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(20, 0.06, -10),
                        new Vector3(30, 0.06, -5),
                        new Vector3(40, 0.06, -10),
                        new Vector3(30, 0.06, -15)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
                
                // Skeletons outside the house - East
                {
                    key: "skeleton_east",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(50, 0.06, -20),
                        new Vector3(55, 0.06, -25),
                        new Vector3(50, 0.06, -30),
                        new Vector3(45, 0.06, -25)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
                
                // Skeletons outside the house - West
                {
                    key: "skeleton_west",
                    type: "area",
                    behaviour: "patrol",
                    aggressive: true,
                    canAttack: true,
                    points: [
                        new Vector3(10, 0.06, -20),
                        new Vector3(5, 0.06, -25),
                        new Vector3(10, 0.06, -30),
                        new Vector3(15, 0.06, -25)
                    ],
                    radius: 0,
                    amount: 10,
                    race: "skeleton_01",
                    material: 0,
                    name: "Skeleton",
                    baseHealth: 100,
                    baseSpeed: Speed.VERY_SLOW,
                    baseDamageMultiplier: 1,
                    experienceGain: { min: 100, max: 200 },
                    goldGain: { min: 10, max: 20 },
                    equipment: [
                        {
                            key: "shield_01",
                            slot: PlayerSlots.OFF_HAND,
                        },
                        {
                            key: "sword_01",
                            slot: PlayerSlots.WEAPON,
                        },
                    ],
                    abilities: [{ key: "base_attack", chance: 1 }],
                    drops: DEFAULT_LOOT,
                },
            ],
        },
    },
};

export { LocationsDB };
