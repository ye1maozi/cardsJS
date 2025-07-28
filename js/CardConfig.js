/**
 * 卡牌配置类 - 对应C#版本的CardConfig类
 */
class CardConfig {
    constructor(name, cardClass, energyCost, castTime, castType, effect, effectCode, value1 = 0, value2 = 0, value3 = 0) {
        this.name = name;
        this.class = cardClass;
        this.energyCost = energyCost;
        this.castTime = castTime;
        this.castType = castType;
        this.effect = effect;
        this.effectCode = effectCode;
        this.value1 = value1;
        this.value2 = value2;
        this.value3 = value3;
    }
}

/**
 * 卡牌配置管理器 - 对应C#版本的CardConfigManager类
 */
class CardConfigManager {
    static cardConfigs = [];
    static isLoaded = false;

    /**
     * 加载卡牌配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadCardConfigs() {
        try {
            // 尝试从CSV文件加载配置
            const success = await this.loadFromCSVFile();
            if (success) {
                this.isLoaded = true;
                console.log(`从CSV文件成功加载 ${this.cardConfigs.length} 张卡牌配置`);
                return true;
            } else {
                // 如果CSV加载失败，使用默认配置
                console.warn('CSV文件加载失败，使用默认配置');
                return this.loadDefaultConfigs();
            }
        } catch (error) {
            console.error('加载卡牌配置失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 从CSV文件加载配置
     * @returns {Promise<boolean>} 是否加载成功
     */
    static async loadFromCSVFile() {
        try {
            // 检查是否在本地文件系统中
            if (window.location.protocol === 'file:') {
                console.warn('检测到本地文件访问，CSV加载可能被CORS策略阻止，将使用默认配置');
                return false;
            }
            
            const response = await fetch('cards.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            return this.loadFromCSV(csvData);
        } catch (error) {
            console.warn('从CSV文件加载失败，将使用默认配置:', error.message);
            return false;
        }
    }

    /**
     * 加载默认配置（后备方案）
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultConfigs() {
        try {
            // 默认卡牌配置（作为后备方案）
            this.cardConfigs = [
                new CardConfig("打击", "战士", 1, 0, "瞬发", "对单体目标造成6点伤害", "DAMAGE_6", 6, 0, 0),
                new CardConfig("火球术", "法师", 1, 1, "吟唱", "吟唱1秒后，对单体目标造成9点伤害", "DAMAGE_9", 9, 0, 0),
                new CardConfig("治疗术", "牧师", 1, 0, "瞬发", "恢复6点生命值", "HEAL_6", 6, 0, 0),
                new CardConfig("毒刃", "盗贼", 1, 0, "瞬发", "立刻攻击目标，造成6点伤害，并使其获得3层中毒", "DAMAGE_6_POISON", 6, 3, 0),
                new CardConfig("断筋", "战士", 1, 0, "瞬发", "对单体目标造成3点伤害，并使目标速度降低3点，持续5秒", "DAMAGE_3_SLOW", 3, 3, 5),
                new CardConfig("盾击", "战士", 2, 0, "瞬发", "对单体目标造成4点伤害，并获得3点护甲", "DAMAGE_4_ARMOR", 4, 3, 0),
                new CardConfig("冰霜新星", "法师", 3, 0, "瞬发", "对所有敌人造成4点伤害，并使其速度降低2点", "DAMAGE_4_ALL_SLOW", 4, 2, 0),
                new CardConfig("奥术冲击", "法师", 0, 2, "吟唱", "消耗当前所有能量，对目标释放一次强力的奥术冲击", "CONSUME_ALL_ENERGY", 2, 0, 0),
                new CardConfig("伏击", "盗贼", 2, 0, "瞬发", "只能在潜行状态下使用，立刻攻击，造成15点伤害", "DAMAGE_15", 15, 0, 0),
                new CardConfig("疾跑", "盗贼", 1, 0, "瞬发", "立刻抽取3张卡牌，随机丢弃本次抽取的其中1张卡牌", "DRAW_3_DISCARD_1", 3, 1, 0),
                new CardConfig("潜行", "盗贼", 1, 0, "瞬发", "立刻进入潜行状态，最多可持续10秒", "STEALTH", 10, 0, 0),
                new CardConfig("神圣新星", "牧师", 2, 0, "瞬发", "对所有友军恢复4点生命值", "HEAL_4_ALL", 4, 0, 0),
                new CardConfig("驱散", "牧师", 1, 0, "瞬发", "移除目标身上的所有负面效果", "DISPEL", 0, 0, 0)
            ];

            this.isLoaded = true;
            console.log(`使用默认配置加载了 ${this.cardConfigs.length} 张卡牌`);
            return true;
        } catch (error) {
            console.error('加载默认配置失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 从CSV字符串加载配置
     * @param {string} csvData - CSV数据
     * @returns {boolean} 是否加载成功
     */
    static loadFromCSV(csvData) {
        try {
            const lines = csvData.trim().split('\n');
            this.cardConfigs = [];

            for (let i = 1; i < lines.length; i++) { // 跳过标题行
                const line = lines[i].trim();
                if (!line) continue;

                const parts = this.parseCSVLine(line);
                if (parts.length >= 10) {
                    const config = new CardConfig(
                        parts[0],
                        parts[1],
                        parseInt(parts[2]),
                        parseInt(parts[3]),
                        parts[4],
                        parts[5],
                        parts[6],
                        parseInt(parts[7]),
                        parseInt(parts[8]),
                        parseInt(parts[9])
                    );
                    this.cardConfigs.push(config);
                } else if (parts.length >= 7) {
                    // 兼容旧格式（没有数值参数）
                    const config = new CardConfig(
                        parts[0],
                        parts[1],
                        parseInt(parts[2]),
                        parseInt(parts[3]),
                        parts[4],
                        parts[5],
                        parts[6],
                        0, 0, 0
                    );
                    this.cardConfigs.push(config);
                }
            }

            this.isLoaded = true;
            console.log(`从CSV成功加载 ${this.cardConfigs.length} 张卡牌配置`);
            return true;
        } catch (error) {
            console.error('从CSV加载卡牌配置失败:', error);
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
     * 获取卡牌配置
     * @param {string} name - 卡牌名称
     * @returns {CardConfig|null} 卡牌配置
     */
    static getCardConfig(name) {
        return this.cardConfigs.find(config => config.name === name) || null;
    }

    /**
     * 根据职业获取卡牌配置
     * @param {string} cardClass - 卡牌职业
     * @returns {CardConfig[]} 卡牌配置数组
     */
    static getCardConfigsByClass(cardClass) {
        return this.cardConfigs.filter(config => config.class === cardClass);
    }

    /**
     * 获取所有卡牌配置
     * @returns {CardConfig[]} 所有卡牌配置
     */
    static getAllCardConfigs() {
        return [...this.cardConfigs];
    }

    /**
     * 根据配置创建卡牌对象
     * @param {CardConfig} config - 卡牌配置
     * @returns {Card|null} 卡牌对象
     */
    static createCard(config) {
        try {
            return new Card(
                config.name,
                config.class,
                config.energyCost,
                config.castTime,
                config.castType,
                config.effect,
                config.effectCode,
                config.value1,
                config.value2,
                config.value3
            );
        } catch (error) {
            console.error('创建卡牌失败:', error);
            return null;
        }
    }

    /**
     * 检查是否已加载
     * @returns {boolean} 是否已加载
     */
    static isConfigLoaded() {
        return this.isLoaded;
    }

    /**
     * 重新加载配置
     * @returns {boolean} 是否重新加载成功
     */
    static reloadConfigs() {
        this.isLoaded = false;
        this.cardConfigs = [];
        return this.loadCardConfigs();
    }

    /**
     * 导出配置为CSV
     * @returns {string} CSV格式的配置数据
     */
    static exportToCSV() {
        const header = 'Name,Class,EnergyCost,CastTime,CastType,Effect,EffectCode,Value1,Value2,Value3';
        const lines = [header];
        
        for (const config of this.cardConfigs) {
            const line = [
                config.name,
                config.class,
                config.energyCost,
                config.castTime,
                config.castType,
                config.effect,
                config.effectCode,
                config.value1,
                config.value2,
                config.value3
            ].join(',');
            lines.push(line);
        }
        
        return lines.join('\n');
    }

    /**
     * 添加新卡牌配置
     * @param {CardConfig} config - 新卡牌配置
     */
    static addCardConfig(config) {
        this.cardConfigs.push(config);
    }

    /**
     * 更新卡牌配置
     * @param {string} name - 卡牌名称
     * @param {CardConfig} newConfig - 新配置
     * @returns {boolean} 是否更新成功
     */
    static updateCardConfig(name, newConfig) {
        const index = this.cardConfigs.findIndex(config => config.name === name);
        if (index !== -1) {
            this.cardConfigs[index] = newConfig;
            return true;
        }
        return false;
    }

    /**
     * 删除卡牌配置
     * @param {string} name - 卡牌名称
     * @returns {boolean} 是否删除成功
     */
    static removeCardConfig(name) {
        const index = this.cardConfigs.findIndex(config => config.name === name);
        if (index !== -1) {
            this.cardConfigs.splice(index, 1);
            return true;
        }
        return false;
    }
} 