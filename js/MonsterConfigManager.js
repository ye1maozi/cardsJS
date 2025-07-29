/**
 * Monster配置管理器 - 管理所有怪物配置
 * 使用ConfigData.js中的内置数据
 */
class MonsterConfigManager {
    static monsterConfigs = [];
    static isLoaded = false;

    /**
     * 加载怪物配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadMonsterConfigs() {
        try {
            // 直接使用内置配置数据
            const builtInSuccess = this.loadFromBuiltInData();
            if (builtInSuccess) {
                this.isLoaded = true;
                console.log(`从内置数据成功加载 ${this.monsterConfigs.length} 个怪物配置`);
                return true;
            }
            
            // 如果内置数据加载失败，使用最小化默认配置
            console.warn('内置怪物配置数据加载失败，使用最小化默认配置');
            return this.loadDefaultConfigs();
        } catch (error) {
            console.error('加载怪物配置失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 从内置数据加载怪物配置
     * @returns {boolean} 是否加载成功
     */
    static loadFromBuiltInData() {
        try {
            if (typeof window.ConfigData === 'undefined' || !window.ConfigData.MONSTER_CONFIG_DATA) {
                console.warn('内置怪物配置数据不可用');
                return false;
            }
            
            this.monsterConfigs = [...window.ConfigData.MONSTER_CONFIG_DATA];
            return true;
        } catch (error) {
            console.warn('从内置数据加载怪物配置失败:', error.message);
            return false;
        }
    }

    /**
     * 加载默认怪物配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultConfigs() {
        try {
            this.monsterConfigs = [
                {
                    id: "default_monster",
                    name: "默认怪物",
                    class: "战士",
                    description: "默认怪物配置",
                    difficulty: 1,
                    maxHealth: 30,
                    maxEnergy: 10,
                    initialEnergy: 1,
                    strength: 2,
                    agility: 1,
                    spirit: 0,
                    healthRegenRate: 0,
                    energyRegenRate: 1,
                    preferredCards: ["打击"],
                    avoidCards: [],
                    aiStrategy: "aggressive",
                    personality: "reckless"
                }
            ];
            this.isLoaded = true;
            console.log(`使用默认配置加载了 ${this.monsterConfigs.length} 个怪物`);
            return true;
        } catch (error) {
            console.error('加载默认怪物配置失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 获取所有怪物配置
     * @returns {Array} 怪物配置数组
     */
    static getAllMonsterConfigs() {
        return [...this.monsterConfigs];
    }

    /**
     * 根据ID获取怪物配置
     * @param {string} monsterId - 怪物ID
     * @returns {Object|null} 怪物配置对象
     */
    static getMonsterConfig(monsterId) {
        return this.monsterConfigs.find(monster => monster.id === monsterId) || null;
    }

    /**
     * 根据难度获取怪物配置
     * @param {number} difficulty - 难度等级
     * @returns {Array} 指定难度的怪物配置数组
     */
    static getMonstersByDifficulty(difficulty) {
        return this.monsterConfigs.filter(monster => monster.difficulty === difficulty);
    }

    /**
     * 根据职业获取怪物配置
     * @param {string} characterClass - 职业名称
     * @returns {Array} 指定职业的怪物配置数组
     */
    static getMonstersByClass(characterClass) {
        return this.monsterConfigs.filter(monster => monster.class === characterClass);
    }

    /**
     * 获取随机怪物配置
     * @param {number} difficulty - 可选，难度等级
     * @param {string} characterClass - 可选，职业名称
     * @returns {Object|null} 随机怪物配置
     */
    static getRandomMonster(difficulty = null, characterClass = null) {
        let filteredMonsters = this.monsterConfigs;
        
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
     * 根据怪物配置创建角色属性
     * @param {Object} monsterConfig - 怪物配置
     * @returns {Object} 角色属性对象
     */
    static createCharacterFromMonster(monsterConfig) {
        return {
            class: monsterConfig.class,
            maxHealth: monsterConfig.maxHealth,
            maxEnergy: monsterConfig.maxEnergy,
            initialEnergy: monsterConfig.initialEnergy,
            strength: monsterConfig.strength,
            agility: monsterConfig.agility,
            spirit: monsterConfig.spirit,
            healthRegenRate: monsterConfig.healthRegenRate,
            energyRegenRate: monsterConfig.energyRegenRate,
            description: monsterConfig.description
        };
    }

    /**
     * 获取怪物偏好的卡牌
     * @param {Object} monsterConfig - 怪物配置
     * @returns {Array} 偏好卡牌名称数组
     */
    static getPreferredCards(monsterConfig) {
        return monsterConfig.preferredCards || [];
    }

    /**
     * 获取怪物避免的卡牌
     * @param {Object} monsterConfig - 怪物配置
     * @returns {Array} 避免卡牌名称数组
     */
    static getAvoidCards(monsterConfig) {
        return monsterConfig.avoidCards || [];
    }

    /**
     * 获取怪物的AI策略
     * @param {Object} monsterConfig - 怪物配置
     * @returns {string} AI策略
     */
    static getAIStrategy(monsterConfig) {
        return monsterConfig.aiStrategy || 'default';
    }

    /**
     * 获取怪物的性格
     * @param {Object} monsterConfig - 怪物配置
     * @returns {string} 性格类型
     */
    static getPersonality(monsterConfig) {
        return monsterConfig.personality || 'neutral';
    }
}

// 导出到全局对象
if (typeof window !== 'undefined') {
    window.MonsterConfigManager = MonsterConfigManager;
} 