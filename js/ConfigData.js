/**
 * 配置数据文件 - 将CSV数据转换为JavaScript对象，避免CORS问题
 * 这个文件包含了所有游戏配置的内置数据
 */

// 卡牌配置数据
const CARD_CONFIG_DATA = [
    {
        name: "打击",
        class: "战士",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "对单体目标造成6点伤害",
        effectCode: "DAMAGE",
        damage: 6,
        // 兼容旧版本的value字段
        value1: 6,
        value2: 0,
        value3: 0
    },
    {
        name: "断筋",
        class: "战士",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "对单体目标造成3点伤害，并使目标速度降低3点，持续5秒",
        effectCode: "DAMAGE_WITH_BUFF",
        damage: 3,
        buff: {
            type: "slow",
            value: 3,
            duration: 5
        },
        // 兼容旧版本的value字段
        value1: 3,
        value2: 3,
        value3: 5
    },
    {
        name: "盾击",
        class: "战士",
        energyCost: 2,
        castTime: 0,
        castType: "瞬发",
        effect: "对单体目标造成4点伤害，并获得3点护甲",
        effectCode: "DAMAGE_WITH_ARMOR",
        damage: 4,
        armor: 3,
        // 兼容旧版本的value字段
        value1: 4,
        value2: 3,
        value3: 0
    },
    {
        name: "血祭",
        class: "战士",
        energyCost: 0,
        castTime: 0,
        castType: "瞬发",
        effect: "消耗2点生命值，造成12点伤害",
        effectCode: "BLOOD_SACRIFICE",
        damage: 12,
        healthCost: 2,
        // 兼容旧版本的value字段
        value1: 12,
        value2: 0,
        value3: 0
    },
    {
        name: "火球术",
        class: "法师",
        energyCost: 2,
        castTime: 1,
        castType: "吟唱",
        effect: "吟唱1秒后，对单体目标造成8点伤害",
        effectCode: "DAMAGE",
        damage: 8,
        // 兼容旧版本的value字段
        value1: 8,
        value2: 0,
        value3: 0
    },
    {
        name: "冰霜新星",
        class: "法师",
        energyCost: 3,
        castTime: 0,
        castType: "瞬发",
        effect: "对所有敌人造成4点伤害，并使其速度降低2点",
        effectCode: "DAMAGE_ALL_WITH_BUFF",
        damage: 4,
        buff: {
            type: "slow",
            value: 2,
            duration: 3
        },
        // 兼容旧版本的value字段
        value1: 4,
        value2: 2,
        value3: 0
    },
    {
        name: "奥术冲击",
        class: "法师",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "消耗当前所有能量，对目标释放一次强力的奥术冲击",
        effectCode: "CONSUME_ALL_ENERGY",
        baseDamage: 2,
        // 兼容旧版本的value字段
        value1: 2,
        value2: 0,
        value3: 0
    },
    {
        name: "毒刃",
        class: "盗贼",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "立刻攻击目标，造成6点伤害，并使其获得3层中毒",
        effectCode: "DAMAGE_WITH_BUFF",
        damage: 6,
        buff: {
            type: "poison",
            value: 3,
            duration: 5
        },
        // 兼容旧版本的value字段
        value1: 6,
        value2: 3,
        value3: 0
    },
    {
        name: "伏击",
        class: "盗贼",
        energyCost: 2,
        castTime: 0,
        castType: "瞬发",
        effect: "只能在潜行状态下使用，立刻攻击，造成15点伤害",
        effectCode: "DAMAGE",
        damage: 15,
        requiresStealth: true,
        // 兼容旧版本的value字段
        value1: 15,
        value2: 0,
        value3: 0
    },
    {
        name: "疾跑",
        class: "盗贼",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "立刻进入潜行状态，最多可持续10秒",
        effectCode: "STEALTH",
        buff: {
            type: "stealth",
            duration: 10
        },
        // 兼容旧版本的value字段
        value1: 10,
        value2: 0,
        value3: 0
    },
    {
        name: "治疗术",
        class: "牧师",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "恢复6点生命值",
        effectCode: "HEAL",
        heal: 6,
        // 兼容旧版本的value字段
        value1: 6,
        value2: 0,
        value3: 0
    },
    {
        name: "神圣新星",
        class: "牧师",
        energyCost: 2,
        castTime: 0,
        castType: "瞬发",
        effect: "对所有友军恢复4点生命值",
        effectCode: "HEAL_ALL",
        heal: 4,
        // 兼容旧版本的value字段
        value1: 4,
        value2: 0,
        value3: 0
    },
    {
        name: "驱散",
        class: "牧师",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "移除目标身上的所有负面效果",
        effectCode: "DISPEL",
        // 兼容旧版本的value字段
        value1: 0,
        value2: 0,
        value3: 0
    }
];

// 英雄技能配置数据
const HERO_SKILL_DATA = [
    {
        class: "战士",
        name: "狂暴",
        description: "增加5点强度，持续10秒",
        cooldown: 15,
        energyCost: 2,
        effectType: "STRENGTH_BOOST",
        value1: 5,
        value2: 0,
        value3: 0,
        duration: 10
    },
    {
        class: "法师",
        name: "奥术强化",
        description: "恢复3点能量，下次法术伤害翻倍",
        cooldown: 20,
        energyCost: 0,
        effectType: "ENERGY_RESTORE_SPELL_BOOST",
        value1: 3,
        value2: 0,
        value3: 0,
        duration: 0
    },
    {
        class: "盗贼",
        name: "暗影步",
        description: "立即进入潜行状态，持续8秒",
        cooldown: 12,
        energyCost: 1,
        effectType: "STEALTH",
        value1: 0,
        value2: 0,
        value3: 0,
        duration: 8
    },
    {
        class: "牧师",
        name: "神圣护盾",
        description: "获得10点护甲，持续15秒",
        cooldown: 18,
        energyCost: 1,
        effectType: "ARMOR_BOOST",
        value1: 10,
        value2: 0,
        value3: 0,
        duration: 15
    }
];

// 角色职业配置数据
const CHARACTER_CLASS_DATA = [
    {
        class: "战士",
        maxHealth: 35,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 2,
        agility: 1,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        description: "高生命值，高物理伤害"
    },
    {
        class: "法师",
        maxHealth: 25,
        maxEnergy: 12,
        initialEnergy: 2,
        strength: 0,
        agility: 0,
        spirit: 3,
        healthRegenRate: 0,
        energyRegenRate: 1,
        description: "高能量，高法术伤害"
    },
    {
        class: "盗贼",
        maxHealth: 28,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 1,
        agility: 3,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        description: "高敏捷，潜行能力"
    },
    {
        class: "牧师",
        maxHealth: 32,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 0,
        agility: 1,
        spirit: 2,
        healthRegenRate: 0.5,
        energyRegenRate: 1,
        description: "平衡属性，治疗能力"
    }
];

// 游戏配置数据
const GAME_CONFIG_DATA = {
    "InitialHandSize": 4,
    "MaxHandSize": 10,
    "DrawInterval": 3,
    "MaxDeckSize": 30,
    "EnergyPerTurn": 1,
    "MaxEnergy": 10,
    "GameVersion": "2.1.0",
    "DefaultPlayerClass": "战士",
    "DefaultComputerClass": "法师"
};

// Monster配置数据
const MONSTER_CONFIG_DATA = [
    {
        id: "goblin_warrior",
        name: "哥布林战士",
        class: "战士",
        description: "一个凶猛的哥布林战士，擅长近战攻击",
        difficulty: 1,
        maxHealth: 30,
        maxEnergy: 8,
        initialEnergy: 1,
        strength: 2,
        agility: 1,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        preferredCards: ["打击", "断筋", "盾击"],
        avoidCards: ["血祭"],
        aiStrategy: "aggressive",
        personality: "reckless"
    },
    {
        id: "dark_mage",
        name: "黑暗法师",
        class: "法师",
        description: "一个强大的黑暗法师，掌握毁灭性法术",
        difficulty: 2,
        maxHealth: 22,
        maxEnergy: 12,
        initialEnergy: 2,
        strength: 0,
        agility: 0,
        spirit: 4,
        healthRegenRate: 0,
        energyRegenRate: 1.2,
        preferredCards: ["火球术", "冰霜新星", "奥术冲击"],
        avoidCards: [],
        aiStrategy: "spell_focused",
        personality: "calculating"
    },
    {
        id: "shadow_assassin",
        name: "影刺客",
        class: "盗贼",
        description: "一个致命的影刺客，擅长潜行和毒药",
        difficulty: 2,
        maxHealth: 25,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 1,
        agility: 4,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        preferredCards: ["毒刃", "伏击", "暗影步"],
        avoidCards: [],
        aiStrategy: "stealth_focused",
        personality: "cautious"
    },
    {
        id: "healing_priest",
        name: "治疗牧师",
        class: "牧师",
        description: "一个虔诚的治疗牧师，擅长治疗和防护",
        difficulty: 1,
        maxHealth: 35,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 0,
        agility: 1,
        spirit: 3,
        healthRegenRate: 1,
        energyRegenRate: 1,
        preferredCards: ["治疗术", "神圣护盾", "祝福"],
        avoidCards: ["血祭"],
        aiStrategy: "defensive",
        personality: "protective"
    },
    {
        id: "berserker",
        name: "狂战士",
        class: "战士",
        description: "一个疯狂的狂战士，不惜一切代价战斗",
        difficulty: 3,
        maxHealth: 40,
        maxEnergy: 8,
        initialEnergy: 1,
        strength: 4,
        agility: 0,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 0.8,
        preferredCards: ["血祭", "打击", "盾击"],
        avoidCards: ["治疗术"],
        aiStrategy: "berserk",
        personality: "reckless"
    },
    {
        id: "elemental_mage",
        name: "元素法师",
        class: "法师",
        description: "一个掌握元素魔法的法师，攻击力强大",
        difficulty: 3,
        maxHealth: 20,
        maxEnergy: 15,
        initialEnergy: 3,
        strength: 0,
        agility: 0,
        spirit: 5,
        healthRegenRate: 0,
        energyRegenRate: 1.5,
        preferredCards: ["火球术", "冰霜新星", "奥术冲击"],
        avoidCards: ["治疗术"],
        aiStrategy: "elemental_burst",
        personality: "aggressive"
    },
    {
        id: "stealth_rogue",
        name: "潜行盗贼",
        class: "盗贼",
        description: "一个精通潜行的盗贼，擅长偷袭",
        difficulty: 2,
        maxHealth: 28,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 1,
        agility: 5,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        preferredCards: ["伏击", "毒刃", "暗影步"],
        avoidCards: ["盾击"],
        aiStrategy: "stealth_ambush",
        personality: "patient"
    },
    {
        id: "battle_priest",
        name: "战斗牧师",
        class: "牧师",
        description: "一个战斗牧师，既能治疗又能战斗",
        difficulty: 2,
        maxHealth: 38,
        maxEnergy: 10,
        initialEnergy: 1,
        strength: 2,
        agility: 1,
        spirit: 2,
        healthRegenRate: 0.5,
        energyRegenRate: 1,
        preferredCards: ["治疗术", "神圣护盾", "打击"],
        avoidCards: ["血祭"],
        aiStrategy: "balanced",
        personality: "disciplined"
    }
];

// 爬塔系统配置数据
const TOWER_CONFIG_DATA = {
    // 地图配置
    TotalLayers: 8,
    MinNodesPerLayer: 2,
    MaxNodesPerLayer: 4,
    MinConnections: 1,
    MaxConnections: 3,
    RestLayerInterval: 3,
    
    // 玩家初始属性
    StartingHealth: 30,
    StartingEnergy: 3,
    StartingGold: 0,
    
    // 奖励配置
    CombatBaseReward: 10,
    CombatLayerBonus: 5,
    TreasureBaseGold: 25,
    TreasureLayerBonus: 10,
    
    // 治疗配置
    RestHealPercent: 0.3,
    
    // Boss配置
    BossHealthMultiplier: 1.5,
    BossEnergyBonus: 1,
    
    // 完成奖励
    TowerCompletionReward: 100,
    TowerCompletionLayerBonus: 20
};

// 爬塔节点类型配置数据
const TOWER_NODE_TYPES_DATA = [
    {
        type: "combat",
        displayName: "战斗",
        icon: "⚔️",
        description: "与敌人战斗获得经验和奖励",
        weight: 60,
        minLayer: 1,
        maxLayer: 7,
        isSpecial: false
    },
    {
        type: "treasure",
        displayName: "宝箱",
        icon: "📦",
        description: "打开宝箱获得珍贵物品",
        weight: 25,
        minLayer: 1,
        maxLayer: 7,
        isSpecial: false
    },
    {
        type: "rest",
        displayName: "休息点",
        icon: "🔥",
        description: "在这里休息恢复生命值或升级卡牌",
        weight: 15,
        minLayer: 1,
        maxLayer: 7,
        isSpecial: false
    },
    {
        type: "boss",
        displayName: "Boss",
        icon: "👹",
        description: "挑战强大的Boss",
        weight: 100,
        minLayer: 8,
        maxLayer: 8,
        isSpecial: true
    },
    {
        type: "start",
        displayName: "起始点",
        icon: "🏠",
        description: "冒险的起点",
        weight: 100,
        minLayer: 0,
        maxLayer: 0,
        isSpecial: true
    },
    {
        type: "elite",
        displayName: "精英",
        icon: "💀",
        description: "强化敌人获得更好奖励",
        weight: 20,
        minLayer: 3,
        maxLayer: 6,
        isSpecial: false
    },
    {
        type: "shop",
        displayName: "商店",
        icon: "🏪",
        description: "购买卡牌和物品",
        weight: 10,
        minLayer: 2,
        maxLayer: 6,
        isSpecial: false
    },
    {
        type: "event",
        displayName: "事件",
        icon: "❓",
        description: "随机事件可能带来机遇或挑战",
        weight: 15,
        minLayer: 1,
        maxLayer: 7,
        isSpecial: false
    }
];

// 爬塔奖励配置数据
const TOWER_REWARDS_DATA = [
    {
        type: "gold",
        icon: "💰",
        baseAmount: 25,
        layerMultiplier: 10,
        probability: 100,
        minLayer: 0,
        maxLayer: 8,
        description: "获得金币"
    },
    {
        type: "health",
        icon: "❤️",
        baseAmount: 5,
        layerMultiplier: 2,
        probability: 30,
        minLayer: 0,
        maxLayer: 8,
        description: "恢复生命值"
    },
    {
        type: "energy",
        icon: "⚡",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 20,
        minLayer: 0,
        maxLayer: 8,
        description: "增加最大能量"
    },
    {
        type: "card_common",
        icon: "🃏",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 40,
        minLayer: 0,
        maxLayer: 8,
        description: "获得普通卡牌"
    },
    {
        type: "card_rare",
        icon: "🎴",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 25,
        minLayer: 2,
        maxLayer: 8,
        description: "获得稀有卡牌"
    },
    {
        type: "card_epic",
        icon: "🎯",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 10,
        minLayer: 4,
        maxLayer: 8,
        description: "获得史诗卡牌"
    },
    {
        type: "card_legendary",
        icon: "⭐",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 5,
        minLayer: 6,
        maxLayer: 8,
        description: "获得传说卡牌"
    },
    {
        type: "relic",
        icon: "🔮",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 15,
        minLayer: 3,
        maxLayer: 8,
        description: "获得遗物"
    },
    {
        type: "potion",
        icon: "🧪",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 20,
        minLayer: 1,
        maxLayer: 8,
        description: "获得药水"
    },
    {
        type: "upgrade_random",
        icon: "⬆️",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 25,
        minLayer: 1,
        maxLayer: 8,
        description: "随机升级一张卡牌"
    },
    {
        type: "remove_card",
        icon: "🗑️",
        baseAmount: 1,
        layerMultiplier: 0,
        probability: 15,
        minLayer: 2,
        maxLayer: 8,
        description: "移除一张卡牌"
    }
];

// Boss配置数据 - 用于爬塔系统的Boss节点
const BOSS_CONFIG_DATA = [
    {
        id: 'goblin',
        name: '地精战士',
        class: '战士',
        difficulty: 1,
        maxHealth: 25,
        maxEnergy: 3,
        initialEnergy: 1,
        strength: 1,
        agility: 1,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        description: '一个弱小但狡猾的地精战士，适合新手练习。',
        icon: '👺',
        preferredCards: ['打击', '断筋'],
        aiStrategy: 'aggressive'
    },
    {
        id: 'orc',
        name: '兽人勇士',
        class: '战士',
        difficulty: 2,
        maxHealth: 35,
        maxEnergy: 3,
        initialEnergy: 1,
        strength: 2,
        agility: 0,
        spirit: 0,
        healthRegenRate: 0.5,
        energyRegenRate: 1,
        description: '强壮的兽人勇士，具有强大的攻击力。',
        icon: '🧌',
        preferredCards: ['打击', '盾击'],
        aiStrategy: 'balanced'
    },
    {
        id: 'skeleton_mage',
        name: '骷髅法师',
        class: '法师',
        difficulty: 2,
        maxHealth: 30,
        maxEnergy: 4,
        initialEnergy: 2,
        strength: 0,
        agility: 1,
        spirit: 2,
        healthRegenRate: 0,
        energyRegenRate: 1.5,
        description: '掌握黑暗魔法的亡灵法师，擅长魔法攻击。',
        icon: '💀',
        preferredCards: ['火球术', '冰霜新星'],
        aiStrategy: 'spell_focused'
    },
    {
        id: 'dragon',
        name: '红龙',
        class: 'Boss',
        difficulty: 5,
        maxHealth: 80,
        maxEnergy: 5,
        initialEnergy: 2,
        strength: 5,
        agility: 2,
        spirit: 3,
        healthRegenRate: 2,
        energyRegenRate: 2,
        description: '强大的红龙，终极挑战对手。',
        icon: '🐲',
        preferredCards: ['火球术', '盾击', '血祭'],
        aiStrategy: 'boss_pattern'
    }
];

// 商店物品配置数据
const SHOP_ITEM_DATA = [
    {
        id: 'health_potion',
        name: '生命药水',
        type: 'potion',
        price: 50,
        icon: '🧪',
        description: '立即恢复15点生命值',
        effect: {
            type: 'heal',
            value: 15
        }
    },
    {
        id: 'energy_potion',
        name: '能量药水',
        type: 'potion',
        price: 30,
        icon: '⚡',
        description: '本场战斗开始时额外获得1点能量',
        effect: {
            type: 'energy_bonus',
            value: 1
        }
    },
    {
        id: 'card_upgrade',
        name: '升级卷轴',
        type: 'upgrade',
        price: 75,
        icon: '📜',
        description: '升级一张卡牌',
        effect: {
            type: 'upgrade_card',
            value: 1
        }
    },
    {
        id: 'card_remove',
        name: '净化之火',
        type: 'service',
        price: 100,
        icon: '🔥',
        description: '从卡组中移除一张卡牌',
        effect: {
            type: 'remove_card',
            value: 1
        }
    }
];

// 随机事件配置数据
const RANDOM_EVENT_DATA = [
    {
        id: 'mysterious_shrine',
        name: '神秘神龛',
        description: '你发现了一个古老的神龛，散发着奇异的光芒。',
        icon: '🛐',
        choices: [
            {
                text: '祈祷（失去10金币，获得祝福）',
                cost: { gold: 10 },
                rewards: [{ type: 'buff', value: 'shrine_blessing' }],
                probability: 100
            },
            {
                text: '离开',
                cost: {},
                rewards: [],
                probability: 100
            }
        ]
    },
    {
        id: 'wandering_merchant',
        name: '流浪商人',
        description: '一个神秘的商人愿意用特殊的方式交易。',
        icon: '🎭',
        choices: [
            {
                text: '用生命值换取金币（失去5生命值，获得75金币）',
                cost: { health: 5 },
                rewards: [{ type: 'gold', value: 75 }],
                probability: 100
            },
            {
                text: '用金币换取生命值（失去50金币，获得15生命值）',
                cost: { gold: 50 },
                rewards: [{ type: 'health', value: 15 }],
                probability: 100
            },
            {
                text: '拒绝交易',
                cost: {},
                rewards: [],
                probability: 100
            }
        ]
    },
    {
        id: 'ancient_library',
        name: '古老图书馆',
        description: '你发现了一座废弃的图书馆，里面可能藏有珍贵的知识。',
        icon: '📚',
        choices: [
            {
                text: '研读古籍（获得稀有卡牌）',
                cost: {},
                rewards: [{ type: 'card_rare', value: 1 }],
                probability: 70
            },
            {
                text: '小心搜索（获得金币）',
                cost: {},
                rewards: [{ type: 'gold', value: 50 }],
                probability: 100
            }
        ]
    }
];

// 导出配置数据
window.ConfigData = {
    CARD_CONFIG_DATA,
    HERO_SKILL_DATA,
    CHARACTER_CLASS_DATA,
    GAME_CONFIG_DATA,
    MONSTER_CONFIG_DATA,
    TOWER_CONFIG_DATA,
    TOWER_NODE_TYPES_DATA,
    TOWER_REWARDS_DATA,
    BOSS_CONFIG_DATA,
    SHOP_ITEM_DATA,
    RANDOM_EVENT_DATA
}; 