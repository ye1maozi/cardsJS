/**
 * 节点类型枚举
 */
const NodeType = {
    COMBAT: 'combat',        // 战斗
    TREASURE: 'treasure',    // 宝箱
    REST: 'rest',           // 休息点
    BOSS: 'boss',           // Boss战
    START: 'start',         // 起始点
    ELITE: 'elite',         // 精英战
    SHOP: 'shop',           // 商店
    EVENT: 'event'          // 随机事件
};

/**
 * 游戏节点类
 */
class GameNode {
    constructor(id, type, layer, position) {
        this.id = id;
        this.type = type;
        this.layer = layer;          // 所在层数
        this.position = position;    // 在该层的位置
        this.completed = false;      // 是否已完成
        this.available = false;      // 是否可选择
        this.connectedNodes = [];    // 连接的下一层节点
        this.data = {};             // 节点特定数据（如怪物配置、奖励等）
    }

    /**
     * 获取节点显示名称
     */
    getDisplayName() {
        const config = TowerConfig.getNodeTypeConfig(this.type);
        return config ? config.displayName : '未知';
    }

    /**
     * 获取节点图标
     */
    getIcon() {
        const config = TowerConfig.getNodeTypeConfig(this.type);
        return config ? config.icon : '❓';
    }

    /**
     * 获取节点描述
     */
    getDescription() {
        const config = TowerConfig.getNodeTypeConfig(this.type);
        return config ? config.description : '';
    }
}

/**
 * 地图系统类
 */
class MapSystem {
    constructor() {
        this.nodes = new Map();      // 所有节点
        this.layers = [];            // 按层组织的节点
        this.currentNode = null;     // 当前节点
        
        // 从配置获取参数
        this.totalLayers = TowerConfig.getTowerConfig('TotalLayers', 8);
        this.minNodesPerLayer = TowerConfig.getTowerConfig('MinNodesPerLayer', 2);
        this.maxNodesPerLayer = TowerConfig.getTowerConfig('MaxNodesPerLayer', 4);
        this.minConnections = TowerConfig.getTowerConfig('MinConnections', 1);
        this.maxConnections = TowerConfig.getTowerConfig('MaxConnections', 3);
        this.restLayerInterval = TowerConfig.getTowerConfig('RestLayerInterval', 3);
    }

    /**
     * 生成新地图
     */
    generateMap() {
        this.nodes.clear();
        this.layers = [];
        
        console.log('开始生成地图...');
        
        // 生成每一层
        for (let layer = 0; layer < this.totalLayers; layer++) {
            this.layers[layer] = [];
            
            if (layer === 0) {
                // 第一层：起始点
                this.generateStartLayer(layer);
            } else if (layer === this.totalLayers - 1) {
                // 最后一层：Boss层
                this.generateBossLayer(layer);
            } else {
                // 中间层：普通层
                this.generateNormalLayer(layer);
            }
        }
        
        // 建立连接关系
        this.establishConnections();
        
        // 设置起始节点为可用
        this.setStartingNode();
        
        console.log(`地图生成完成，共${this.totalLayers}层，${this.nodes.size}个节点`);
    }

    /**
     * 生成起始层
     */
    generateStartLayer(layer) {
        const node = new GameNode('start', NodeType.START, layer, 0);
        this.nodes.set(node.id, node);
        this.layers[layer].push(node);
    }

    /**
     * 生成Boss层
     */
    generateBossLayer(layer) {
        const node = new GameNode(`boss_${layer}`, NodeType.BOSS, layer, 0);
        node.data.monsterConfig = this.getBossConfig(layer);
        this.nodes.set(node.id, node);
        this.layers[layer].push(node);
    }

    /**
     * 生成普通层
     */
    generateNormalLayer(layer) {
        // 从配置获取节点数量范围
        const nodeCount = Math.floor(Math.random() * (this.maxNodesPerLayer - this.minNodesPerLayer + 1)) + this.minNodesPerLayer;
        
        // 决定节点类型分布
        const nodeTypes = this.generateNodeTypes(nodeCount, layer);
        
        for (let pos = 0; pos < nodeCount; pos++) {
            const nodeType = nodeTypes[pos];
            const nodeId = `${nodeType}_${layer}_${pos}`;
            const node = new GameNode(nodeId, nodeType, layer, pos);
            
            // 设置节点特定数据
            this.setupNodeData(node, layer);
            
            this.nodes.set(node.id, node);
            this.layers[layer].push(node);
        }
    }

    /**
     * 生成节点类型分布
     */
    generateNodeTypes(nodeCount, layer) {
        const types = [];
        
        // 获取当前层可用的节点类型
        const availableTypes = TowerConfig.getAvailableNodeTypesForLayer(layer);
        
        // 确保每层至少有一个战斗节点
        types.push('combat');
        
        // 检查是否需要强制添加休息点
        if (layer % this.restLayerInterval === 0 && layer > 0) {
            const hasRest = types.includes('rest');
            if (!hasRest && availableTypes.some(t => t.type === 'rest')) {
                types.push('rest');
            }
        }
        
        // 使用权重系统生成其余节点类型
        for (let i = types.length; i < nodeCount; i++) {
            const selectedType = this.selectRandomNodeType(availableTypes);
            types.push(selectedType);
        }
        
        // 打乱顺序
        return this.shuffleArray(types);
    }
    
    /**
     * 根据权重随机选择节点类型
     */
    selectRandomNodeType(availableTypes) {
        const totalWeight = availableTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const typeConfig of availableTypes) {
            random -= typeConfig.weight;
            if (random <= 0) {
                return typeConfig.type;
            }
        }
        
        // 如果出现意外，返回战斗类型
        return 'combat';
    }

    /**
     * 设置节点数据
     */
    setupNodeData(node, layer) {
        switch (node.type) {
            case NodeType.COMBAT:
                node.data.monsterConfig = this.getRandomMonster(layer);
                break;
            case NodeType.TREASURE:
                node.data.rewards = this.generateTreasureRewards(layer);
                break;
            case NodeType.REST:
                node.data.restOptions = ['heal', 'upgrade'];
                break;
            case 'shop':
                node.data.shopItems = this.generateShopItems(layer);
                break;
            case 'event':
                node.data.eventConfig = this.getRandomEvent(layer);
                break;
            case 'elite':
                node.data.monsterConfig = this.getEliteMonster(layer);
                break;
        }
    }

    /**
     * 建立节点连接关系
     */
    establishConnections() {
        for (let layer = 0; layer < this.totalLayers - 1; layer++) {
            const currentLayer = this.layers[layer];
            const nextLayer = this.layers[layer + 1];
            
            currentLayer.forEach(node => {
                // 使用配置中的连接数量范围
                const maxConnections = Math.min(nextLayer.length, this.maxConnections);
                const connectionCount = Math.floor(Math.random() * (maxConnections - this.minConnections + 1)) + this.minConnections;
                const availableTargets = [...nextLayer];
                
                for (let i = 0; i < connectionCount; i++) {
                    if (availableTargets.length > 0) {
                        const randomIndex = Math.floor(Math.random() * availableTargets.length);
                        const targetNode = availableTargets.splice(randomIndex, 1)[0];
                        node.connectedNodes.push(targetNode.id);
                    }
                }
            });
        }
    }

    /**
     * 设置起始节点
     */
    setStartingNode() {
        const startNode = this.layers[0][0];
        startNode.available = true;
        this.currentNode = startNode;
    }

    /**
     * 完成节点并解锁下一层可选节点
     */
    completeNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return false;
        
        node.completed = true;
        
        // 解锁连接的下一层节点
        node.connectedNodes.forEach(connectedId => {
            const connectedNode = this.nodes.get(connectedId);
            if (connectedNode) {
                connectedNode.available = true;
            }
        });
        
        return true;
    }

    /**
     * 获取可选择的节点
     */
    getAvailableNodes() {
        return Array.from(this.nodes.values()).filter(node => 
            node.available && !node.completed
        );
    }

    /**
     * 获取当前层可选节点
     */
    getCurrentLayerAvailableNodes() {
        const availableNodes = this.getAvailableNodes();
        if (availableNodes.length === 0) return [];
        
        const currentLayer = availableNodes[0].layer;
        return availableNodes.filter(node => node.layer === currentLayer);
    }

    /**
     * 获取随机怪物配置
     */
    getRandomMonster(layer) {
        const monsters = ConfigData.MONSTER_CONFIG_DATA || [];
        if (monsters.length === 0) {
            return {
                id: 'default',
                name: '敌人',
                class: '战士',
                maxHealth: 20 + layer * 5,
                maxEnergy: 3,
                difficulty: Math.min(layer + 1, 5)
            };
        }
        
        // 根据层数选择适当难度的怪物
        const suitableMonsters = monsters.filter(monster => 
            monster.difficulty <= Math.floor(layer / 2) + 1
        );
        
        return suitableMonsters.length > 0 
            ? suitableMonsters[Math.floor(Math.random() * suitableMonsters.length)]
            : monsters[Math.floor(Math.random() * monsters.length)];
    }

    /**
     * 获取Boss配置
     */
    getBossConfig(layer) {
        // 优先使用专门的Boss配置数据
        const bossConfigs = ConfigData.BOSS_CONFIG_DATA || [];
        
        // 从配置获取Boss增强参数
        const healthMultiplier = TowerConfig.getTowerConfig('BossHealthMultiplier', 1.5);
        const energyBonus = TowerConfig.getTowerConfig('BossEnergyBonus', 1);
        
        if (bossConfigs.length > 0) {
            // 根据层数选择合适的Boss
            const suitableBosses = bossConfigs.filter(boss => boss.difficulty >= 3);
            const selectedBoss = suitableBosses.length > 0 
                ? suitableBosses[Math.floor(Math.random() * suitableBosses.length)]
                : bossConfigs[Math.floor(Math.random() * bossConfigs.length)];
            
            // 使用配置增强Boss属性
            return {
                ...selectedBoss,
                maxHealth: Math.floor(selectedBoss.maxHealth * healthMultiplier),
                maxEnergy: Math.min(selectedBoss.maxEnergy + energyBonus, 10),
                name: `${selectedBoss.name} (Boss)`,
                isBoss: true
            };
        }
        
        // 如果没有Boss配置，回退到普通怪物配置
        const monsters = ConfigData.MONSTER_CONFIG_DATA || [];
        const bossMonsters = monsters.filter(monster => monster.difficulty >= 4);
        
        if (bossMonsters.length > 0) {
            const boss = bossMonsters[Math.floor(Math.random() * bossMonsters.length)];
            return {
                ...boss,
                maxHealth: Math.floor(boss.maxHealth * healthMultiplier),
                maxEnergy: Math.min(boss.maxEnergy + energyBonus, 10),
                name: `${boss.name} (Boss)`,
                isBoss: true
            };
        }
        
        return {
            id: 'boss',
            name: '最终Boss',
            class: '魔王',
            maxHealth: Math.floor((50 + layer * 10) * healthMultiplier),
            maxEnergy: 5 + energyBonus,
            difficulty: 5,
            isBoss: true
        };
    }

    /**
     * 获取精英怪物配置
     */
    getEliteMonster(layer) {
        const monsters = ConfigData.MONSTER_CONFIG_DATA || [];
        
        // 选择适合层数的强力怪物
        const eliteMonsters = monsters.filter(monster => 
            monster.difficulty >= Math.min(layer, 3) && monster.difficulty <= 4
        );
        
        if (eliteMonsters.length > 0) {
            const elite = eliteMonsters[Math.floor(Math.random() * eliteMonsters.length)];
            // 增强精英怪物
            return {
                ...elite,
                maxHealth: Math.floor(elite.maxHealth * 1.3),
                maxEnergy: Math.min(elite.maxEnergy + 1, 8),
                name: `精英 ${elite.name}`,
                isElite: true
            };
        }
        
        // 默认精英怪物
        return {
            id: 'elite_default',
            name: '精英战士',
            class: '战士',
            maxHealth: Math.floor((25 + layer * 8) * 1.3),
            maxEnergy: 4,
            difficulty: Math.min(layer + 1, 4),
            isElite: true
        };
    }

    /**
     * 生成商店物品
     */
    generateShopItems(layer) {
        const shopItems = ConfigData.SHOP_ITEM_DATA || [];
        
        if (shopItems.length === 0) {
            // 默认商店物品
            return [
                {
                    id: 'health_potion',
                    name: '生命药水',
                    price: 50,
                    description: '恢复15点生命值'
                },
                {
                    id: 'card_upgrade',
                    name: '升级卷轴',
                    price: 75,
                    description: '升级一张卡牌'
                }
            ];
        }
        
        // 随机选择3-5个商店物品
        const itemCount = Math.floor(Math.random() * 3) + 3;
        const shuffledItems = this.shuffleArray([...shopItems]);
        
        return shuffledItems.slice(0, Math.min(itemCount, shopItems.length)).map(item => ({
            ...item,
            // 根据层数调整价格
            price: Math.floor(item.price * (1 + layer * 0.1))
        }));
    }

    /**
     * 获取随机事件
     */
    getRandomEvent(layer) {
        const events = ConfigData.RANDOM_EVENT_DATA || [];
        
        if (events.length === 0) {
            // 默认事件
            return {
                id: 'default_event',
                name: '神秘事件',
                description: '你遇到了一个神秘的情况...',
                choices: [
                    {
                        text: '调查',
                        cost: {},
                        rewards: [{ type: 'gold', value: 25 }]
                    },
                    {
                        text: '离开',
                        cost: {},
                        rewards: []
                    }
                ]
            };
        }
        
        return events[Math.floor(Math.random() * events.length)];
    }

    /**
     * 生成宝箱奖励
     */
    generateTreasureRewards(layer) {
        const rewards = [];
        
        // 获取可用的奖励类型
        const availableRewards = TowerConfig.getAvailableRewardsForLayer(layer);
        
        // 基础奖励：金币（总是包含）
        const goldAmount = TowerConfig.calculateRewardAmount('gold', layer);
        rewards.push({
            type: 'gold',
            amount: goldAmount
        });
        
        // 生成1-3个额外奖励
        const extraRewardCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < extraRewardCount; i++) {
            const selectedReward = this.selectRandomReward(availableRewards);
            if (selectedReward) {
                const amount = TowerConfig.calculateRewardAmount(selectedReward.type, layer);
                rewards.push({
                    type: selectedReward.type,
                    amount: amount,
                    rarity: this.getCardRarityFromType(selectedReward.type)
                });
            }
        }
        
        return rewards;
    }
    
    /**
     * 根据概率随机选择奖励
     */
    selectRandomReward(availableRewards) {
        const totalProbability = availableRewards.reduce((sum, reward) => sum + reward.probability, 0);
        let random = Math.random() * totalProbability;
        
        for (const reward of availableRewards) {
            random -= reward.probability;
            if (random <= 0) {
                return reward;
            }
        }
        
        return null;
    }
    
    /**
     * 从奖励类型获取卡牌稀有度
     */
    getCardRarityFromType(rewardType) {
        if (rewardType.startsWith('card_')) {
            return rewardType.substring(5); // 移除 'card_' 前缀
        }
        return null;
    }



    /**
     * 打乱数组
     */
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * 获取地图数据用于UI显示
     */
    getMapData() {
        return {
            layers: this.layers.map(layer => 
                layer.map(node => ({
                    id: node.id,
                    type: node.type,
                    layer: node.layer,
                    position: node.position,
                    completed: node.completed,
                    available: node.available,
                    connectedNodes: node.connectedNodes,
                    displayName: node.getDisplayName(),
                    icon: node.getIcon(),
                    description: node.getDescription()
                }))
            ),
            currentNode: this.currentNode?.id,
            totalLayers: this.totalLayers
        };
    }
}

/**
 * 爬塔状态管理器
 */
class TowerState {
    constructor() {
        this.currentFloor = 0;           // 当前层数
        this.acquiredCards = [];         // 获得的卡牌
        this.upgradedCards = [];         // 升级的卡牌
        this.mapSystem = new MapSystem();
        this.isInTower = false;          // 是否在爬塔模式中
        
        // 从配置获取玩家初始属性
        this.playerMaxHealth = TowerConfig.getTowerConfig('StartingHealth', 30);
        this.playerCurrentHealth = this.playerMaxHealth;
        this.playerGold = TowerConfig.getTowerConfig('StartingGold', 0);
    }

    /**
     * 开始新的爬塔
     */
    startNewTower() {
        this.currentFloor = 0;
        this.playerMaxHealth = 30;
        this.playerCurrentHealth = 30;
        this.playerGold = 0;
        this.acquiredCards = [];
        this.upgradedCards = [];
        this.isInTower = true;
        
        // 生成新地图
        this.mapSystem.generateMap();
        
        console.log('开始新的爬塔冒险！');
    }

    /**
     * 完成节点
     */
    completeNode(nodeId, result = {}) {
        const success = this.mapSystem.completeNode(nodeId);
        if (!success) return false;
        
        const node = this.mapSystem.nodes.get(nodeId);
        if (!node) return false;
        
        // 处理节点完成后的奖励和状态更新
        this.handleNodeCompletion(node, result);
        
        // 检查是否完成了Boss层
        if (node.type === NodeType.BOSS && node.layer === this.mapSystem.totalLayers - 1) {
            this.completeTower();
        }
        
        return true;
    }

    /**
     * 处理节点完成
     */
    handleNodeCompletion(node, result) {
        switch (node.type) {
            case 'combat':
            case 'boss':
                // 战斗胜利奖励
                if (result.victory) {
                    const baseReward = TowerConfig.getTowerConfig('CombatBaseReward', 10);
                    const layerBonus = TowerConfig.getTowerConfig('CombatLayerBonus', 5);
                    const goldReward = baseReward + node.layer * layerBonus;
                    
                    this.playerGold += goldReward;
                    console.log(`战斗胜利！获得 ${goldReward} 金币`);
                }
                break;
                
            case NodeType.TREASURE:
                // 宝箱奖励
                this.processTreasureRewards(node.data.rewards);
                break;
                
            case NodeType.REST:
                // 休息点效果在UI中处理
                break;
        }
        
        this.currentFloor = Math.max(this.currentFloor, node.layer);
    }

    /**
     * 处理宝箱奖励
     */
    processTreasureRewards(rewards) {
        rewards.forEach(reward => {
            switch (reward.type) {
                case 'gold':
                    this.playerGold += reward.amount;
                    console.log(`获得 ${reward.amount} 金币`);
                    break;
                    
                case 'health':
                    this.playerCurrentHealth = Math.min(
                        this.playerCurrentHealth + reward.amount,
                        this.playerMaxHealth
                    );
                    console.log(`恢复 ${reward.amount} 生命值`);
                    break;
                    
                case 'energy':
                    console.log(`获得额外能量奖励`);
                    break;
                    
                case 'card':
                    console.log(`获得新卡牌（${reward.rarity}）`);
                    // 这里可以添加具体的卡牌获取逻辑
                    break;
            }
        });
    }

    /**
     * 完成整个爬塔
     */
    completeTower() {
        this.isInTower = false;
        console.log('恭喜！你已经完成了整个爬塔挑战！');
        
        // 使用配置计算最终奖励
        const baseReward = TowerConfig.getTowerConfig('TowerCompletionReward', 100);
        const layerBonus = TowerConfig.getTowerConfig('TowerCompletionLayerBonus', 20);
        const finalReward = baseReward + this.currentFloor * layerBonus;
        
        this.playerGold += finalReward;
        console.log(`最终奖励：${finalReward} 金币`);
    }

    /**
     * 获取当前状态
     */
    getCurrentState() {
        return {
            currentFloor: this.currentFloor,
            playerMaxHealth: this.playerMaxHealth,
            playerCurrentHealth: this.playerCurrentHealth,
            playerGold: this.playerGold,
            acquiredCards: this.acquiredCards.length,
            upgradedCards: this.upgradedCards.length,
            isInTower: this.isInTower,
            mapData: this.mapSystem.getMapData(),
            availableNodes: this.mapSystem.getCurrentLayerAvailableNodes()
        };
    }

    /**
     * 休息恢复生命值
     */
    restHeal() {
        const healPercent = TowerConfig.getTowerConfig('RestHealPercent', 0.3);
        const healAmount = Math.floor(this.playerMaxHealth * healPercent);
        this.playerCurrentHealth = Math.min(
            this.playerCurrentHealth + healAmount,
            this.playerMaxHealth
        );
        console.log(`休息恢复了 ${healAmount} 生命值`);
        return healAmount;
    }

    /**
     * 升级卡牌
     */
    upgradeCard(cardId) {
        if (!this.upgradedCards.includes(cardId)) {
            this.upgradedCards.push(cardId);
            console.log(`升级了卡牌: ${cardId}`);
            return true;
        }
        return false;
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.NodeType = NodeType;
    window.GameNode = GameNode;
    window.MapSystem = MapSystem;
    window.TowerState = TowerState;
} 