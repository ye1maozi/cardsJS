/**
 * 统一配置管理器 - 管理所有游戏配置
 */
class ConfigManager {
    static configs = {
        heroSkills: [],
        characterClasses: [],
        gameConfig: new Map(),
        cards: []
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
                this.loadCardConfigs()
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
            // 优先尝试从CSV文件加载
            const fileSuccess = await this.loadHeroSkillsFromFile();
            if (fileSuccess) {
                return true;
            }
            
            // 如果文件加载失败，尝试使用内置数据
            const builtInSuccess = this.loadHeroSkillsFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 最后使用默认配置
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
     * 从CSV文件加载英雄技能配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadHeroSkillsFromFile() {
        try {
            const response = await fetch('./cfg/hero_skills.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            return this.parseHeroSkillsCSV(csvData);
        } catch (error) {
            console.warn('从CSV文件加载英雄技能失败:', error.message);
            return false;
        }
    }

    /**
     * 加载角色职业配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadCharacterClasses() {
        try {
            // 优先尝试从CSV文件加载
            const fileSuccess = await this.loadCharacterClassesFromFile();
            if (fileSuccess) {
                return true;
            }
            
            // 如果文件加载失败，尝试使用内置数据
            const builtInSuccess = this.loadCharacterClassesFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 最后使用默认配置
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
     * 从CSV文件加载角色职业配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadCharacterClassesFromFile() {
        try {
            const response = await fetch('./cfg/character_classes.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            return this.parseCharacterClassesCSV(csvData);
        } catch (error) {
            console.warn('从CSV文件加载角色职业失败:', error.message);
            return false;
        }
    }

    /**
     * 加载游戏配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadGameConfig() {
        try {
            // 优先尝试从CSV文件加载
            const fileSuccess = await this.loadGameConfigFromFile();
            if (fileSuccess) {
                return true;
            }
            
            // 如果文件加载失败，尝试使用内置数据
            const builtInSuccess = this.loadGameConfigFromBuiltInData();
            if (builtInSuccess) {
                return true;
            }
            
            // 最后使用默认配置
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
            
            this.configs.gameConfig.clear();
            const data = window.ConfigData.GAME_CONFIG_DATA;
            
            for (const [key, value] of Object.entries(data)) {
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
     * 从CSV文件加载游戏配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadGameConfigFromFile() {
        try {
            const response = await fetch('./cfg/game_config.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            return this.parseGameConfigCSV(csvData);
        } catch (error) {
            console.warn('从CSV文件加载游戏配置失败:', error.message);
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
     * 解析英雄技能CSV
     * @param {string} csvData - CSV数据
     * @returns {boolean} 是否解析成功
     */
    static parseHeroSkillsCSV(csvData) {
        try {
            const lines = csvData.trim().split('\n');
            this.configs.heroSkills = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = this.parseCSVLine(line);
                if (parts.length >= 10) {
                    const skillConfig = {
                        class: parts[0],
                        name: parts[1],
                        description: parts[2],
                        cooldown: parseInt(parts[3]),
                        energyCost: parseInt(parts[4]),
                        effectType: parts[5],
                        value1: parseInt(parts[6]),
                        value2: parseInt(parts[7]),
                        value3: parseInt(parts[8]),
                        duration: parseInt(parts[9])
                    };
                    this.configs.heroSkills.push(skillConfig);
                }
            }

            console.log(`英雄技能配置加载成功: ${this.configs.heroSkills.length} 个技能`);
            return true;
        } catch (error) {
            console.error('解析英雄技能CSV失败:', error);
            return false;
        }
    }

    /**
     * 解析角色职业CSV
     * @param {string} csvData - CSV数据
     * @returns {boolean} 是否解析成功
     */
    static parseCharacterClassesCSV(csvData) {
        try {
            const lines = csvData.trim().split('\n');
            this.configs.characterClasses = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = this.parseCSVLine(line);
                if (parts.length >= 10) {
                    const classConfig = {
                        class: parts[0],
                        maxHealth: parseInt(parts[1]),
                        maxEnergy: parseInt(parts[2]),
                        initialEnergy: parseInt(parts[3]),
                        strength: parseInt(parts[4]),
                        agility: parseInt(parts[5]),
                        spirit: parseInt(parts[6]),
                        healthRegenRate: parseFloat(parts[7]),
                        energyRegenRate: parseFloat(parts[8]),
                        description: parts[9]
                    };
                    this.configs.characterClasses.push(classConfig);
                }
            }

            console.log(`角色职业配置加载成功: ${this.configs.characterClasses.length} 个职业`);
            return true;
        } catch (error) {
            console.error('解析角色职业CSV失败:', error);
            return false;
        }
    }

    /**
     * 解析游戏配置CSV
     * @param {string} csvData - CSV数据
     * @returns {boolean} 是否解析成功
     */
    static parseGameConfigCSV(csvData) {
        try {
            const lines = csvData.trim().split('\n');
            this.configs.gameConfig.clear();

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = this.parseCSVLine(line);
                if (parts.length >= 3) {
                    const key = parts[0];
                    let value = parts[1];
                    
                    // 尝试转换为数字
                    if (!isNaN(value) && value !== '') {
                        value = value.includes('.') ? parseFloat(value) : parseInt(value);
                    }
                    
                    this.configs.gameConfig.set(key, value);
                }
            }

            console.log(`游戏配置加载成功: ${this.configs.gameConfig.size} 个配置项`);
            return true;
        } catch (error) {
            console.error('解析游戏配置CSV失败:', error);
            return false;
        }
    }

    /**
     * 解析CSV行
     * @param {string} line - CSV行
     * @returns {string[]} 解析后的字段数组
     */
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * 加载默认英雄技能配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultHeroSkills() {
        this.configs.heroSkills = [
            {
                class: '战士',
                name: '狂暴',
                description: '增加5点强度，持续10秒',
                cooldown: 15,
                energyCost: 2,
                effectType: 'STRENGTH_BOOST',
                value1: 5,
                value2: 0,
                value3: 0,
                duration: 10
            },
            {
                class: '法师',
                name: '奥术强化',
                description: '恢复3点能量，下次法术伤害翻倍',
                cooldown: 20,
                energyCost: 0,
                effectType: 'ENERGY_RESTORE_SPELL_BOOST',
                value1: 3,
                value2: 0,
                value3: 0,
                duration: 0
            },
            {
                class: '盗贼',
                name: '暗影步',
                description: '立即进入潜行状态，持续8秒',
                cooldown: 12,
                energyCost: 1,
                effectType: 'STEALTH',
                value1: 0,
                value2: 0,
                value3: 0,
                duration: 8
            },
            {
                class: '牧师',
                name: '神圣护盾',
                description: '获得10点护甲，持续15秒',
                cooldown: 18,
                energyCost: 1,
                effectType: 'ARMOR_BOOST',
                value1: 10,
                value2: 0,
                value3: 0,
                duration: 15
            }
        ];
        return true;
    }

    /**
     * 加载默认角色职业配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultCharacterClasses() {
        this.configs.characterClasses = [
            {
                class: '战士',
                maxHealth: 35,
                maxEnergy: 10,
                initialEnergy: 1,
                strength: 2,
                agility: 1,
                spirit: 0,
                healthRegenRate: 0,
                energyRegenRate: 1,
                description: '高生命值，高物理伤害'
            },
            {
                class: '法师',
                maxHealth: 25,
                maxEnergy: 12,
                initialEnergy: 2,
                strength: 0,
                agility: 0,
                spirit: 3,
                healthRegenRate: 0,
                energyRegenRate: 1,
                description: '高能量，高法术伤害'
            },
            {
                class: '盗贼',
                maxHealth: 28,
                maxEnergy: 10,
                initialEnergy: 1,
                strength: 1,
                agility: 3,
                spirit: 0,
                healthRegenRate: 0,
                energyRegenRate: 1,
                description: '高敏捷，潜行能力'
            },
            {
                class: '牧师',
                maxHealth: 32,
                maxEnergy: 10,
                initialEnergy: 1,
                strength: 0,
                agility: 1,
                spirit: 2,
                healthRegenRate: 0.5,
                energyRegenRate: 1,
                description: '平衡属性，治疗能力'
            }
        ];
        return true;
    }

    /**
     * 加载默认游戏配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultGameConfig() {
        this.configs.gameConfig.clear();
        this.configs.gameConfig.set('InitialHandSize', 4);
        this.configs.gameConfig.set('MaxHandSize', 10);
        this.configs.gameConfig.set('DrawInterval', 3);
        this.configs.gameConfig.set('MaxDeckSize', 30);
        this.configs.gameConfig.set('EnergyPerTurn', 1);
        this.configs.gameConfig.set('MaxEnergy', 10);
        this.configs.gameConfig.set('GameVersion', '1.4.2');
        this.configs.gameConfig.set('DefaultPlayerClass', '战士');
        this.configs.gameConfig.set('DefaultComputerClass', '法师');
        return true;
    }

    /**
     * 获取英雄技能配置
     * @param {string} characterClass - 角色职业
     * @returns {object|null} 技能配置
     */
    static getHeroSkillConfig(characterClass) {
        return this.configs.heroSkills.find(skill => skill.class === characterClass) || null;
    }

    /**
     * 获取角色职业配置
     * @param {string} characterClass - 角色职业
     * @returns {object|null} 职业配置
     */
    static getCharacterClassConfig(characterClass) {
        return this.configs.characterClasses.find(cls => cls.class === characterClass) || null;
    }

    /**
     * 获取游戏配置值
     * @param {string} key - 配置键
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值
     */
    static getGameConfig(key, defaultValue = null) {
        return this.configs.gameConfig.has(key) ? this.configs.gameConfig.get(key) : defaultValue;
    }

    /**
     * 获取所有英雄技能配置
     * @returns {object[]} 所有技能配置
     */
    static getAllHeroSkillConfigs() {
        return [...this.configs.heroSkills];
    }

    /**
     * 获取所有角色职业配置
     * @returns {object[]} 所有职业配置
     */
    static getAllCharacterClassConfigs() {
        return [...this.configs.characterClasses];
    }

    /**
     * 获取所有游戏配置
     * @returns {Map} 所有游戏配置
     */
    static getAllGameConfigs() {
        return new Map(this.configs.gameConfig);
    }

    /**
     * 检查是否已加载
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
            cards: []
        };
        return this.loadAllConfigs();
    }
} 