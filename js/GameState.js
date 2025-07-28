/**
 * 游戏状态类 - 对应C#版本的GameState类
 */
class GameState {
    constructor(monsterConfig = null) {
        // 保存monster配置
        this.monsterConfig = monsterConfig;
        
        // 创建角色系统
        this.playerCharacter = new Character("玩家", "战士");
        
        // 根据monster配置创建电脑角色
        if (this.monsterConfig) {
            const characterConfig = MonsterConfigManager.createCharacterFromMonster(this.monsterConfig);
            this.computerCharacter = new Character(this.monsterConfig.name, characterConfig.class, this.monsterConfig);
            // 应用monster的属性配置
            this.applyMonsterAttributes();
        } else {
            this.computerCharacter = new Character("电脑", "法师");
        }
        
        // 为角色设置游戏状态引用
        this.playerCharacter.gameState = this;
        this.computerCharacter.gameState = this;
        
        // 创建吟唱系统
        this.playerCastingSystem = new CastingSystem();
        this.computerCastingSystem = new CastingSystem();
        
        // 创建英雄技能管理器
        this.heroSkillManager = new HeroSkillManager();
        
        // 玩家状态（兼容旧系统）
        this.playerHealth = this.playerCharacter.currentHealth;
        this.playerEnergy = this.playerCharacter.currentEnergy;
        this.playerArmor = 0;
        this.playerDeck = [];
        this.playerHand = [];
        this.playerDiscardPile = [];
        this.playerExhaustPile = [];
        
        // 电脑状态（兼容旧系统）
        this.computerHealth = this.computerCharacter.currentHealth;
        this.computerEnergy = this.computerCharacter.currentEnergy;
        this.computerArmor = 0;
        this.computerDeck = [];
        this.computerHand = [];
        this.computerDiscardPile = [];
        this.computerExhaustPile = [];
        
        // 游戏状态
        this.gameOver = false;
        this.winner = null;
        this.gameTime = 0; // 游戏进行时间（秒）
        
        // 时间系统
        this.lastUpdateTime = Date.now();
        this.gameStartTime = Date.now();
        
        console.log('GameState初始化完成，gameStartTime:', this.gameStartTime);
        if (this.monsterConfig) {
            console.log(`使用monster配置: ${this.monsterConfig.name}`);
        }
        
        // 抽牌时间系统
        this.lastPlayerDrawTime = 0;
        this.lastComputerDrawTime = 0;
        this.baseDrawInterval = ConfigManager.getGameConfig('DrawInterval', 3); // 基础抽卡间隔（秒）
        this.drawInterval = ConfigManager.getGameConfig('DrawInterval', 3); // 当前抽卡间隔（秒）
        
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
                playerCards.push(card);
            }
        }

        // 根据monster配置构建电脑牌组
        if (this.monsterConfig) {
            computerCards.push(...this.buildMonsterDeck());
        } else {
            // 使用默认牌组构建方式
            for (const cardClass of classes) {
                const classCards = CardConfigManager.getCardConfigsByClass(cardClass);
                for (let i = 0; i < 3 && i < classCards.length; i++) {
                    const card = CardConfigManager.createCard(classCards[i]);
                    computerCards.push(card);
                }
            }
        }

        // 设置牌组
        this.playerDeck = [...playerCards];
        this.computerDeck = [...computerCards];

        // 洗牌
        this.shuffleDeck(this.playerDeck);
        this.shuffleDeck(this.computerDeck);

        console.log(`牌组初始化完成 - 玩家: ${this.playerDeck.length}张, 电脑: ${this.computerDeck.length}张`);
    }

    /**
     * 根据monster配置构建牌组
     * @returns {Array} 电脑牌组
     */
    buildMonsterDeck() {
        if (!this.monsterConfig) {
            return [];
        }

        const computerCards = [];
        const preferredCards = MonsterConfigManager.getPreferredCards(this.monsterConfig);
        const avoidCards = MonsterConfigManager.getAvoidCards(this.monsterConfig);
        const monsterClass = this.monsterConfig.class;

        // 优先添加monster偏好的卡牌
        for (const cardName of preferredCards) {
            const cardConfig = CardConfigManager.getCardConfigByName(cardName);
            if (cardConfig) {
                const card = CardConfigManager.createCard(cardConfig);
                computerCards.push(card);
                console.log(`添加monster偏好卡牌: ${cardName}`);
            }
        }

        // 添加同职业的其他卡牌（排除避免的卡牌）
        const classCards = CardConfigManager.getCardConfigsByClass(monsterClass);
        for (const cardConfig of classCards) {
            if (!avoidCards.includes(cardConfig.name) && !preferredCards.includes(cardConfig.name)) {
                const card = CardConfigManager.createCard(cardConfig);
                computerCards.push(card);
                console.log(`添加同职业卡牌: ${cardConfig.name}`);
            }
        }

        // 如果卡牌数量不足，添加其他职业的卡牌
        if (computerCards.length < 12) {
            const allClasses = ['战士', '法师', '盗贼', '牧师'];
            for (const cardClass of allClasses) {
                if (cardClass === monsterClass) continue;
                
                const classCards = CardConfigManager.getCardConfigsByClass(cardClass);
                for (const cardConfig of classCards) {
                    if (!avoidCards.includes(cardConfig.name) && computerCards.length < 12) {
                        const card = CardConfigManager.createCard(cardConfig);
                        computerCards.push(card);
                        console.log(`添加其他职业卡牌: ${cardConfig.name}`);
                    }
                }
            }
        }

        console.log(`Monster牌组构建完成: ${computerCards.length}张卡牌`);
        return computerCards;
    }

    /**
     * 初始化默认牌组
     */
    initializeDefaultDeck() {
        // 尝试从配置加载卡牌
        this.loadCardsFromConfig();
        
        // 如果配置为空，使用ConfigManager中的默认卡牌
        if (this.playerDeck.length === 0) {
            console.warn('没有可用的卡牌配置，使用默认卡牌');
            const defaultConfigs = ConfigManager.getDefaultCardConfigs();
            const basicCards = [];
            
            for (const config of defaultConfigs) {
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
                basicCards.push(card);
            }
            
            this.playerDeck = [...basicCards];
            this.computerDeck = [...basicCards];
        }
        
        this.shuffleDeck(this.playerDeck);
        this.shuffleDeck(this.computerDeck);
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

        // 发初始手牌
        const initialHandSize = ConfigManager.getGameConfig('InitialHandSize', 5);
        for (let i = 0; i < initialHandSize; i++) {
            if (this.playerDeck.length > 0) {
                this.playerHand.push(this.playerDeck.pop());
            }
            if (this.computerDeck.length > 0) {
                this.computerHand.push(this.computerDeck.pop());
            }
        }
    }

    // startNewTurn方法已删除，游戏现在使用基于时间的抽牌系统
    
    /**
     * 更新游戏状态（每帧调用）
     */
    update() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
        this.lastUpdateTime = currentTime;
        
        // 更新游戏时间
        this.gameTime = (currentTime - this.gameStartTime) / 1000;
        
        // 每10秒输出一次调试信息
        if (Math.floor(this.gameTime) % 10 === 0 && this.gameTime > 0) {
            console.log(`游戏时间更新: ${this.gameTime.toFixed(1)}s`);
        }
        
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
        
        // 更新英雄技能系统
        this.heroSkillManager.update(deltaTime);
        
        // 更新潜行系统
        this.playerCharacter.stealthSystem.updateStealth(deltaTime);
        this.computerCharacter.stealthSystem.updateStealth(deltaTime);
        
        // 基于时间的抽牌系统
        this.updateTimeBasedDrawing(currentTime);
        
        // 检查游戏结束
        const gameEndResult = this.checkGameEnd();
        if (gameEndResult.isOver && this.gameUI) {
            this.gameUI.showGameOverModal(gameEndResult.message);
        }
    }
    
    /**
     * 基于时间的抽牌系统
     * @param {number} currentTime - 当前时间戳
     */
    updateTimeBasedDrawing(currentTime) {
        // 使用已经更新的gameTime，而不是重新计算
        const gameTime = this.gameTime;
        
        // 玩家抽牌检查（考虑敏捷属性）
        const playerDrawInterval = this.calculatePlayerDrawInterval();
        if (gameTime - this.lastPlayerDrawTime >= playerDrawInterval) {
            this.drawCards(this.playerDeck, this.playerHand, 1, true);
            this.lastPlayerDrawTime = gameTime;
        }
        
        // 电脑抽牌检查（考虑敏捷属性）
        const computerDrawInterval = this.computerCharacter.calculateDrawInterval(this.baseDrawInterval);
        const timeSinceLastComputerDraw = gameTime - this.lastComputerDrawTime;
        
        // 只在需要时输出调试信息，避免刷屏
        if (timeSinceLastComputerDraw >= computerDrawInterval * 0.8) {
            console.log(`电脑抽牌检查 - 游戏时间: ${gameTime.toFixed(1)}s, 上次抽牌: ${this.lastComputerDrawTime.toFixed(1)}s, 间隔: ${computerDrawInterval.toFixed(1)}s, 经过时间: ${timeSinceLastComputerDraw.toFixed(1)}s`);
        }
        
        if (timeSinceLastComputerDraw >= computerDrawInterval) {
            console.log('电脑开始抽牌...');
            this.drawCards(this.computerDeck, this.computerHand, 1, false);
            this.lastComputerDrawTime = gameTime;
            
            console.log(`电脑抽牌完成，游戏时间: ${this.gameTime.toFixed(1)}s, 手牌数量: ${this.computerHand.length}`);
            
            // 电脑AI决策（在抽牌后）
            setTimeout(() => {
                if (!this.gameOver) {
                    console.log('开始电脑AI决策...');
                    const aiResult = this.computerTurn();
                    
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
        const character = isPlayer ? this.playerCharacter : this.computerCharacter;
        
        for (let i = 0; i < count; i++) {
            if (deck.length === 0) {
                // 如果牌组为空，将弃牌堆洗入牌组
                this.shuffleDiscardPileIntoDeck(deck, hand, isPlayer);
            }
            
            if (deck.length > 0) {
                hand.push(deck.pop());
            }
            
            // 检查额外抽卡概率
            if (character.extraDrawChance > 0 && Math.random() < character.extraDrawChance / 100) {
                if (deck.length === 0) {
                    this.shuffleDiscardPileIntoDeck(deck, hand, isPlayer);
                }
                
                if (deck.length > 0) {
                    hand.push(deck.pop());
                    console.log(`${character.name} 触发额外抽卡概率！`);
                }
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
        console.log(`=== 使用卡牌开始 ===`);
        console.log(`卡牌: ${card.name}, 使用者: ${isPlayer ? '玩家' : '电脑'}, 能量消耗: ${card.energyCost}`);
        
        const character = isPlayer ? this.playerCharacter : this.computerCharacter;
        const castingSystem = isPlayer ? this.playerCastingSystem : this.computerCastingSystem;
        const hand = isPlayer ? this.playerHand : this.computerHand;
        const discardPile = isPlayer ? this.playerDiscardPile : this.computerDiscardPile;

        console.log(`当前能量: ${character.currentEnergy}, 最大能量: ${character.maxEnergy}`);

        // 检查能量是否足够
        if (!character.consumeEnergy(card.energyCost)) {
            console.log(`能量不足，无法使用卡牌: ${card.name}`);
            return { success: false, message: "能量不足" };
        }
        
        console.log(`能量消耗成功，剩余能量: ${character.currentEnergy}`);
        
        // 检查生命消耗（如果有）
        if (card.healthCost > 0) {
            if (character.currentHealth <= card.healthCost) {
                return { success: false, message: "生命值不足" };
            }
            character.takeDamage(card.healthCost);
            
            // 同步生命值状态
            if (isPlayer) {
                this.playerHealth = character.currentHealth;
            } else {
                this.computerHealth = character.currentHealth;
            }
        }

        // 同步能量状态
        if (isPlayer) {
            this.playerEnergy = character.currentEnergy;
        } else {
            this.computerEnergy = character.currentEnergy;
        }

        // 锁定目标（对于攻击卡牌）
        if (this.isAttackCard(card)) {
            const target = isPlayer ? this.computerCharacter : this.playerCharacter;
            card.lockTarget(target);
        }

        // 从手牌移除卡牌（使用索引确保移除正确的卡牌）
        console.log(`准备从手牌移除卡牌: ${card.name}, 手牌数量: ${hand.length}`);
        if (card.handIndex !== undefined && card.handIndex >= 0 && card.handIndex < hand.length) {
            console.log(`使用handIndex移除卡牌: ${card.handIndex}`);
            hand.splice(card.handIndex, 1);
        } else {
            // 后备方案：查找并移除第一张匹配的卡牌
            const cardIndex = hand.findIndex(c => c.name === card.name);
            console.log(`使用findIndex查找卡牌: ${cardIndex}`);
            if (cardIndex !== -1) {
                hand.splice(cardIndex, 1);
                console.log(`成功移除卡牌，剩余手牌数量: ${hand.length}`);
            } else {
                console.log(`警告：未找到要移除的卡牌: ${card.name}`);
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
            
            // 如果是攻击卡牌，潜行状态下会脱离潜行
            if (this.isAttackCard(card) && character.stealthSystem.isCurrentlyStealthed()) {
                character.stealthSystem.exitStealth();
            }
            
            // 消耗型卡牌进入消耗堆，否则进弃牌堆
            if (card.isExhaust) {
                (isPlayer ? this.playerExhaustPile : this.computerExhaustPile).push(card);
            } else {
                discardPile.push(card);
            }

            // 检查游戏是否结束
            const gameEndResult = this.checkGameEnd();
            if (gameEndResult.isOver) {
                return {
                    success: true,
                    message: `${character.name} 使用了 ${card.name}`,
                    effectResult: effectResult,
                    gameOver: true,
                    winner: gameEndResult.winner,
                    gameOverMessage: gameEndResult.message
                };
            }

            return {
                success: true,
                message: `${character.name} 使用了 ${card.name}`,
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
            this.botPlayer = new BotPlayer(this, this.monsterConfig);
        }
        
        // 添加调试信息
        console.log(`电脑AI决策开始 - 手牌数量: ${this.computerHand.length}, 能量: ${this.computerEnergy}`);
        if (this.computerHand.length > 0) {
            console.log('电脑手牌:', this.computerHand.map(card => `${card.name}(消耗${card.energyCost})`));
        }
        
        const result = this.botPlayer.executeTurn();
        console.log(`电脑AI决策结果: ${result}`);
        
        return result;
    }

    /**
     * 检查游戏是否结束
     * @returns {object} 游戏结束状态
     */
    checkGameEnd() {
        // 检查玩家生命值
        if (this.playerHealth <= 0 || this.playerCharacter.currentHealth <= 0) {
            this.gameOver = true;
            this.winner = "电脑";
            return { isOver: true, winner: "电脑", message: "电脑获胜！" };
        }
        
        // 检查电脑生命值
        if (this.computerHealth <= 0 || this.computerCharacter.currentHealth <= 0) {
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
        this.playerExhaustPile = [];

        // 重置电脑状态
        this.computerHealth = this.computerCharacter.currentHealth;
        this.computerEnergy = this.computerCharacter.currentEnergy;
        this.computerArmor = 0;
        this.computerDeck = [];
        this.computerHand = [];
        this.computerDiscardPile = [];
        this.computerExhaustPile = [];

        // 重置游戏状态
        this.gameOver = false;
        this.winner = null;
        this.gameTime = 0; // 重置游戏时间
        
        // 重置时间系统
        this.lastUpdateTime = Date.now();
        this.gameStartTime = Date.now();
        this.lastPlayerDrawTime = 0;
        this.lastComputerDrawTime = 0;

        // 重置BotPlayer
        if (this.botPlayer) {
            this.botPlayer.reset();
        } else {
            this.botPlayer = new BotPlayer(this, this.monsterConfig);
        }

        this.initializeDeck();
        this.dealInitialCards();
    }

    /**
     * 获取游戏状态信息
     * @returns {object} 游戏状态信息
     */
    getGameInfo() {
        // 使用已经更新的gameTime，保持一致性
        const gameTime = this.gameTime;
        
        // 计算倒计时
        const drawCountdown = this.calculateDrawCountdown(gameTime);
        const energyCountdown = this.calculateEnergyCountdown();
        
        return {
            playerHealth: this.playerHealth,
            playerEnergy: this.playerEnergy,
            playerArmor: this.playerArmor,
            playerDeckCount: this.playerDeck.length,
            playerHandCount: this.playerHand.length,
            playerDiscardCount: this.playerDiscardPile.length,
            playerExhaustCount: this.playerExhaustPile.length,
            playerHealthPercent: Math.round(this.playerCharacter.getHealthPercentage()),
            playerEnergyPercent: Math.round(this.playerCharacter.getEnergyPercentage()),
            
            computerHealth: this.computerHealth,
            computerEnergy: this.computerEnergy,
            computerArmor: this.computerArmor,
            computerDeckCount: this.computerDeck.length,
            computerHandCount: this.computerHand.length,
            computerDiscardCount: this.computerDiscardPile.length,
            computerExhaustCount: this.computerExhaustPile.length,
            computerHealthPercent: Math.round(this.computerCharacter.getHealthPercentage()),
            computerEnergyPercent: Math.round(this.computerCharacter.getEnergyPercentage()),
            
            gameTime: gameTime,
            drawInterval: this.drawInterval,
            gameOver: this.gameOver,
            winner: this.winner,
            
            // 倒计时信息
            drawCountdown: drawCountdown,
            energyCountdown: energyCountdown,
            
            // 英雄技能信息
            playerHeroSkill: this.heroSkillManager.getSkill(this.playerCharacter.characterClass),
            computerHeroSkill: this.heroSkillManager.getSkill(this.computerCharacter.characterClass)
        };
    }
    
    /**
     * 计算抽卡倒计时
     * @param {number} gameTime - 游戏时间
     * @returns {number} 倒计时秒数
     */
    calculateDrawCountdown(gameTime) {
        // 计算玩家实际抽卡间隔（考虑敏捷属性）
        const playerDrawInterval = this.calculatePlayerDrawInterval();
        const timeSinceLastDraw = gameTime - this.lastPlayerDrawTime;
        const countdown = playerDrawInterval - timeSinceLastDraw;
        return Math.max(0, countdown);
    }
    
    /**
     * 计算玩家实际抽卡间隔（考虑敏捷属性）
     * @returns {number} 实际抽卡间隔
     */
    calculatePlayerDrawInterval() {
        return this.playerCharacter.calculateDrawInterval(this.baseDrawInterval);
    }
    
    /**
     * 计算能量恢复倒计时
     * @returns {number} 倒计时秒数
     */
    calculateEnergyCountdown() {
        if (this.playerCharacter.currentEnergy >= this.playerCharacter.maxEnergy) {
            return 0; // 能量已满
        }
        
        const timeSinceLastRegen = this.playerCharacter.lastEnergyRegen;
        const regenInterval = 1.0 / this.playerCharacter.energyRegenRate; // 每恢复1点能量需要的时间
        const countdown = regenInterval - timeSinceLastRegen;
        return Math.max(0, countdown);
    }
    
    /**
     * 判断是否为攻击卡牌
     * @param {Card} card - 卡牌
     * @returns {boolean} 是否为攻击卡牌
     */
    isAttackCard(card) {
        const attackEffects = [
            "DAMAGE_6", "DAMAGE_9", "DAMAGE_6_POISON", "DAMAGE_3_SLOW", 
            "DAMAGE_4_ARMOR", "DAMAGE_4_ALL_SLOW", "CONSUME_ALL_ENERGY", "DAMAGE_15"
        ];
        return attackEffects.includes(card.effectCode);
    }
    
    /**
     * 使用英雄技能
     * @param {boolean} isPlayer - 是否为玩家使用
     * @returns {object} 使用结果
     */
    useHeroSkill(isPlayer) {
        const character = isPlayer ? this.playerCharacter : this.computerCharacter;
        const skill = this.heroSkillManager.getSkill(character.characterClass);
        
        if (!skill) {
            return {
                success: false,
                message: "没有可用的英雄技能"
            };
        }
        
        const result = skill.use(character, this);
        
        // 同步状态
        if (isPlayer) {
            this.playerEnergy = character.currentEnergy;
        } else {
            this.computerEnergy = character.currentEnergy;
        }
        
        return result;
    }

    /**
     * 获取可用的卡牌
     * @param {boolean} isPlayer - 是否为玩家
     * @returns {Array} 可用的卡牌数组
     */
    getPlayableCards(isPlayer) {
        const hand = isPlayer ? this.playerHand : this.computerHand;
        const energy = isPlayer ? this.playerEnergy : this.computerEnergy;
        
        return hand.filter(card => card.energyCost <= energy);
    }

    /**
     * 应用monster属性配置
     */
    applyMonsterAttributes() {
        if (!this.monsterConfig) return;
        
        const characterConfig = MonsterConfigManager.createCharacterFromMonster(this.monsterConfig);
        
        // 更新电脑角色的属性
        this.computerCharacter.maxHealth = characterConfig.maxHealth;
        this.computerCharacter.currentHealth = characterConfig.maxHealth;
        this.computerCharacter.maxEnergy = characterConfig.maxEnergy;
        this.computerCharacter.currentEnergy = characterConfig.initialEnergy;
        this.computerCharacter.strength = characterConfig.strength;
        this.computerCharacter.agility = characterConfig.agility;
        this.computerCharacter.spirit = characterConfig.spirit;
        this.computerCharacter.healthRegenRate = characterConfig.healthRegenRate;
        this.computerCharacter.energyRegenRate = characterConfig.energyRegenRate;
        
        // 更新兼容状态
        this.computerHealth = this.computerCharacter.currentHealth;
        this.computerEnergy = this.computerCharacter.currentEnergy;
        
        console.log(`应用monster属性: ${this.monsterConfig.name}`);
        console.log(`生命值: ${this.computerCharacter.currentHealth}/${this.computerCharacter.maxHealth}`);
        console.log(`能量: ${this.computerCharacter.currentEnergy}/${this.computerCharacter.maxEnergy}`);
    }
} 