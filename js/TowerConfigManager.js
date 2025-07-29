/**
 * 爬塔配置管理器 - 管理所有爬塔相关的配置数据
 */
class TowerConfigManager {
    constructor() {
        this.isLoaded = false;
        this.configs = {
            tower: new Map(),           // 主配置
            nodeTypes: new Map(),       // 节点类型配置
            rewards: new Map()          // 奖励配置
        };
    }

    /**
     * 加载所有配置
     */
    async loadAllConfigs() {
        try {
            console.log('开始加载爬塔配置...');
            
            // 检查ConfigData是否可用
            if (!window.ConfigData) {
                throw new Error('ConfigData未加载');
            }
            
            // 从ConfigData加载配置
            this.loadFromConfigData();
            
            this.isLoaded = true;
            console.log('爬塔配置加载完成');
            
            // 验证配置完整性
            this.validateConfigs();
            
        } catch (error) {
            console.error('加载爬塔配置失败:', error);
            this.loadDefaultConfigs();
            // 不抛出错误，使用默认配置
        }
    }

    /**
     * 从ConfigData加载配置
     */
    loadFromConfigData() {
        // 加载主配置
        if (window.ConfigData.TOWER_CONFIG_DATA) {
            this.processTowerConfigFromObject(window.ConfigData.TOWER_CONFIG_DATA);
        }
        
        // 加载节点类型配置
        if (window.ConfigData.TOWER_NODE_TYPES_DATA) {
            this.processNodeTypesFromArray(window.ConfigData.TOWER_NODE_TYPES_DATA);
        }
        
        // 加载奖励配置
        if (window.ConfigData.TOWER_REWARDS_DATA) {
            this.processRewardsFromArray(window.ConfigData.TOWER_REWARDS_DATA);
        }
    }

    /**
     * 处理主配置数据（从对象）
     */
    processTowerConfigFromObject(configData) {
        Object.entries(configData).forEach(([key, value]) => {
            this.configs.tower.set(key, {
                value: value,
                description: this.getTowerConfigDescription(key),
                category: this.getTowerConfigCategory(key)
            });
        });
    }

    /**
     * 处理节点类型配置数据（从数组）
     */
    processNodeTypesFromArray(nodeTypesData) {
        nodeTypesData.forEach(nodeData => {
            this.configs.nodeTypes.set(nodeData.type, {
                displayName: nodeData.displayName,
                icon: nodeData.icon,
                description: nodeData.description,
                weight: nodeData.weight,
                minLayer: nodeData.minLayer,
                maxLayer: nodeData.maxLayer,
                isSpecial: nodeData.isSpecial
            });
        });
    }

    /**
     * 处理奖励配置数据（从数组）
     */
    processRewardsFromArray(rewardsData) {
        rewardsData.forEach(rewardData => {
            this.configs.rewards.set(rewardData.type, {
                icon: rewardData.icon,
                baseAmount: rewardData.baseAmount,
                layerMultiplier: rewardData.layerMultiplier,
                probability: rewardData.probability,
                minLayer: rewardData.minLayer,
                maxLayer: rewardData.maxLayer,
                description: rewardData.description
            });
        });
    }

    /**
     * 获取配置项描述
     */
    getTowerConfigDescription(key) {
        const descriptions = {
            TotalLayers: '爬塔总层数',
            MinNodesPerLayer: '每层最少节点数',
            MaxNodesPerLayer: '每层最多节点数',
            MinConnections: '每个节点最少连接数',
            MaxConnections: '每个节点最多连接数',
            RestLayerInterval: '休息点出现间隔层数',
            StartingHealth: '玩家初始生命值',
            StartingEnergy: '玩家初始能量',
            StartingGold: '玩家初始金币',
            CombatBaseReward: '战斗基础金币奖励',
            CombatLayerBonus: '战斗每层额外金币奖励',
            TreasureBaseGold: '宝箱基础金币奖励',
            TreasureLayerBonus: '宝箱每层额外金币奖励',
            RestHealPercent: '休息点恢复生命值比例',
            BossHealthMultiplier: 'Boss生命值倍数',
            BossEnergyBonus: 'Boss额外能量',
            TowerCompletionReward: '完成爬塔基础奖励',
            TowerCompletionLayerBonus: '完成爬塔每层额外奖励'
        };
        return descriptions[key] || '未知配置项';
    }

    /**
     * 获取配置项分类
     */
    getTowerConfigCategory(key) {
        const categories = {
            TotalLayers: 'Map',
            MinNodesPerLayer: 'Map',
            MaxNodesPerLayer: 'Map',
            MinConnections: 'Map',
            MaxConnections: 'Map',
            RestLayerInterval: 'Map',
            StartingHealth: 'Player',
            StartingEnergy: 'Player',
            StartingGold: 'Player',
            CombatBaseReward: 'Rewards',
            CombatLayerBonus: 'Rewards',
            TreasureBaseGold: 'Rewards',
            TreasureLayerBonus: 'Rewards',
            RestHealPercent: 'Healing',
            BossHealthMultiplier: 'Combat',
            BossEnergyBonus: 'Combat',
            TowerCompletionReward: 'Rewards',
            TowerCompletionLayerBonus: 'Rewards'
        };
        return categories[key] || 'General';
    }

    /**
     * 加载默认配置（当CSV加载失败时使用）
     */
    loadDefaultConfigs() {
        console.log('使用默认配置');
        
        // 默认主配置
        const defaultTowerConfig = {
            TotalLayers: { value: 8, description: '爬塔总层数', category: 'Map' },
            MinNodesPerLayer: { value: 2, description: '每层最少节点数', category: 'Map' },
            MaxNodesPerLayer: { value: 4, description: '每层最多节点数', category: 'Map' },
            MinConnections: { value: 1, description: '每个节点最少连接数', category: 'Map' },
            MaxConnections: { value: 3, description: '每个节点最多连接数', category: 'Map' },
            RestLayerInterval: { value: 3, description: '休息点出现间隔层数', category: 'Map' },
            StartingHealth: { value: 30, description: '玩家初始生命值', category: 'Player' },
            StartingEnergy: { value: 3, description: '玩家初始能量', category: 'Player' },
            StartingGold: { value: 0, description: '玩家初始金币', category: 'Player' },
            CombatBaseReward: { value: 10, description: '战斗基础金币奖励', category: 'Rewards' },
            CombatLayerBonus: { value: 5, description: '战斗每层额外金币奖励', category: 'Rewards' },
            TreasureBaseGold: { value: 25, description: '宝箱基础金币奖励', category: 'Rewards' },
            TreasureLayerBonus: { value: 10, description: '宝箱每层额外金币奖励', category: 'Rewards' },
            RestHealPercent: { value: 0.3, description: '休息点恢复生命值比例', category: 'Healing' },
            BossHealthMultiplier: { value: 1.5, description: 'Boss生命值倍数', category: 'Combat' },
            BossEnergyBonus: { value: 1, description: 'Boss额外能量', category: 'Combat' },
            TowerCompletionReward: { value: 100, description: '完成爬塔基础奖励', category: 'Rewards' },
            TowerCompletionLayerBonus: { value: 20, description: '完成爬塔每层额外奖励', category: 'Rewards' }
        };
        
        Object.entries(defaultTowerConfig).forEach(([key, config]) => {
            this.configs.tower.set(key, config);
        });

        // 默认节点类型配置
        const defaultNodeTypes = {
            combat: { displayName: '战斗', icon: '⚔️', description: '与敌人战斗获得经验和奖励', weight: 60, minLayer: 1, maxLayer: 7, isSpecial: false },
            treasure: { displayName: '宝箱', icon: '📦', description: '打开宝箱获得珍贵物品', weight: 25, minLayer: 1, maxLayer: 7, isSpecial: false },
            rest: { displayName: '休息点', icon: '🔥', description: '在这里休息恢复生命值或升级卡牌', weight: 15, minLayer: 1, maxLayer: 7, isSpecial: false },
            boss: { displayName: 'Boss', icon: '👹', description: '挑战强大的Boss', weight: 100, minLayer: 8, maxLayer: 8, isSpecial: true },
            start: { displayName: '起始点', icon: '🏠', description: '冒险的起点', weight: 100, minLayer: 0, maxLayer: 0, isSpecial: true }
        };
        
        Object.entries(defaultNodeTypes).forEach(([key, config]) => {
            this.configs.nodeTypes.set(key, config);
        });

        // 默认奖励配置
        const defaultRewards = {
            gold: { icon: '💰', baseAmount: 25, layerMultiplier: 10, probability: 100, minLayer: 0, maxLayer: 8, description: '获得金币' },
            health: { icon: '❤️', baseAmount: 5, layerMultiplier: 2, probability: 30, minLayer: 0, maxLayer: 8, description: '恢复生命值' },
            energy: { icon: '⚡', baseAmount: 1, layerMultiplier: 0, probability: 20, minLayer: 0, maxLayer: 8, description: '增加最大能量' },
            card_common: { icon: '🃏', baseAmount: 1, layerMultiplier: 0, probability: 40, minLayer: 0, maxLayer: 8, description: '获得普通卡牌' },
            card_rare: { icon: '🎴', baseAmount: 1, layerMultiplier: 0, probability: 25, minLayer: 2, maxLayer: 8, description: '获得稀有卡牌' },
            card_epic: { icon: '🎯', baseAmount: 1, layerMultiplier: 0, probability: 10, minLayer: 4, maxLayer: 8, description: '获得史诗卡牌' },
            card_legendary: { icon: '⭐', baseAmount: 1, layerMultiplier: 0, probability: 5, minLayer: 6, maxLayer: 8, description: '获得传说卡牌' }
        };
        
        Object.entries(defaultRewards).forEach(([key, config]) => {
            this.configs.rewards.set(key, config);
        });

        this.isLoaded = true;
    }

    /**
     * 验证配置完整性
     */
    validateConfigs() {
        // 验证必需的配置项
        const requiredTowerConfigs = [
            'TotalLayers', 'MinNodesPerLayer', 'MaxNodesPerLayer',
            'StartingHealth', 'StartingEnergy', 'StartingGold'
        ];
        
        const requiredNodeTypes = ['combat', 'treasure', 'rest', 'boss', 'start'];
        
        // 检查主配置
        requiredTowerConfigs.forEach(key => {
            if (!this.configs.tower.has(key)) {
                console.warn(`缺少必需的配置项: ${key}`);
            }
        });
        
        // 检查节点类型
        requiredNodeTypes.forEach(type => {
            if (!this.configs.nodeTypes.has(type)) {
                console.warn(`缺少必需的节点类型: ${type}`);
            }
        });
        
        console.log('配置验证完成');
    }

    /**
     * 获取主配置值
     */
    getTowerConfig(key, defaultValue = null) {
        const config = this.configs.tower.get(key);
        return config ? config.value : defaultValue;
    }

    /**
     * 获取节点类型配置
     */
    getNodeTypeConfig(nodeType) {
        return this.configs.nodeTypes.get(nodeType) || null;
    }

    /**
     * 获取所有节点类型
     */
    getAllNodeTypes() {
        return Array.from(this.configs.nodeTypes.keys());
    }

    /**
     * 获取可用于指定层的节点类型
     */
    getAvailableNodeTypesForLayer(layer) {
        const availableTypes = [];
        
        this.configs.nodeTypes.forEach((config, nodeType) => {
            if (layer >= config.minLayer && layer <= config.maxLayer && !config.isSpecial) {
                availableTypes.push({
                    type: nodeType,
                    weight: config.weight,
                    ...config
                });
            }
        });
        
        return availableTypes;
    }

    /**
     * 获取奖励配置
     */
    getRewardConfig(rewardType) {
        return this.configs.rewards.get(rewardType) || null;
    }

    /**
     * 获取可用于指定层的奖励类型
     */
    getAvailableRewardsForLayer(layer) {
        const availableRewards = [];
        
        this.configs.rewards.forEach((config, rewardType) => {
            if (layer >= config.minLayer && layer <= config.maxLayer) {
                availableRewards.push({
                    type: rewardType,
                    probability: config.probability,
                    ...config
                });
            }
        });
        
        return availableRewards;
    }

    /**
     * 计算奖励数量
     */
    calculateRewardAmount(rewardType, layer) {
        const config = this.getRewardConfig(rewardType);
        if (!config) return 0;
        
        return config.baseAmount + (config.layerMultiplier * layer);
    }

    /**
     * 获取所有配置（用于调试）
     */
    getAllConfigs() {
        return {
            tower: Object.fromEntries(this.configs.tower),
            nodeTypes: Object.fromEntries(this.configs.nodeTypes),
            rewards: Object.fromEntries(this.configs.rewards)
        };
    }

    /**
     * 重新加载配置
     */
    async reload() {
        this.isLoaded = false;
        this.configs.tower.clear();
        this.configs.nodeTypes.clear();
        this.configs.rewards.clear();
        
        await this.loadAllConfigs();
    }

    /**
     * 同步加载配置（不使用async）
     */
    loadSync() {
        try {
            console.log('同步加载爬塔配置...');
            
            // 检查ConfigData是否可用
            if (!window.ConfigData) {
                console.warn('ConfigData未加载，使用默认配置');
                this.loadDefaultConfigs();
                return;
            }
            
            // 从ConfigData加载配置
            this.loadFromConfigData();
            
            this.isLoaded = true;
            console.log('爬塔配置同步加载完成');
            
            // 验证配置完整性
            this.validateConfigs();
            
        } catch (error) {
            console.error('同步加载爬塔配置失败:', error);
            this.loadDefaultConfigs();
        }
    }

    /**
     * 导出配置到JSON（用于备份或调试）
     */
    exportToJSON() {
        return JSON.stringify(this.getAllConfigs(), null, 2);
    }
}

// 创建全局实例
const TowerConfig = new TowerConfigManager();

// 导出到全局
if (typeof window !== 'undefined') {
    window.TowerConfig = TowerConfig;
    window.TowerConfigManager = TowerConfigManager;
} 