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
        effectCode: "DAMAGE_6",
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
        effectCode: "DAMAGE_3_SLOW",
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
        effectCode: "DAMAGE_4_ARMOR",
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
        effectCode: "DAMAGE_8",
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
        effectCode: "DAMAGE_4_ALL_SLOW",
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
        effectCode: "DAMAGE_6_POISON",
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
        effectCode: "DAMAGE_15",
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
        effectCode: "HEAL_6",
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
        effectCode: "HEAL_4_ALL",
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
    "GameVersion": "1.8.0",
    "DefaultPlayerClass": "战士",
    "DefaultComputerClass": "法师"
};

// 导出配置数据
window.ConfigData = {
    CARD_CONFIG_DATA,
    HERO_SKILL_DATA,
    CHARACTER_CLASS_DATA,
    GAME_CONFIG_DATA
}; 