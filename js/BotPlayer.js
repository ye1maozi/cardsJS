/**
 * 电脑AI玩家类 - 负责电脑玩家的智能决策
 */
class BotPlayer {
    constructor(gameState, monsterConfig = null) {
        this.gameState = gameState;
        this.monsterConfig = monsterConfig;
        this.personality = this.generatePersonality();
        this.memory = {
            lastPlayedCards: [],
            playerPatterns: [],
            healthHistory: [],
            energyHistory: [],
            threatHistory: [],
            comboHistory: [],
            castingHistory: []
        };
        this.difficulty = 'normal'; // easy, normal, hard
        this.comboCounter = 0; // 连击计数器
        this.lastComboTime = 0; // 上次连击时间
        this.threatLevel = 0; // 威胁等级
        this.strategy = 'balanced'; // balanced, aggressive, defensive, combo
        
        // 如果提供了monster配置，应用monster的个性特征
        if (this.monsterConfig) {
            this.applyMonsterConfig();
        }
    }

    /**
     * 生成AI个性特征
     */
    generatePersonality() {
        return {
            aggressiveness: Math.random() * 0.8 + 0.2, // 0.2-1.0 攻击性
            defensiveness: Math.random() * 0.8 + 0.2,  // 0.2-1.0 防御性
            efficiency: Math.random() * 0.8 + 0.2,     // 0.2-1.0 效率性
            riskTolerance: Math.random() * 0.8 + 0.2,  // 0.2-1.0 风险承受度
            adaptability: Math.random() * 0.8 + 0.2,   // 0.2-1.0 适应性
            comboPreference: Math.random() * 0.8 + 0.2, // 0.2-1.0 连击偏好
            castingPatience: Math.random() * 0.8 + 0.2  // 0.2-1.0 吟唱耐心
        };
    }

    /**
     * 应用monster配置
     */
    applyMonsterConfig() {
        if (!this.monsterConfig) return;
        
        // 设置难度
        this.difficulty = this.getDifficultyFromMonster();
        
        // 应用monster的个性特征
        this.personality = this.generatePersonalityFromMonster();
        
        // 设置策略
        this.strategy = MonsterConfigManager.getAIStrategy(this.monsterConfig);
        
        console.log(`应用monster配置: ${this.monsterConfig.name}, 策略: ${this.strategy}`);
    }

    /**
     * 根据monster配置生成个性特征
     */
    generatePersonalityFromMonster() {
        if (!this.monsterConfig) {
            return this.generatePersonality();
        }
        
        const personality = MonsterConfigManager.getPersonality(this.monsterConfig);
        const basePersonality = this.generatePersonality();
        
        // 根据monster的个性类型调整特征
        switch (personality) {
            case 'reckless':
                basePersonality.aggressiveness *= 1.5;
                basePersonality.riskTolerance *= 1.8;
                basePersonality.defensiveness *= 0.6;
                break;
            case 'calculating':
                basePersonality.efficiency *= 1.4;
                basePersonality.adaptability *= 1.3;
                basePersonality.castingPatience *= 1.5;
                break;
            case 'cautious':
                basePersonality.defensiveness *= 1.4;
                basePersonality.riskTolerance *= 0.7;
                basePersonality.aggressiveness *= 0.8;
                break;
            case 'protective':
                basePersonality.defensiveness *= 1.6;
                basePersonality.efficiency *= 1.2;
                basePersonality.aggressiveness *= 0.6;
                break;
            case 'patient':
                basePersonality.castingPatience *= 1.6;
                basePersonality.adaptability *= 1.3;
                basePersonality.aggressiveness *= 0.7;
                break;
            case 'disciplined':
                basePersonality.efficiency *= 1.3;
                basePersonality.adaptability *= 1.2;
                basePersonality.comboPreference *= 1.1;
                break;
            case 'aggressive':
                basePersonality.aggressiveness *= 1.4;
                basePersonality.comboPreference *= 1.3;
                basePersonality.defensiveness *= 0.7;
                break;
            default:
                // 使用基础个性
                break;
        }
        
        return basePersonality;
    }

    /**
     * 根据monster配置获取难度
     */
    getDifficultyFromMonster() {
        if (!this.monsterConfig) return 'normal';
        
        const difficulty = this.monsterConfig.difficulty;
        if (difficulty <= 1) return 'easy';
        if (difficulty >= 3) return 'hard';
        return 'normal';
    }

    /**
     * 设置AI难度
     * @param {string} difficulty - 难度级别
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.adjustPersonalityByDifficulty();
    }

    /**
     * 根据难度调整个性
     */
    adjustPersonalityByDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                this.personality.aggressiveness *= 0.7;
                this.personality.efficiency *= 0.6;
                this.personality.adaptability *= 0.5;
                this.personality.comboPreference *= 0.4;
                this.personality.castingPatience *= 0.6;
                break;
            case 'hard':
                this.personality.aggressiveness *= 1.3;
                this.personality.efficiency *= 1.4;
                this.personality.adaptability *= 1.5;
                this.personality.comboPreference *= 1.3;
                this.personality.castingPatience *= 1.4;
                break;
        }
    }

    /**
     * 执行电脑AI决策
     * @returns {string} AI决策结果描述
     */
    executeTurn() {
        console.log('=== 电脑AI决策开始 ===');
        
        this.updateMemory();
        this.updateThreatLevel();
        this.updateStrategy();
        
        // 检查是否正在吟唱
        if (this.gameState.computerCastingSystem.isCurrentlyCasting()) {
            console.log('电脑正在吟唱中...');
            return this.handleCastingTurn();
        }
        
        const strategy = this.analyzeSituation();
        console.log(`电脑策略分析: ${strategy.strategy}`);
        
        const selectedCard = this.selectCard(strategy);
        
        if (selectedCard) {
            console.log(`电脑尝试使用卡牌: ${selectedCard.name}`);
            const useResult = this.gameState.useCard(selectedCard, false);
            if (useResult.success) {
                this.recordPlayedCard(selectedCard);
                this.updateComboCounter(selectedCard);
                console.log(`电脑成功使用卡牌: ${useResult.message}`);
                return `${useResult.message} → ${useResult.effectResult}`;
            } else {
                console.log(`电脑使用卡牌失败: ${useResult.message}`);
            }
        } else {
            console.log('电脑没有选择任何卡牌');
        }
        
        // 如果没有合适的卡牌，考虑使用英雄技能
        console.log('检查是否应该使用英雄技能...');
        if (this.shouldUseHeroSkill()) {
            console.log('电脑决定使用英雄技能');
            const heroSkillResult = this.gameState.useHeroSkill(false);
            if (heroSkillResult.success) {
                console.log(`电脑成功使用英雄技能: ${heroSkillResult.message}`);
                return `电脑使用了英雄技能: ${heroSkillResult.message}`;
            } else {
                console.log(`电脑使用英雄技能失败: ${heroSkillResult.message}`);
            }
        } else {
            console.log('电脑不应该使用英雄技能');
        }
        
        console.log('=== 电脑AI决策结束 ===');
        return "电脑没有足够的能量使用卡牌";
    }

    /**
     * 处理吟唱状态
     * @returns {string} 吟唱状态描述
     */
    handleCastingTurn() {
        const castingInfo = this.gameState.computerCastingSystem.getCastingInfo();
        if (castingInfo && castingInfo.isCasting) {
            const remainingTime = castingInfo.remainingTime.toFixed(1);
            return `电脑正在吟唱 ${castingInfo.cardName} (剩余 ${remainingTime}秒)`;
        }
        return "电脑正在吟唱中...";
    }

    /**
     * 更新威胁等级
     */
    updateThreatLevel() {
        const playerDamage = this.calculatePlayerDamagePotential();
        const playerHealth = this.gameState.playerHealth;
        const computerHealth = this.gameState.computerHealth;
        
        // 计算威胁等级 (0-10)
        let threat = 0;
        
        // 玩家血量低时威胁降低
        if (playerHealth <= 5) threat -= 3;
        else if (playerHealth <= 10) threat -= 1;
        
        // 电脑血量低时威胁增加
        if (computerHealth <= 5) threat += 4;
        else if (computerHealth <= 10) threat += 2;
        
        // 玩家伤害潜力高时威胁增加
        if (playerDamage >= 15) threat += 3;
        else if (playerDamage >= 10) threat += 2;
        else if (playerDamage >= 5) threat += 1;
        
        // 玩家手牌多时威胁增加
        if (this.gameState.playerHand.length >= 5) threat += 2;
        else if (this.gameState.playerHand.length >= 3) threat += 1;
        
        this.threatLevel = Math.max(0, Math.min(10, threat));
        
        // 记录威胁历史
        this.memory.threatHistory.push({
            gameTime: this.gameState.gameTime || 0,
            threatLevel: this.threatLevel,
            playerHealth: playerHealth,
            computerHealth: computerHealth,
            playerDamage: playerDamage
        });
        
        if (this.memory.threatHistory.length > 10) {
            this.memory.threatHistory.shift();
        }
    }

    /**
     * 计算玩家伤害潜力
     * @returns {number} 预估伤害
     */
    calculatePlayerDamagePotential() {
        return this.gameState.playerHand.reduce((total, card) => {
            if (card.effectCode.includes('DAMAGE') && card.energyCost <= this.gameState.playerEnergy) {
                return total + (card.value1 || 0);
            }
            return total;
        }, 0);
    }

    /**
     * 更新策略
     */
    updateStrategy() {
        const healthRatio = this.gameState.computerHealth / this.gameState.computerCharacter.maxHealth;
        const playerHealthRatio = this.gameState.playerHealth / this.gameState.playerCharacter.maxHealth;
        
        if (this.threatLevel >= 7 || healthRatio < 0.3) {
            this.strategy = 'defensive';
        } else if (playerHealthRatio < 0.4 || this.canFinishPlayer()) {
            this.strategy = 'aggressive';
        } else if (this.comboCounter > 0 && this.hasComboCards()) {
            this.strategy = 'combo';
        } else {
            this.strategy = 'balanced';
        }
    }

    /**
     * 分析当前局势
     * @returns {object} 策略分析结果
     */
    analyzeSituation() {
        const analysis = {
            playerHealthRatio: this.gameState.playerHealth / this.gameState.playerCharacter.maxHealth,
            computerHealthRatio: this.gameState.computerHealth / this.gameState.computerCharacter.maxHealth,
            playerArmorRatio: this.gameState.playerArmor / 10,
            computerArmorRatio: this.gameState.computerArmor / 10,
            energyEfficiency: this.gameState.computerEnergy / this.gameState.computerCharacter.maxEnergy,
            cardAdvantage: this.gameState.computerHand.length - this.gameState.playerHand.length,
            isInDanger: this.gameState.computerHealth <= 10,
            isPlayerInDanger: this.gameState.playerHealth <= 10,
            canFinishPlayer: this.canFinishPlayer(),
            shouldDefend: this.shouldDefend(),
            shouldAggress: this.shouldAggress(),
            threatLevel: this.threatLevel,
            strategy: this.strategy,
            comboOpportunity: this.hasComboOpportunity(),
            castingOpportunity: this.hasCastingOpportunity(),
            stealthConsideration: this.shouldConsiderStealth(),
            statusEffectConsideration: this.shouldConsiderStatusEffects()
        };

        return analysis;
    }

    /**
     * 检查是否有连击机会
     * @returns {boolean} 是否有连击机会
     */
    hasComboOpportunity() {
        const lowCostCards = this.gameState.computerHand.filter(card => 
            card.energyCost <= 2 && card.energyCost <= this.gameState.computerEnergy
        );
        return lowCostCards.length >= 2 && this.gameState.computerEnergy >= 4;
    }

    /**
     * 检查是否有吟唱机会
     * @returns {boolean} 是否有吟唱机会
     */
    hasCastingOpportunity() {
        const castingCards = this.gameState.computerHand.filter(card => 
            card.castTime > 0 && card.energyCost <= this.gameState.computerEnergy
        );
        return castingCards.length > 0 && !this.gameState.computerCastingSystem.isCurrentlyCasting();
    }

    /**
     * 检查是否应该考虑潜行
     * @returns {boolean} 是否应该考虑潜行
     */
    shouldConsiderStealth() {
        const stealthCards = this.gameState.computerHand.filter(card => 
            card.effectCode.includes('STEALTH') && card.energyCost <= this.gameState.computerEnergy
        );
        return stealthCards.length > 0 && this.gameState.computerHealth <= 15;
    }

    /**
     * 检查是否应该考虑状态效果
     * @returns {boolean} 是否应该考虑状态效果
     */
    shouldConsiderStatusEffects() {
        const statusCards = this.gameState.computerHand.filter(card => 
            (card.effectCode.includes('POISON') || card.effectCode.includes('SLOW')) && 
            card.energyCost <= this.gameState.computerEnergy
        );
        return statusCards.length > 0;
    }

    /**
     * 检查是否可以终结玩家
     * @returns {boolean} 是否可以终结
     */
    canFinishPlayer() {
        const totalDamage = this.gameState.computerHand
            .filter(card => card.energyCost <= this.gameState.computerEnergy)
            .reduce((total, card) => {
                if (card.effectCode.includes('DAMAGE')) {
                    return total + (card.value1 || 0);
                }
                return total;
            }, 0);
        
        return totalDamage >= this.gameState.playerHealth;
    }

    /**
     * 判断是否应该防御
     * @returns {boolean} 是否应该防御
     */
    shouldDefend() {
        const healthRatio = this.gameState.computerHealth / this.gameState.computerCharacter.maxHealth;
        const hasHealingCards = this.gameState.computerHand.some(card => 
            card.effectCode.includes('HEAL') && card.energyCost <= this.gameState.computerEnergy
        );
        const hasArmorCards = this.gameState.computerHand.some(card => 
            card.effectCode.includes('ARMOR') && card.energyCost <= this.gameState.computerEnergy
        );

        return (healthRatio < 0.4 && (hasHealingCards || hasArmorCards)) || 
               (this.gameState.computerHealth <= 5) ||
               (this.threatLevel >= 7);
    }

    /**
     * 判断是否应该攻击
     * @returns {boolean} 是否应该攻击
     */
    shouldAggress() {
        const playerHealthRatio = this.gameState.playerHealth / this.gameState.playerCharacter.maxHealth;
        const hasDamageCards = this.gameState.computerHand.some(card => 
            card.effectCode.includes('DAMAGE') && card.energyCost <= this.gameState.computerEnergy
        );

        return (playerHealthRatio < 0.5 && hasDamageCards) || 
               this.canFinishPlayer() ||
               (this.threatLevel <= 3 && hasDamageCards);
    }

    /**
     * 选择卡牌
     * @param {Object} strategy - 策略对象
     * @returns {Card|null} 选择的卡牌
     */
    selectCard(strategy) {
        const playableCards = this.gameState.getPlayableCards(false);
        
        if (playableCards.length === 0) {
            console.log('电脑没有可用的卡牌');
            return null;
        }
        
        // 根据monster配置过滤卡牌
        const filteredCards = this.filterCardsByMonsterPreference(playableCards);
        
        if (filteredCards.length === 0) {
            console.log('根据monster偏好过滤后没有可用卡牌，使用原始卡牌');
            return this.selectCardByStrategy(playableCards, strategy);
        }
        
        return this.selectCardByStrategy(filteredCards, strategy);
    }

    /**
     * 根据monster偏好过滤卡牌
     * @param {Array} cards - 可用卡牌数组
     * @returns {Array} 过滤后的卡牌数组
     */
    filterCardsByMonsterPreference(cards) {
        if (!this.monsterConfig) {
            return cards;
        }
        
        const preferredCards = MonsterConfigManager.getPreferredCards(this.monsterConfig);
        const avoidCards = MonsterConfigManager.getAvoidCards(this.monsterConfig);
        
        // 优先选择偏好的卡牌
        const preferredMatches = cards.filter(card => 
            preferredCards.includes(card.name)
        );
        
        if (preferredMatches.length > 0) {
            console.log(`根据monster偏好选择卡牌: ${preferredMatches.map(c => c.name).join(', ')}`);
            return preferredMatches;
        }
        
        // 如果没有偏好卡牌，排除避免的卡牌
        const filteredCards = cards.filter(card => 
            !avoidCards.includes(card.name)
        );
        
        if (filteredCards.length > 0) {
            console.log(`排除monster避免的卡牌: ${avoidCards.join(', ')}`);
            return filteredCards;
        }
        
        // 如果过滤后没有卡牌，返回原始卡牌
        console.log('过滤后没有可用卡牌，使用原始卡牌');
        return cards;
    }

    /**
     * 根据策略选择卡牌
     * @param {Array} playableCards - 可用卡牌数组
     * @param {Object} strategy - 策略对象
     * @returns {Card|null} 选择的卡牌
     */
    selectCardByStrategy(playableCards, strategy) {
        switch (strategy.strategy) {
            case 'aggressive':
                return this.selectAggressiveCard(playableCards, strategy);
            case 'defensive':
                return this.selectDefensiveCard(playableCards, strategy);
            case 'combo':
                return this.selectComboCard(playableCards, strategy);
            case 'balanced':
            default:
                return this.selectBalancedCard(playableCards, strategy);
        }
    }

    /**
     * 选择攻击卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {Card} 选择的卡牌
     */
    selectAggressiveCard(playableCards, strategy) {
        // 优先选择高伤害卡牌
        const damageCards = playableCards.filter(card => 
            card.effectCode.includes('DAMAGE')
        );

        if (damageCards.length > 0) {
            // 根据效率选择最佳伤害卡牌
            return this.selectBestDamageCard(damageCards);
        }

        // 其次选择状态效果卡牌
        const statusCards = playableCards.filter(card => 
            card.effectCode.includes('POISON') || card.effectCode.includes('SLOW')
        );

        if (statusCards.length > 0) {
            return this.selectBestStatusCard(statusCards);
        }

        return this.selectRandomCard(playableCards);
    }

    /**
     * 选择防御卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {Card} 选择的卡牌
     */
    selectDefensiveCard(playableCards, strategy) {
        const healingCards = playableCards.filter(card => 
            card.effectCode.includes('HEAL')
        );
        const armorCards = playableCards.filter(card => 
            card.effectCode.includes('ARMOR')
        );
        const stealthCards = playableCards.filter(card => 
            card.effectCode.includes('STEALTH')
        );

        // 优先选择治疗卡牌
        if (healingCards.length > 0) {
            return this.selectBestHealingCard(healingCards);
        }

        // 其次选择护甲卡牌
        if (armorCards.length > 0) {
            return this.selectBestArmorCard(armorCards);
        }

        // 再次选择潜行卡牌
        if (stealthCards.length > 0 && strategy.stealthConsideration) {
            return this.selectBestStealthCard(stealthCards);
        }

        // 最后随机选择
        return this.selectRandomCard(playableCards);
    }

    /**
     * 选择连击卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {Card} 选择的卡牌
     */
    selectComboCard(playableCards, strategy) {
        // 优先选择低消耗的连击卡牌
        const lowCostCards = playableCards.filter(card => 
            card.energyCost <= 2
        );

        if (lowCostCards.length > 0) {
            // 按能量效率排序
            lowCostCards.sort((a, b) => {
                const aEfficiency = (a.value1 || 0) / a.energyCost;
                const bEfficiency = (b.value1 || 0) / b.energyCost;
                return bEfficiency - aEfficiency;
            });
            return lowCostCards[0];
        }

        return this.selectRandomCard(playableCards);
    }

    /**
     * 选择平衡卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {Card} 选择的卡牌
     */
    selectBalancedCard(playableCards, strategy) {
        // 计算每张卡牌的评分
        const cardScores = playableCards.map(card => ({
            card: card,
            score: this.calculateCardScore(card, strategy)
        }));

        // 按评分排序
        cardScores.sort((a, b) => b.score - a.score);

        // 根据难度和个性添加随机性
        const randomFactor = this.getRandomFactor();
        const selectedIndex = Math.floor(Math.random() * Math.ceil(cardScores.length * randomFactor));
        
        return cardScores[selectedIndex]?.card || this.selectRandomCard(playableCards);
    }

    /**
     * 计算卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    calculateCardScore(card, strategy) {
        let score = 0;

        // 基础评分
        score += this.getBaseCardScore(card);

        // 根据局势调整评分
        if (card.effectCode.includes('DAMAGE')) {
            score += this.getDamageCardScore(card, strategy);
        } else if (card.effectCode.includes('HEAL')) {
            score += this.getHealingCardScore(card, strategy);
        } else if (card.effectCode.includes('ARMOR')) {
            score += this.getArmorCardScore(card, strategy);
        } else if (card.effectCode.includes('SLOW')) {
            score += this.getControlCardScore(card, strategy);
        } else if (card.effectCode.includes('POISON')) {
            score += this.getPoisonCardScore(card, strategy);
        } else if (card.effectCode.includes('STEALTH')) {
            score += this.getStealthCardScore(card, strategy);
        }

        // 吟唱卡牌特殊处理
        if (card.castTime > 0) {
            score += this.getCastingCardScore(card, strategy);
        }

        // 根据个性调整评分
        score *= this.getPersonalityMultiplier(card);

        // 连击加成
        if (this.comboCounter > 0) {
            score *= (1 + this.comboCounter * 0.1);
        }

        return score;
    }

    /**
     * 获取基础卡牌评分
     * @param {Card} card - 卡牌
     * @returns {number} 基础评分
     */
    getBaseCardScore(card) {
        // 能量效率评分
        const energyEfficiency = (card.value1 || 0) / card.energyCost;
        
        // 卡牌稀有度评分（根据能量消耗）
        const rarityScore = card.energyCost * 0.5;
        
        return energyEfficiency * 10 + rarityScore;
    }

    /**
     * 获取伤害卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getDamageCardScore(card, strategy) {
        let score = card.value1 || 0;

        // 如果玩家血量低，提高伤害卡牌评分
        if (strategy.isPlayerInDanger) {
            score *= 1.5;
        }

        // 如果电脑血量高，提高伤害卡牌评分
        if (strategy.computerHealthRatio > 0.7) {
            score *= 1.2;
        }

        // 威胁等级低时提高伤害评分
        if (strategy.threatLevel <= 3) {
            score *= 1.3;
        }

        return score;
    }

    /**
     * 获取治疗卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getHealingCardScore(card, strategy) {
        let score = card.value1 || 0;

        // 如果电脑血量低，大幅提高治疗卡牌评分
        if (strategy.isInDanger) {
            score *= 3.0;
        } else if (strategy.computerHealthRatio < 0.5) {
            score *= 2.0;
        }

        // 威胁等级高时提高治疗评分
        if (strategy.threatLevel >= 7) {
            score *= 1.5;
        }

        return score;
    }

    /**
     * 获取护甲卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getArmorCardScore(card, strategy) {
        let score = card.value2 || 0;

        // 如果电脑血量中等，提高护甲卡牌评分
        if (strategy.computerHealthRatio > 0.3 && strategy.computerHealthRatio < 0.7) {
            score *= 1.5;
        }

        // 威胁等级高时提高护甲评分
        if (strategy.threatLevel >= 6) {
            score *= 1.3;
        }

        return score;
    }

    /**
     * 获取控制卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getControlCardScore(card, strategy) {
        let score = 5; // 基础控制评分

        // 如果玩家手牌多，提高控制卡牌评分
        if (strategy.cardAdvantage < 0) {
            score *= 1.3;
        }

        // 如果玩家血量高，提高控制卡牌评分
        if (strategy.playerHealthRatio > 0.7) {
            score *= 1.2;
        }

        return score;
    }

    /**
     * 获取中毒卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getPoisonCardScore(card, strategy) {
        let score = (card.value1 || 0) * 2; // 中毒效果通常更有效

        // 如果玩家血量高，提高中毒评分
        if (strategy.playerHealthRatio > 0.6) {
            score *= 1.4;
        }

        return score;
    }

    /**
     * 获取潜行卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getStealthCardScore(card, strategy) {
        let score = 8; // 基础潜行评分

        // 如果电脑血量低，提高潜行评分
        if (strategy.computerHealthRatio < 0.5) {
            score *= 1.5;
        }

        // 威胁等级高时提高潜行评分
        if (strategy.threatLevel >= 6) {
            score *= 1.3;
        }

        return score;
    }

    /**
     * 获取吟唱卡牌评分
     * @param {Card} card - 卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {number} 评分
     */
    getCastingCardScore(card, strategy) {
        let score = (card.value1 || 0) * 1.5; // 吟唱卡牌通常更强

        // 如果电脑血量高，提高吟唱评分
        if (strategy.computerHealthRatio > 0.6) {
            score *= 1.3;
        }

        // 威胁等级低时提高吟唱评分
        if (strategy.threatLevel <= 4) {
            score *= 1.2;
        }

        return score;
    }

    /**
     * 获取个性调整系数
     * @param {Card} card - 卡牌
     * @returns {number} 调整系数
     */
    getPersonalityMultiplier(card) {
        let multiplier = 1.0;

        if (card.effectCode.includes('DAMAGE')) {
            multiplier *= this.personality.aggressiveness;
        } else if (card.effectCode.includes('HEAL') || card.effectCode.includes('ARMOR')) {
            multiplier *= this.personality.defensiveness;
        }

        if (card.castTime > 0) {
            multiplier *= this.personality.castingPatience;
        }

        multiplier *= this.personality.efficiency;

        return multiplier;
    }

    /**
     * 获取随机因子
     * @returns {number} 随机因子
     */
    getRandomFactor() {
        switch (this.difficulty) {
            case 'easy': return 0.8;   // 更多随机性
            case 'normal': return 0.6; // 中等随机性
            case 'hard': return 0.3;   // 较少随机性
            default: return 0.6;
        }
    }

    /**
     * 选择最佳治疗卡牌
     * @param {Card[]} healingCards - 治疗卡牌
     * @returns {Card} 选择的卡牌
     */
    selectBestHealingCard(healingCards) {
        return healingCards.reduce((best, current) => 
            (current.value1 || 0) > (best.value1 || 0) ? current : best
        );
    }

    /**
     * 选择最佳护甲卡牌
     * @param {Card[]} armorCards - 护甲卡牌
     * @returns {Card} 选择的卡牌
     */
    selectBestArmorCard(armorCards) {
        return armorCards.reduce((best, current) => 
            (current.value2 || 0) > (best.value2 || 0) ? current : best
        );
    }

    /**
     * 选择最佳伤害卡牌
     * @param {Card[]} damageCards - 伤害卡牌
     * @returns {Card} 选择的卡牌
     */
    selectBestDamageCard(damageCards) {
        return damageCards.reduce((best, current) => {
            const bestEfficiency = (best.value1 || 0) / best.energyCost;
            const currentEfficiency = (current.value1 || 0) / current.energyCost;
            return currentEfficiency > bestEfficiency ? current : best;
        });
    }

    /**
     * 选择最佳状态效果卡牌
     * @param {Card[]} statusCards - 状态效果卡牌
     * @returns {Card} 选择的卡牌
     */
    selectBestStatusCard(statusCards) {
        return statusCards.reduce((best, current) => {
            const bestValue = (current.value1 || 0) + (current.value2 || 0);
            const currentValue = (current.value1 || 0) + (current.value2 || 0);
            return currentValue > bestValue ? current : best;
        });
    }

    /**
     * 选择最佳潜行卡牌
     * @param {Card[]} stealthCards - 潜行卡牌
     * @returns {Card} 选择的卡牌
     */
    selectBestStealthCard(stealthCards) {
        return stealthCards.reduce((best, current) => {
            const bestDuration = current.value3 || 0;
            const currentDuration = current.value3 || 0;
            return currentDuration > bestDuration ? current : best;
        });
    }

    /**
     * 随机选择卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @returns {Card} 选择的卡牌
     */
    selectRandomCard(playableCards) {
        const randomIndex = Math.floor(Math.random() * playableCards.length);
        return playableCards[randomIndex];
    }

    /**
     * 更新记忆
     */
    updateMemory() {
        // 确保gameTime有效
        const gameTime = this.gameState.gameTime || 0;
        
        // 记录血量历史
        this.memory.healthHistory.push({
            gameTime: gameTime,
            playerHealth: this.gameState.playerHealth,
            computerHealth: this.gameState.computerHealth
        });

        // 记录能量历史
        this.memory.energyHistory.push({
            gameTime: gameTime,
            playerEnergy: this.gameState.playerEnergy,
            computerEnergy: this.gameState.computerEnergy
        });

        // 保持历史记录在合理范围内
        if (this.memory.healthHistory.length > 10) {
            this.memory.healthHistory.shift();
        }
        if (this.memory.energyHistory.length > 10) {
            this.memory.energyHistory.shift();
        }
    }

    /**
     * 记录使用的卡牌
     * @param {Card} card - 使用的卡牌
     */
    recordPlayedCard(card) {
        this.memory.lastPlayedCards.push({
            gameTime: this.gameState.gameTime || 0,
            card: card.name,
            effectCode: card.effectCode,
            energyCost: card.energyCost
        });

        // 保持记录在合理范围内
        if (this.memory.lastPlayedCards.length > 5) {
            this.memory.lastPlayedCards.shift();
        }
    }

    /**
     * 更新连击计数器
     * @param {Card} card - 使用的卡牌
     */
    updateComboCounter(card) {
        // 确保gameTime有效
        const gameTime = this.gameState.gameTime || 0;
        
        // 基于时间间隔判断连击（如果在上次连击后5秒内使用卡牌，则算作连击）
        const timeSinceLastCombo = gameTime - this.lastComboTime;
        
        // 如果是第一次使用卡牌（lastComboTime为0），不算连击
        if (this.lastComboTime === 0) {
            this.comboCounter = 1;
        } else if (timeSinceLastCombo <= 5.0) {
            this.comboCounter++;
        } else {
            this.comboCounter = 1;
        }
        
        this.lastComboTime = gameTime;

        // 记录连击历史
        this.memory.comboHistory.push({
            gameTime: this.gameState.gameTime || 0,
            comboCount: this.comboCounter,
            cardName: card.name
        });

        if (this.memory.comboHistory.length > 5) {
            this.memory.comboHistory.shift();
        }
    }

    /**
     * 检查是否有连击卡牌
     * @returns {boolean} 是否有连击卡牌
     */
    hasComboCards() {
        return this.gameState.computerHand.some(card => 
            card.energyCost <= 2 && card.energyCost <= this.gameState.computerEnergy
        );
    }

    /**
     * 判断是否应该使用英雄技能
     * @returns {boolean} 是否应该使用英雄技能
     */
    shouldUseHeroSkill() {
        const character = this.gameState.computerCharacter;
        
        // 检查能量是否足够
        if (character.currentEnergy < 2) {
            return false;
        }

        // 根据职业和局势判断
        switch (character.characterClass) {
            case '战士':
                // 战士技能：造成伤害，血量低时更倾向于使用
                return this.gameState.computerHealth <= 15 || this.gameState.playerHealth <= 10;
            case '法师':
                // 法师技能：下次法术伤害翻倍，有高伤害法术时使用
                const hasHighDamageSpell = this.gameState.computerHand.some(card => 
                    card.class === '法师' && card.effectCode.includes('DAMAGE') && (card.value1 || 0) >= 8
                );
                return hasHighDamageSpell;
            case '盗贼':
                // 盗贼技能：进入潜行，血量低时使用
                return this.gameState.computerHealth <= 12;
            case '牧师':
                // 牧师技能：治疗，血量低时使用
                return this.gameState.computerHealth <= 20;
            default:
                return false;
        }
    }

    /**
     * 获取AI状态信息
     * @returns {object} AI状态信息
     */
    getStatus() {
        return {
            difficulty: this.difficulty,
            personality: this.personality,
            strategy: this.strategy,
            threatLevel: this.threatLevel,
            comboCounter: this.comboCounter,
            memorySize: {
                healthHistory: this.memory.healthHistory.length,
                energyHistory: this.memory.energyHistory.length,
                lastPlayedCards: this.memory.lastPlayedCards.length,
                threatHistory: this.memory.threatHistory.length,
                comboHistory: this.memory.comboHistory.length
            }
        };
    }

    /**
     * 重置AI状态
     */
    reset() {
        this.personality = this.generatePersonality();
        this.memory = {
            lastPlayedCards: [],
            playerPatterns: [],
            healthHistory: [],
            energyHistory: [],
            threatHistory: [],
            comboHistory: [],
            castingHistory: []
        };
        this.comboCounter = 0;
        this.lastComboTime = 0;
        this.threatLevel = 0;
        this.strategy = 'balanced';
        
        // 如果存在monster配置，重新应用
        if (this.monsterConfig) {
            this.applyMonsterConfig();
        } else {
            this.adjustPersonalityByDifficulty();
        }
    }

    /**
     * 选择目标（考虑潜行状态）
     * @param {GameState} gameState - 游戏状态
     * @returns {Character|null} 选择的目标
     */
    chooseTarget(gameState) {
        // 只选择未处于潜行状态的目标
        const target = gameState.playerCharacter;
        if (target.stealthSystem && target.stealthSystem.isCurrentlyStealthed()) {
            return null; // 无法选中
        }
        return target;
    }
} 