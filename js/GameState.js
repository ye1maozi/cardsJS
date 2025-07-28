/**
 * 游戏状态类 - 对应C#版本的GameState类
 */
class GameState {
    constructor() {
        // 创建角色系统
        this.playerCharacter = new Character("玩家", "战士");
        this.computerCharacter = new Character("电脑", "法师");
        
        // 为角色设置游戏状态引用
        this.playerCharacter.gameState = this;
        this.computerCharacter.gameState = this;
        
        // 创建吟唱系统
        this.playerCastingSystem = new CastingSystem();
        this.computerCastingSystem = new CastingSystem();
        
        // 玩家状态（兼容旧系统）
        this.playerHealth = this.playerCharacter.currentHealth;
        this.playerEnergy = this.playerCharacter.currentEnergy;
        this.playerArmor = 0;
        this.playerDeck = [];
        this.playerHand = [];
        this.playerDiscardPile = [];
        
        // 电脑状态（兼容旧系统）
        this.computerHealth = this.computerCharacter.currentHealth;
        this.computerEnergy = this.computerCharacter.currentEnergy;
        this.computerArmor = 0;
        this.computerDeck = [];
        this.computerHand = [];
        this.computerDiscardPile = [];
        
        // 游戏状态
        this.gameOver = false;
        this.winner = null;
        
        // 时间系统
        this.lastUpdateTime = Date.now();
        this.gameStartTime = Date.now();
        
        // 抽牌时间系统
        this.lastPlayerDrawTime = 0;
        this.lastComputerDrawTime = 0;
        this.drawInterval = 3; // 每3秒抽一张牌
        
        // 初始化牌组
        this.initializeDeck();
        
        // UI引用（将在Game.js中设置）
        this.gameUI = null;
    }

    /**
     * 初始化牌组
     */
    async initializeDeck() {
        try {
            // 尝试从配置管理器加载卡牌
            if (CardConfigManager.isConfigLoaded()) {
                this.loadCardsFromConfig();
            } else {
                // 如果配置未加载，尝试异步加载
                const success = await CardConfigManager.loadCardConfigs();
                if (success) {
                    this.loadCardsFromConfig();
                } else {
                    // 如果配置加载失败，使用默认配置
                    this.initializeDefaultDeck();
                }
            }
        } catch (error) {
            console.error('初始化牌组失败，使用默认配置:', error);
            this.initializeDefaultDeck();
        }
    }

    /**
     * 从配置管理器加载卡牌
     */
    loadCardsFromConfig() {
        const allConfigs = CardConfigManager.getAllCardConfigs();
        const playerCards = [];
        const computerCards = [];

        // 为每个职业选择3张卡牌
        const classes = ['战士', '法师', '盗贼', '牧师'];
        for (const cardClass of classes) {
            const classCards = CardConfigManager.getCardConfigsByClass(cardClass);
            for (let i = 0; i < 3 && i < classCards.length; i++) {
                const card = CardConfigManager.createCard(classCards[i]);
                if (card) {
                    playerCards.push(card);
                    computerCards.push(card);
                }
            }
        }

        this.playerDeck = [...playerCards];
        this.computerDeck = [...computerCards];
        
        console.log(`从配置加载了 ${this.playerDeck.length} 张卡牌`);
    }

    /**
     * 初始化默认牌组
     */
    initializeDefaultDeck() {
        const defaultCards = [
            new Card("打击", "战士", 1, 0, "瞬发", "对单体目标造成6点伤害", "DAMAGE_6", 6, 0, 0),
            new Card("断筋", "战士", 1, 0, "瞬发", "对单体目标造成3点伤害，并使目标速度降低3点，持续5秒", "DAMAGE_3_SLOW", 3, 3, 5),
            new Card("盾击", "战士", 2, 0, "瞬发", "对单体目标造成4点伤害，并获得3点护甲", "DAMAGE_4_ARMOR", 4, 3, 0),
            new Card("火球术", "法师", 2, 0, "1秒", "对单体目标造成8点伤害", "DAMAGE_8", 8, 0, 0),
            new Card("冰霜新星", "法师", 3, 0, "瞬发", "对所有敌人造成4点伤害，并使其速度降低2点", "DAMAGE_4_ALL_SLOW", 4, 2, 0),
            new Card("奥术冲击", "法师", 1, 0, "瞬发", "消耗当前所有能量，对目标释放一次强力的奥术冲击", "CONSUME_ALL_ENERGY", 2, 0, 0),
            new Card("毒刃", "盗贼", 1, 0, "瞬发", "立刻攻击目标，造成6点伤害，并使其获得3层中毒", "DAMAGE_6_POISON", 6, 3, 0),
            new Card("伏击", "盗贼", 2, 0, "瞬发", "只能在潜行状态下使用，立刻攻击，造成15点伤害", "DAMAGE_15", 15, 0, 0),
            new Card("疾跑", "盗贼", 1, 0, "瞬发", "立刻进入潜行状态，最多可持续10秒", "STEALTH", 10, 0, 0),
            new Card("治疗术", "牧师", 1, 0, "瞬发", "恢复6点生命值", "HEAL_6", 6, 0, 0),
            new Card("神圣新星", "牧师", 2, 0, "瞬发", "对所有友军恢复{0}点生命值", "HEAL_4_ALL", 4, 0, 0),
            new Card("驱散", "牧师", 1, 0, "瞬发", "移除目标身上的所有负面效果", "DISPEL", 0, 0, 0)
        ];

        this.playerDeck = [...defaultCards];
        this.computerDeck = [...defaultCards];
        
        console.log(`使用默认配置加载了 ${this.playerDeck.length} 张卡牌`);
    }

    /**
     * 洗牌
     * @param {Card[]} deck - 要洗的牌组
     */
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    /**
     * 发初始手牌
     */
    dealInitialCards() {
        // 洗牌
        this.shuffleDeck(this.playerDeck);
        this.shuffleDeck(this.computerDeck);

        // 发5张手牌
        for (let i = 0; i < 5; i++) {
            if (this.playerDeck.length > 0) {
                this.playerHand.push(this.playerDeck.pop());
            }
            if (this.computerDeck.length > 0) {
                this.computerHand.push(this.computerDeck.pop());
            }
        }
    }

    /**
     * 开始新回合（已废弃，改为基于时间的抽牌系统）
     * @deprecated 使用updateTimeBasedDrawing替代
     */
    startNewTurn() {
        console.warn('startNewTurn已废弃，游戏现在使用基于时间的抽牌系统');
    }
    
    /**
     * 更新游戏状态（每帧调用）
     */
    update() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
        this.lastUpdateTime = currentTime;
        
        // 更新角色状态
        this.playerCharacter.update(deltaTime);
        this.computerCharacter.update(deltaTime);
        
        // 同步状态到旧系统（兼容性）
        this.playerHealth = this.playerCharacter.currentHealth;
        this.playerEnergy = this.playerCharacter.currentEnergy;
        this.computerHealth = this.computerCharacter.currentHealth;
        this.computerEnergy = this.computerCharacter.currentEnergy;
        
        // 更新吟唱系统
        this.playerCastingSystem.updateCasting(deltaTime);
        this.computerCastingSystem.updateCasting(deltaTime);
        
        // 更新潜行系统
        this.playerCharacter.stealthSystem.updateStealth(deltaTime);
        this.computerCharacter.stealthSystem.updateStealth(deltaTime);
        
        // 基于时间的抽牌系统
        this.updateTimeBasedDrawing(currentTime);
        
        // 检查游戏结束
        this.checkGameEnd();
    }
    
    /**
     * 基于时间的抽牌系统
     * @param {number} currentTime - 当前时间戳
     */
    updateTimeBasedDrawing(currentTime) {
        const gameTime = (currentTime - this.gameStartTime) / 1000; // 游戏进行时间（秒）
        
        // 玩家抽牌检查
        if (gameTime - this.lastPlayerDrawTime >= this.drawInterval) {
            this.drawCards(this.playerDeck, this.playerHand, 1, true);
            this.lastPlayerDrawTime = gameTime;
            console.log(`玩家自动抽牌，游戏时间: ${gameTime.toFixed(1)}秒`);
        }
        
        // 电脑抽牌检查
        if (gameTime - this.lastComputerDrawTime >= this.drawInterval) {
            this.drawCards(this.computerDeck, this.computerHand, 1, false);
            this.lastComputerDrawTime = gameTime;
            console.log(`电脑自动抽牌，游戏时间: ${gameTime.toFixed(1)}秒`);
            
            // 电脑AI决策（在抽牌后）
            setTimeout(() => {
                if (!this.gameOver) {
                    const aiResult = this.computerTurn();
                    console.log(`电脑AI决策: ${aiResult}`);
                    
                    // 通知UI显示AI决策结果
                    if (this.gameUI) {
                        this.gameUI.showAIResult(aiResult);
                    }
                }
            }, 500); // 延迟500ms执行AI决策
        }
    }

    /**
     * 抽牌
     * @param {Card[]} deck - 牌组
     * @param {Card[]} hand - 手牌
     * @param {number} count - 抽牌数量
     * @param {boolean} isPlayer - 是否为玩家
     */
    drawCards(deck, hand, count, isPlayer) {
        for (let i = 0; i < count; i++) {
            if (deck.length === 0) {
                // 如果牌组为空，将弃牌堆洗入牌组
                this.shuffleDiscardPileIntoDeck(deck, hand, isPlayer);
            }
            
            if (deck.length > 0) {
                hand.push(deck.pop());
            }
        }
    }

    /**
     * 将弃牌堆洗入牌组
     * @param {Card[]} deck - 牌组
     * @param {Card[]} hand - 手牌
     * @param {boolean} isPlayer - 是否为玩家
     */
    shuffleDiscardPileIntoDeck(deck, hand, isPlayer) {
        const discardPile = isPlayer ? this.playerDiscardPile : this.computerDiscardPile;
        
        if (discardPile.length > 0) {
            deck.push(...discardPile);
            discardPile.length = 0;
            this.shuffleDeck(deck);
        }
    }

    /**
     * 使用卡牌
     * @param {Card} card - 要使用的卡牌
     * @param {boolean} isPlayer - 是否为玩家使用
     * @returns {object} 使用结果
     */
    useCard(card, isPlayer) {
        const character = isPlayer ? this.playerCharacter : this.computerCharacter;
        const castingSystem = isPlayer ? this.playerCastingSystem : this.computerCastingSystem;
        const hand = isPlayer ? this.playerHand : this.computerHand;
        const discardPile = isPlayer ? this.playerDiscardPile : this.computerDiscardPile;

        // 检查能量是否足够
        if (!character.consumeEnergy(card.energyCost)) {
            return { success: false, message: "能量不足" };
        }

        // 同步能量状态
        if (isPlayer) {
            this.playerEnergy = character.currentEnergy;
        } else {
            this.computerEnergy = character.currentEnergy;
        }

        // 从手牌移除卡牌（使用索引确保移除正确的卡牌）
        if (card.handIndex !== undefined && card.handIndex >= 0 && card.handIndex < hand.length) {
            hand.splice(card.handIndex, 1);
        } else {
            // 后备方案：查找并移除第一张匹配的卡牌
            const cardIndex = hand.findIndex(c => c.name === card.name);
            if (cardIndex !== -1) {
                hand.splice(cardIndex, 1);
            }
        }

        // 检查是否需要吟唱
        if (card.castTime > 0) {
            // 开始吟唱
            const target = isPlayer ? this.computerCharacter : this.playerCharacter;
            if (castingSystem.startCasting(card, character, target)) {
                return {
                    success: true,
                    message: `${character.name} 开始吟唱 ${card.name}`,
                    effectResult: `吟唱时间: ${card.castTime}秒`,
                    isCasting: true
                };
            } else {
                return { success: false, message: "已经在吟唱中" };
            }
        } else {
            // 瞬发卡牌，直接执行效果
            const effectResult = card.executeEffect(this, isPlayer);
            
            // 将卡牌加入弃牌堆
            discardPile.push(card);

            return {
                success: true,
                message: `${isPlayer ? '玩家' : '电脑'}使用了 ${card.name}`,
                effectResult: effectResult
            };
        }
    }

    /**
     * 电脑AI决策
     * @returns {string} AI决策结果描述
     */
    computerTurn() {
        // 使用BotPlayer进行智能决策
        if (!this.botPlayer) {
            this.botPlayer = new BotPlayer(this);
        }
        
        return this.botPlayer.executeTurn();
    }

    /**
     * 检查游戏是否结束
     * @returns {object} 游戏结束状态
     */
    checkGameEnd() {
        if (this.playerHealth <= 0) {
            this.gameOver = true;
            this.winner = "电脑";
            return { isOver: true, winner: "电脑", message: "电脑获胜！" };
        }
        
        if (this.computerHealth <= 0) {
            this.gameOver = true;
            this.winner = "玩家";
            return { isOver: true, winner: "玩家", message: "玩家获胜！" };
        }

        return { isOver: false };
    }

    /**
     * 重置游戏状态
     */
    reset() {
        // 重置角色状态
        this.playerCharacter = new Character("玩家", "战士");
        this.computerCharacter = new Character("电脑", "法师");
        
        // 为角色设置游戏状态引用
        this.playerCharacter.gameState = this;
        this.computerCharacter.gameState = this;
        
        // 重置玩家状态
        this.playerHealth = this.playerCharacter.currentHealth;
        this.playerEnergy = this.playerCharacter.currentEnergy;
        this.playerArmor = 0;
        this.playerDeck = [];
        this.playerHand = [];
        this.playerDiscardPile = [];

        // 重置电脑状态
        this.computerHealth = this.computerCharacter.currentHealth;
        this.computerEnergy = this.computerCharacter.currentEnergy;
        this.computerArmor = 0;
        this.computerDeck = [];
        this.computerHand = [];
        this.computerDiscardPile = [];

        // 重置游戏状态
        this.gameOver = false;
        this.winner = null;
        
        // 重置时间系统
        this.lastUpdateTime = Date.now();
        this.gameStartTime = Date.now();
        this.lastPlayerDrawTime = 0;
        this.lastComputerDrawTime = 0;

        // 重置BotPlayer
        if (this.botPlayer) {
            this.botPlayer.reset();
        }

        this.initializeDeck();
        this.dealInitialCards();
    }

    /**
     * 获取游戏状态信息
     * @returns {object} 游戏状态信息
     */
    getGameInfo() {
        const gameTime = (Date.now() - this.gameStartTime) / 1000;
        return {
            playerHealth: this.playerHealth,
            playerEnergy: this.playerEnergy,
            playerArmor: this.playerArmor,
            playerDeckCount: this.playerDeck.length,
            playerHandCount: this.playerHand.length,
            playerDiscardCount: this.playerDiscardPile.length,
            
            computerHealth: this.computerHealth,
            computerEnergy: this.computerEnergy,
            computerArmor: this.computerArmor,
            computerDeckCount: this.computerDeck.length,
            computerHandCount: this.computerHand.length,
            computerDiscardCount: this.computerDiscardPile.length,
            
            gameTime: gameTime,
            drawInterval: this.drawInterval,
            gameOver: this.gameOver,
            winner: this.winner
        };
    }
} 