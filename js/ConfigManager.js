/**
 * 统一配置管理器 - 管理所有游戏配置
 * 使用ConfigData.js中的内置数据，不再加载CSV文件
 */
class ConfigManager {
    static configs = {
        heroSkills: [],
        characterClasses: [],
        gameConfig: new Map(),
        cards: [],
        monsters: []
    };
    
    static isLoaded = false;

    /**
     * 加载所有配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadAllConfigs() {
        try {
            console.log('开始加载所有配置文件...');
            
            // 并行加载所有配置
            const results = await Promise.allSettled([
                this.loadHeroSkills(),
                this.loadCharacterClasses(),
                this.loadGameConfig(),
                this.loadCardConfigs(),
                this.loadMonsterConfigs()
            ]);
            
            // 检查加载结果
            const successCount = results.filter(result => result.status === 'fulfilled').length;
            const totalCount = results.length;
            
            if (successCount === totalCount) {
                this.isLoaded = true;
                console.log(`所有配置文件加载成功 (${successCount}/${totalCount})`);
                return true;
            } else {
                console.warn(`部分配置文件加载失败 (${successCount}/${totalCount})`);
                // 即使部分失败也继续，使用默认配置
                this.isLoaded = true;
                return true;
            }
        } catch (error) {
            console.error('加载配置文件失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 加载英雄技能配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadHeroSkills() {
        try {
            // 直接使用内置数据
            const builtInSuccess = this.loadHeroSkillsFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 如果内置数据加载失败，使用默认配置
            console.warn('英雄技能配置加载失败，使用默认配置');
            return this.loadDefaultHeroSkills();
        } catch (error) {
            console.warn('英雄技能配置加载失败，使用默认配置:', error.message);
            return this.loadDefaultHeroSkills();
        }
    }

    /**
     * 从内置数据加载英雄技能配置
     * @returns {boolean} 是否加载成功
     */
    static loadHeroSkillsFromBuiltInData() {
        try {
            if (typeof window.ConfigData === 'undefined' || !window.ConfigData.HERO_SKILL_DATA) {
                console.warn('内置英雄技能数据不可用');
                return false;
            }
            
            this.configs.heroSkills = [...window.ConfigData.HERO_SKILL_DATA];
            console.log(`从内置数据成功加载 ${this.configs.heroSkills.length} 个英雄技能`);
            return true;
        } catch (error) {
            console.warn('从内置数据加载英雄技能失败:', error.message);
            return false;
        }
    }

    /**
     * 加载角色职业配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadCharacterClasses() {
        try {
            // 直接使用内置数据
            const builtInSuccess = this.loadCharacterClassesFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 如果内置数据加载失败，使用默认配置
            console.warn('角色职业配置加载失败，使用默认配置');
            return this.loadDefaultCharacterClasses();
        } catch (error) {
            console.warn('角色职业配置加载失败，使用默认配置:', error.message);
            return this.loadDefaultCharacterClasses();
        }
    }

    /**
     * 从内置数据加载角色职业配置
     * @returns {boolean} 是否加载成功
     */
    static loadCharacterClassesFromBuiltInData() {
        try {
            if (typeof window.ConfigData === 'undefined' || !window.ConfigData.CHARACTER_CLASS_DATA) {
                console.warn('内置角色职业数据不可用');
                return false;
            }
            
            this.configs.characterClasses = [...window.ConfigData.CHARACTER_CLASS_DATA];
            console.log(`从内置数据成功加载 ${this.configs.characterClasses.length} 个角色职业`);
            return true;
        } catch (error) {
            console.warn('从内置数据加载角色职业失败:', error.message);
            return false;
        }
    }

    /**
     * 加载游戏配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadGameConfig() {
        try {
            // 直接使用内置数据
            const builtInSuccess = this.loadGameConfigFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 如果内置数据加载失败，使用默认配置
            console.warn('游戏配置加载失败，使用默认配置');
            return this.loadDefaultGameConfig();
        } catch (error) {
            console.warn('游戏配置加载失败，使用默认配置:', error.message);
            return this.loadDefaultGameConfig();
        }
    }

    /**
     * 从内置数据加载游戏配置
     * @returns {boolean} 是否加载成功
     */
    static loadGameConfigFromBuiltInData() {
        try {
            if (typeof window.ConfigData === 'undefined' || !window.ConfigData.GAME_CONFIG_DATA) {
                console.warn('内置游戏配置数据不可用');
                return false;
            }
            
            // 清空现有配置
            this.configs.gameConfig.clear();
            
            // 添加所有配置项
            const gameConfig = window.ConfigData.GAME_CONFIG_DATA;
            for (const [key, value] of Object.entries(gameConfig)) {
                this.configs.gameConfig.set(key, value);
            }
            
            console.log(`从内置数据成功加载 ${this.configs.gameConfig.size} 个游戏配置项`);
            return true;
        } catch (error) {
            console.warn('从内置数据加载游戏配置失败:', error.message);
            return false;
        }
    }

    /**
     * 加载卡牌配置（复用CardConfigManager）
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadCardConfigs() {
        try {
            const success = await CardConfigManager.loadCardConfigs();
            if (success) {
                this.configs.cards = CardConfigManager.getAllCardConfigs();
            }
            return success;
        } catch (error) {
            console.warn('卡牌配置加载失败:', error.message);
            return false;
        }
    }

    /**
     * 加载怪物配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadMonsterConfigs() {
        try {
            // 直接使用内置数据
            const builtInSuccess = this.loadMonsterConfigsFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 如果内置数据加载失败，使用默认配置
            console.warn('怪物配置加载失败，使用默认配置');
            return this.loadDefaultMonsterConfigs();
        } catch (error) {
            console.warn('怪物配置加载失败，使用默认配置:', error.message);
            return this.loadDefaultMonsterConfigs();
        }
    }

    /**
     * 从内置数据加载怪物配置
     * @returns {boolean} 是否加载成功
     */
    static loadMonsterConfigsFromBuiltInData() {
        try {
            if (typeof window.ConfigData === 'undefined' || !window.ConfigData.MONSTER_CONFIG_DATA) {
                console.warn('内置怪物数据不可用');
                return false;
            }
            
            this.configs.monsters = [...window.ConfigData.MONSTER_CONFIG_DATA];
            console.log(`从内置数据成功加载 ${this.configs.monsters.length} 个怪物配置`);
            return true;
        } catch (error) {
            console.warn('从内置数据加载怪物配置失败:', error.message);
            return false;
        }
    }

    /**
     * 加载默认英雄技能配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultHeroSkills() {
        try {
            this.configs.heroSkills = this.getDefaultHeroSkillConfigs();
            console.log(`默认英雄技能配置加载成功: ${this.configs.heroSkills.length} 个技能`);
            return true;
        } catch (error) {
            console.error('加载默认英雄技能配置失败:', error);
            return false;
        }
    }

    /**
     * 加载默认角色职业配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultCharacterClasses() {
        try {
            this.configs.characterClasses = this.getDefaultCharacterClassConfigs();
            console.log(`默认角色职业配置加载成功: ${this.configs.characterClasses.length} 个职业`);
            return true;
        } catch (error) {
            console.error('加载默认角色职业配置失败:', error);
            return false;
        }
    }

    /**
     * 加载默认游戏配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultGameConfig() {
        try {
            this.configs.gameConfig.clear();
            
            const defaultConfig = this.getDefaultGameConfigs();
            for (const [key, value] of Object.entries(defaultConfig)) {
                this.configs.gameConfig.set(key, value);
            }
            
            console.log(`默认游戏配置加载成功: ${this.configs.gameConfig.size} 个配置项`);
            return true;
        } catch (error) {
            console.error('加载默认游戏配置失败:', error);
            return false;
        }
    }

    /**
     * 加载默认怪物配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultMonsterConfigs() {
        try {
            this.configs.monsters = this.getDefaultMonsterConfigs();
            console.log(`默认怪物配置加载成功: ${this.configs.monsters.length} 个怪物`);
            return true;
        } catch (error) {
            console.error('加载默认怪物配置失败:', error);
            return false;
        }
    }

    /**
     * 获取默认英雄技能配置
     * @returns {Array} 默认英雄技能配置数组
     */
    static getDefaultHeroSkillConfigs() {
        return [
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
    }

    /**
     * 获取默认角色职业配置
     * @returns {Array} 默认角色职业配置数组
     */
    static getDefaultCharacterClassConfigs() {
        return [
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
    }

    /**
     * 获取默认游戏配置
     * @returns {Object} 默认游戏配置对象
     */
    static getDefaultGameConfigs() {
        return {
            "InitialHandSize": 4,
            "MaxHandSize": 10,
            "DrawInterval": 3,
            "MaxDeckSize": 30,
            "EnergyPerTurn": 1,
            "MaxEnergy": 10,
            "GameVersion": "2.0.0",
            "DefaultPlayerClass": "战士",
            "DefaultComputerClass": "法师"
        };
    }

    /**
     * 获取默认卡牌配置
     * @returns {Array} 默认卡牌配置数组
     */
    static getDefaultCardConfigs() {
        return [
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
            }
        ];
    }

    /**
     * 获取默认怪物配置
     * @returns {Array} 默认怪物配置数组
     */
    static getDefaultMonsterConfigs() {
        return [
            {
                name: "普通小怪",
                maxHealth: 10,
                maxEnergy: 0,
                initialEnergy: 0,
                strength: 1,
                agility: 0,
                spirit: 0,
                healthRegenRate: 0,
                energyRegenRate: 0,
                description: "基础小怪，生命值低"
            },
            {
                name: "精英小怪",
                maxHealth: 20,
                maxEnergy: 0,
                initialEnergy: 0,
                strength: 2,
                agility: 0,
                spirit: 0,
                healthRegenRate: 0,
                energyRegenRate: 0,
                description: "生命值较高的小怪"
            },
            {
                name: "Boss",
                maxHealth: 100,
                maxEnergy: 0,
                initialEnergy: 0,
                strength: 5,
                agility: 0,
                spirit: 0,
                healthRegenRate: 0,
                energyRegenRate: 0,
                description: "最终Boss，生命值高"
            }
        ];
    }

    /**
     * 获取英雄技能配置
     * @param {string} characterClass - 角色职业
     * @returns {Object|null} 英雄技能配置
     */
    static getHeroSkillConfig(characterClass) {
        return this.configs.heroSkills.find(skill => skill.class === characterClass) || null;
    }

    /**
     * 获取角色职业配置
     * @param {string} characterClass - 角色职业
     * @returns {Object|null} 角色职业配置
     */
    static getCharacterClassConfig(characterClass) {
        return this.configs.characterClasses.find(cls => cls.class === characterClass) || null;
    }

    /**
     * 获取游戏配置
     * @param {string} key - 配置键
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值
     */
    static getGameConfig(key, defaultValue = null) {
        return this.configs.gameConfig.has(key) ? this.configs.gameConfig.get(key) : defaultValue;
    }

    /**
     * 获取所有英雄技能配置
     * @returns {Array} 英雄技能配置数组
     */
    static getAllHeroSkillConfigs() {
        return [...this.configs.heroSkills];
    }

    /**
     * 获取所有角色职业配置
     * @returns {Array} 角色职业配置数组
     */
    static getAllCharacterClassConfigs() {
        return [...this.configs.characterClasses];
    }

    /**
     * 获取所有游戏配置
     * @returns {Map} 游戏配置Map
     */
    static getAllGameConfigs() {
        return new Map(this.configs.gameConfig);
    }

    /**
     * 获取所有怪物配置
     * @returns {Array} 怪物配置数组
     */
    static getAllMonsterConfigs() {
        return [...this.configs.monsters];
    }

    /**
     * 根据ID获取怪物配置
     * @param {string} monsterId - 怪物ID
     * @returns {Object|null} 怪物配置对象
     */
    static getMonsterConfig(monsterId) {
        return this.configs.monsters.find(monster => monster.id === monsterId) || null;
    }

    /**
     * 根据难度获取怪物配置
     * @param {number} difficulty - 难度等级
     * @returns {Array} 指定难度的怪物配置数组
     */
    static getMonstersByDifficulty(difficulty) {
        return this.configs.monsters.filter(monster => monster.difficulty === difficulty);
    }

    /**
     * 根据职业获取怪物配置
     * @param {string} characterClass - 职业名称
     * @returns {Array} 指定职业的怪物配置数组
     */
    static getMonstersByClass(characterClass) {
        return this.configs.monsters.filter(monster => monster.class === characterClass);
    }

    /**
     * 获取随机怪物配置
     * @param {number} difficulty - 可选，难度等级
     * @param {string} characterClass - 可选，职业名称
     * @returns {Object|null} 随机怪物配置
     */
    static getRandomMonster(difficulty = null, characterClass = null) {
        let filteredMonsters = this.configs.monsters;
        
        if (difficulty !== null) {
            filteredMonsters = filteredMonsters.filter(monster => monster.difficulty === difficulty);
        }
        
        if (characterClass !== null) {
            filteredMonsters = filteredMonsters.filter(monster => monster.class === characterClass);
        }
        
        if (filteredMonsters.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * filteredMonsters.length);
        return filteredMonsters[randomIndex];
    }

    /**
     * 检查配置是否已加载
     * @returns {boolean} 是否已加载
     */
    static isConfigLoaded() {
        return this.isLoaded;
    }

    /**
     * 重新加载所有配置
     * @returns {Promise<boolean>} 是否重新加载成功
     */
    static async reloadAllConfigs() {
        this.isLoaded = false;
        this.configs = {
            heroSkills: [],
            characterClasses: [],
            gameConfig: new Map(),
            cards: [],
            monsters: []
        };
        return await this.loadAllConfigs();
    }
} 