/**
 * 重构后的卡牌系统
 */
class CardSystem {
    constructor(engine) {
        this.engine = engine;
        this.eventBus = engine.eventBus;
        this.stateManager = engine.stateManager;
        this.errorHandler = engine.errorHandler;
        
        this.cardConfigs = new Map();
        this.effectStrategies = new Map();
        
        this.init();
    }

    /**
     * 初始化卡牌系统
     */
    init() {
        this.loadCardConfigs();
        this.registerEffectStrategies();
        this.setupEventListeners();
        
        console.log('卡牌系统初始化完成');
    }

    /**
     * 加载卡牌配置
     */
    loadCardConfigs() {
        try {
            // 从ConfigData加载卡牌配置
            if (window.ConfigData && window.ConfigData.CARD_CONFIG_DATA) {
                window.ConfigData.CARD_CONFIG_DATA.forEach(config => {
                    this.cardConfigs.set(config.name, config);
                });
                console.log(`加载了 ${this.cardConfigs.size} 张卡牌配置`);
            } else {
                console.warn('卡牌配置数据不可用');
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'config',
                system: 'card',
                operation: 'loadConfigs'
            });
        }
    }

    /**
     * 注册效果策略
     */
    registerEffectStrategies() {
        // 伤害效果
        this.effectStrategies.set('DAMAGE', new DamageEffectStrategy());
        this.effectStrategies.set('DAMAGE_POISON', new DamagePoisonEffectStrategy());
        this.effectStrategies.set('DAMAGE_SLOW', new DamageSlowEffectStrategy());
        this.effectStrategies.set('DAMAGE_ARMOR', new DamageArmorEffectStrategy());
        
        // 治疗效果
        this.effectStrategies.set('HEAL', new HealEffectStrategy());
        this.effectStrategies.set('HEAL_ALL', new HealAllEffectStrategy());
        
        // 特殊效果
        this.effectStrategies.set('CONSUME_ALL_ENERGY', new ConsumeAllEnergyEffectStrategy());
        this.effectStrategies.set('STEALTH', new StealthEffectStrategy());
        this.effectStrategies.set('DRAW_DISCARD', new DrawDiscardEffectStrategy());
        this.effectStrategies.set('DISPEL', new DispelEffectStrategy());
        this.effectStrategies.set('BLOOD_SACRIFICE', new BloodSacrificeEffectStrategy());
        
        console.log(`注册了 ${this.effectStrategies.size} 个效果策略`);
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        this.eventBus.on(GameEvents.CARD_PLAYED, (data) => this.handleCardPlayed(data), this);
        this.eventBus.on(GameEvents.CARD_DRAWN, (data) => this.handleCardDrawn(data), this);
        this.eventBus.on(GameEvents.CARD_DISCARDED, (data) => this.handleCardDiscarded(data), this);
    }

    /**
     * 创建卡牌
     * @param {string} cardName - 卡牌名称
     * @returns {Card|null} 卡牌对象
     */
    createCard(cardName) {
        try {
            const config = this.cardConfigs.get(cardName);
            if (!config) {
                throw new Error(`卡牌配置不存在: ${cardName}`);
            }
            
            return Card.fromConfig(config);
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'createCard',
                cardName: cardName
            });
            return null;
        }
    }

    /**
     * 创建随机卡牌
     * @param {string} cardClass - 卡牌职业
     * @returns {Card|null} 卡牌对象
     */
    createRandomCard(cardClass = null) {
        try {
            let availableCards = Array.from(this.cardConfigs.values());
            
            if (cardClass) {
                availableCards = availableCards.filter(card => card.class === cardClass);
            }
            
            if (availableCards.length === 0) {
                throw new Error(`没有可用的卡牌${cardClass ? ` (职业: ${cardClass})` : ''}`);
            }
            
            const randomConfig = availableCards[Math.floor(Math.random() * availableCards.length)];
            return this.createCard(randomConfig.name);
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'createRandomCard',
                cardClass: cardClass
            });
            return null;
        }
    }

    /**
     * 初始化牌组
     * @param {string} playerClass - 玩家职业
     * @param {string} computerClass - 电脑职业
     */
    initializeDecks(playerClass, computerClass) {
        try {
            const playerDeck = this.createDeckForClass(playerClass);
            const computerDeck = this.createDeckForClass(computerClass);
            
            this.stateManager.set('player.deck', playerDeck);
            this.stateManager.set('computer.deck', computerDeck);
            
            // 洗牌
            this.shuffleDeck('player');
            this.shuffleDeck('computer');
            
            console.log(`初始化牌组完成 - 玩家: ${playerDeck.length}张, 电脑: ${computerDeck.length}张`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'initializeDecks',
                playerClass: playerClass,
                computerClass: computerClass
            });
        }
    }

    /**
     * 为职业创建牌组
     * @param {string} characterClass - 角色职业
     * @returns {Card[]} 牌组
     */
    createDeckForClass(characterClass) {
        const deck = [];
        const classCards = Array.from(this.cardConfigs.values())
            .filter(card => card.class === characterClass);
        
        // 每个职业选择3张卡牌
        for (let i = 0; i < 3 && i < classCards.length; i++) {
            const card = this.createCard(classCards[i].name);
            if (card) {
                deck.push(card);
            }
        }
        
        return deck;
    }

    /**
     * 洗牌
     * @param {string} target - 目标 ('player' 或 'computer')
     */
    shuffleDeck(target) {
        try {
            const deck = this.stateManager.get(`${target}.deck`);
            if (!deck || deck.length === 0) return;
            
            // Fisher-Yates 洗牌算法
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            
            this.stateManager.set(`${target}.deck`, deck);
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'shuffleDeck',
                target: target
            });
        }
    }

    /**
     * 抽牌
     * @param {string} target - 目标 ('player' 或 'computer')
     * @param {number} count - 抽牌数量
     * @returns {Card[]} 抽到的卡牌
     */
    drawCards(target, count = 1) {
        try {
            const deck = this.stateManager.get(`${target}.deck`);
            const hand = this.stateManager.get(`${target}.hand`);
            const drawnCards = [];
            
            for (let i = 0; i < count; i++) {
                if (deck.length === 0) {
                    // 如果牌组为空，将弃牌堆洗入牌组
                    this.shuffleDiscardPileIntoDeck(target);
                }
                
                if (deck.length > 0) {
                    const card = deck.pop();
                    hand.push(card);
                    drawnCards.push(card);
                    
                    // 触发抽牌事件
                    this.eventBus.emit(GameEvents.CARD_DRAWN, {
                        target: target,
                        card: card,
                        handSize: hand.length
                    });
                }
            }
            
            this.stateManager.set(`${target}.deck`, deck);
            this.stateManager.set(`${target}.hand`, hand);
            
            return drawnCards;
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'drawCards',
                target: target,
                count: count
            });
            return [];
        }
    }

    /**
     * 将弃牌堆洗入牌组
     * @param {string} target - 目标 ('player' 或 'computer')
     */
    shuffleDiscardPileIntoDeck(target) {
        try {
            const deck = this.stateManager.get(`${target}.deck`);
            const discardPile = this.stateManager.get(`${target}.discardPile`);
            
            if (discardPile.length > 0) {
                deck.push(...discardPile);
                this.stateManager.set(`${target}.discardPile`, []);
                this.shuffleDeck(target);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'shuffleDiscardPileIntoDeck',
                target: target
            });
        }
    }

    /**
     * 使用卡牌
     * @param {Card} card - 卡牌对象
     * @param {string} target - 使用者 ('player' 或 'computer')
     * @returns {Object} 使用结果
     */
    useCard(card, target) {
        try {
            const hand = this.stateManager.get(`${target}.hand`);
            const energy = this.stateManager.get(`${target}.energy`);
            
            // 检查能量是否足够
            if (energy < card.energyCost) {
                return {
                    success: false,
                    message: '能量不足'
                };
            }
            
            // 从手牌移除卡牌
            const cardIndex = hand.findIndex(c => c.id === card.id);
            if (cardIndex === -1) {
                return {
                    success: false,
                    message: '卡牌不在手牌中'
                };
            }
            
            hand.splice(cardIndex, 1);
            this.stateManager.set(`${target}.hand`, hand);
            
            // 消耗能量
            this.stateManager.set(`${target}.energy`, energy - card.energyCost);
            
            // 执行卡牌效果
            const effectResult = this.executeCardEffect(card, target);
            
            // 处理卡牌去向
            this.handleCardDestination(card, target);
            
            // 触发使用卡牌事件
            this.eventBus.emit(GameEvents.CARD_PLAYED, {
                target: target,
                card: card,
                effectResult: effectResult
            });
            
            return {
                success: true,
                message: `${target} 使用了 ${card.name}`,
                effectResult: effectResult
            };
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'useCard',
                target: target,
                cardName: card.name
            });
            return {
                success: false,
                message: '使用卡牌时发生错误'
            };
        }
    }

    /**
     * 执行卡牌效果
     * @param {Card} card - 卡牌对象
     * @param {string} target - 使用者
     * @returns {string} 效果描述
     */
    executeCardEffect(card, target) {
        try {
            const strategy = this.effectStrategies.get(card.effectCode);
            if (!strategy) {
                throw new Error(`未找到效果策略: ${card.effectCode}`);
            }
            
            return strategy.execute(this.engine, target, card);
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'executeCardEffect',
                target: target,
                cardName: card.name,
                effectCode: card.effectCode
            });
            return '效果执行失败';
        }
    }

    /**
     * 处理卡牌去向
     * @param {Card} card - 卡牌对象
     * @param {string} target - 使用者
     */
    handleCardDestination(card, target) {
        try {
            if (card.isExhaust) {
                // 进入消耗堆
                const exhaustPile = this.stateManager.get(`${target}.exhaustPile`);
                exhaustPile.push(card);
                this.stateManager.set(`${target}.exhaustPile`, exhaustPile);
            } else {
                // 进入弃牌堆
                const discardPile = this.stateManager.get(`${target}.discardPile`);
                discardPile.push(card);
                this.stateManager.set(`${target}.discardPile`, discardPile);
            }
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'card',
                operation: 'handleCardDestination',
                target: target,
                cardName: card.name
            });
        }
    }

    /**
     * 处理卡牌被使用事件
     * @param {Object} data - 事件数据
     */
    handleCardPlayed(data) {
        console.log(`卡牌被使用: ${data.target} 使用了 ${data.card.name}`);
    }

    /**
     * 处理卡牌被抽取事件
     * @param {Object} data - 事件数据
     */
    handleCardDrawn(data) {
        console.log(`卡牌被抽取: ${data.target} 抽取了 ${data.card.name}`);
    }

    /**
     * 处理卡牌被丢弃事件
     * @param {Object} data - 事件数据
     */
    handleCardDiscarded(data) {
        console.log(`卡牌被丢弃: ${data.target} 丢弃了 ${data.card.name}`);
    }

    /**
     * 获取卡牌配置
     * @param {string} cardName - 卡牌名称
     * @returns {Object|null} 卡牌配置
     */
    getCardConfig(cardName) {
        return this.cardConfigs.get(cardName) || null;
    }

    /**
     * 获取所有卡牌配置
     * @returns {Array} 卡牌配置数组
     */
    getAllCardConfigs() {
        return Array.from(this.cardConfigs.values());
    }

    /**
     * 重置卡牌系统
     */
    reset() {
        this.stateManager.set('player.deck', []);
        this.stateManager.set('player.hand', []);
        this.stateManager.set('player.discardPile', []);
        this.stateManager.set('player.exhaustPile', []);
        
        this.stateManager.set('computer.deck', []);
        this.stateManager.set('computer.hand', []);
        this.stateManager.set('computer.discardPile', []);
        this.stateManager.set('computer.exhaustPile', []);
        
        console.log('卡牌系统已重置');
    }

    /**
     * 销毁卡牌系统
     */
    destroy() {
        this.cardConfigs.clear();
        this.effectStrategies.clear();
        console.log('卡牌系统已销毁');
    }
}

// 卡牌类
class Card {
    constructor(config, cardSystem) {
        this.id = this.generateId();
        this.name = config.name;
        this.class = config.class;
        this.energyCost = config.energyCost;
        this.healthCost = config.healthCost || 0;
        this.castTime = config.castTime || 0;
        this.castType = config.castType || '瞬发';
        this.effect = config.effect;
        this.effectCode = config.effectCode;
        this.value1 = config.value1 || 0;
        this.value2 = config.value2 || 0;
        this.value3 = config.value3 || 0;
        this.isExhaust = config.isExhaust || false;
        this.isLocked = false;
        this.lockedTarget = null;
        
        this.cardSystem = cardSystem;
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 锁定目标
     * @param {Object} target - 目标对象
     */
    lockTarget(target) {
        this.isLocked = true;
        this.lockedTarget = target;
    }

    /**
     * 检查是否可以攻击目标
     * @param {Object} target - 目标对象
     * @returns {boolean} 是否可以攻击
     */
    canAttackTarget(target) {
        if (this.isLocked && this.lockedTarget === target) {
            return true;
        }
        
        // 检查目标是否处于潜行状态
        const isStealthed = this.cardSystem.stateManager.get(`${target.name === '玩家' ? 'player' : 'computer'}.isStealthed`);
        return !isStealthed;
    }

    /**
     * 检查是否可以打出
     * @param {number} currentEnergy - 当前能量
     * @returns {boolean} 是否可以打出
     */
    canPlay(currentEnergy) {
        return currentEnergy >= this.energyCost;
    }

    /**
     * 获取显示文本
     * @returns {string} 显示文本
     */
    getDisplayText() {
        return `${this.name} (${this.class})`;
    }
} 