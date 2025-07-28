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
 * 使用ConfigData.js中的内置数据，不再加载CSV文件
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
            // 直接使用内置配置数据
            const builtInSuccess = this.loadFromBuiltInData();
            if (builtInSuccess) {
                this.isLoaded = true;
                console.log(`从内置数据成功加载 ${this.cardConfigs.length} 张卡牌配置`);
                return true;
            }
            
            // 如果内置数据加载失败，使用最小化默认配置
            console.warn('内置配置数据加载失败，使用最小化默认配置');
            return this.loadDefaultConfigs();
        } catch (error) {
            console.error('加载卡牌配置失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 从内置配置数据加载
     * @returns {boolean} 是否加载成功
     */
    static loadFromBuiltInData() {
        try {
            // 检查是否有内置配置数据
            if (typeof window.ConfigData === 'undefined' || !window.ConfigData.CARD_CONFIG_DATA) {
                console.warn('内置配置数据不可用');
                return false;
            }
            
            this.cardConfigs = [];
            const data = window.ConfigData.CARD_CONFIG_DATA;
            
            for (const item of data) {
                const config = new CardConfig(
                    item.name,
                    item.class,
                    item.energyCost,
                    item.castTime,
                    item.castType,
                    item.effect,
                    item.effectCode,
                    item.value1,
                    item.value2,
                    item.value3
                );
                this.cardConfigs.push(config);
            }
            
            console.log(`从内置数据成功加载 ${this.cardConfigs.length} 张卡牌配置`);
            return true;
        } catch (error) {
            console.warn('从内置数据加载失败:', error.message);
            return false;
        }
    }

    /**
     * 加载最小化默认配置
     * @returns {boolean} 是否加载成功
     */
    static loadDefaultConfigs() {
        try {
            // 使用ConfigManager中的默认配置
            const defaultConfigs = ConfigManager.getDefaultCardConfigs();
            this.cardConfigs = [];
            
            for (const config of defaultConfigs) {
                const cardConfig = new CardConfig(
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
                this.cardConfigs.push(cardConfig);
            }
            
            console.log(`默认卡牌配置加载成功: ${this.cardConfigs.length} 张卡牌`);
            return true;
        } catch (error) {
            console.error('加载默认卡牌配置失败:', error);
            return false;
        }
    }

    /**
     * 根据卡牌名称获取配置
     * @param {string} name - 卡牌名称
     * @returns {CardConfig|null} 卡牌配置
     */
    static getCardConfig(name) {
        return this.cardConfigs.find(config => config.name === name) || null;
    }

    /**
     * 根据职业获取卡牌配置
     * @param {string} cardClass - 卡牌职业
     * @returns {Array} 卡牌配置数组
     */
    static getCardConfigsByClass(cardClass) {
        return this.cardConfigs.filter(config => config.class === cardClass);
    }

    /**
     * 获取所有卡牌配置
     * @returns {Array} 卡牌配置数组
     */
    static getAllCardConfigs() {
        return [...this.cardConfigs];
    }

    /**
     * 根据配置创建卡牌实例
     * @param {CardConfig} config - 卡牌配置
     * @returns {Card} 卡牌实例
     */
    static createCard(config) {
        if (!config) {
            console.error('卡牌配置为空');
            return null;
        }

        try {
            const card = new Card(
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
            
            // 设置消耗卡牌
            this.setExhaustCards(card);
            
            return card;
        } catch (error) {
            console.error('创建卡牌实例失败:', error);
            return null;
        }
    }

    /**
     * 设置消耗卡牌
     * @param {Card} card - 卡牌实例
     */
    static setExhaustCards(card) {
        // 定义消耗卡牌列表
        const exhaustCards = [
            "血祭",
            "奥术冲击",
            "伏击",
            "疾跑"
        ];
        
        if (exhaustCards.includes(card.name)) {
            card.isExhaust = true;
        }
    }

    /**
     * 检查配置是否已加载
     * @returns {boolean} 是否已加载
     */
    static isConfigLoaded() {
        return this.isLoaded;
    }

    /**
     * 重新加载配置
     * @returns {Promise<boolean>} 是否重新加载成功
     */
    static async reloadConfigs() {
        this.isLoaded = false;
        this.cardConfigs = [];
        return await this.loadCardConfigs();
    }

    /**
     * 导出配置到CSV格式（用于调试）
     * @returns {string} CSV格式的配置数据
     */
    static exportToCSV() {
        const headers = ['Name', 'Class', 'EnergyCost', 'CastTime', 'CastType', 'Effect', 'EffectCode', 'Value1', 'Value2', 'Value3'];
        const csvLines = [headers.join(',')];
        
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
            csvLines.push(line);
        }
        
        return csvLines.join('\n');
    }

    /**
     * 添加卡牌配置
     * @param {CardConfig} config - 卡牌配置
     */
    static addCardConfig(config) {
        if (this.getCardConfig(config.name)) {
            console.warn(`卡牌配置已存在: ${config.name}`);
            return false;
        }
        
        this.cardConfigs.push(config);
        console.log(`添加卡牌配置: ${config.name}`);
        return true;
    }

    /**
     * 更新卡牌配置
     * @param {string} name - 卡牌名称
     * @param {CardConfig} newConfig - 新的卡牌配置
     */
    static updateCardConfig(name, newConfig) {
        const index = this.cardConfigs.findIndex(config => config.name === name);
        if (index === -1) {
            console.warn(`卡牌配置不存在: ${name}`);
            return false;
        }
        
        this.cardConfigs[index] = newConfig;
        console.log(`更新卡牌配置: ${name}`);
        return true;
    }

    /**
     * 移除卡牌配置
     * @param {string} name - 卡牌名称
     */
    static removeCardConfig(name) {
        const index = this.cardConfigs.findIndex(config => config.name === name);
        if (index === -1) {
            console.warn(`卡牌配置不存在: ${name}`);
            return false;
        }
        
        this.cardConfigs.splice(index, 1);
        console.log(`移除卡牌配置: ${name}`);
        return true;
    }
} 