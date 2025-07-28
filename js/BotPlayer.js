/**
 * 电脑AI玩家类 - 负责电脑玩家的智能决策
 */
class BotPlayer {
    constructor(gameState) {
        this.gameState = gameState;
        this.personality = this.generatePersonality();
        this.memory = {
            lastPlayedCards: [],
            playerPatterns: [],
            healthHistory: [],
            energyHistory: []
        };
        this.difficulty = 'normal'; // easy, normal, hard
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
            adaptability: Math.random() * 0.8 + 0.2    // 0.2-1.0 适应性
        };
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
                break;
            case 'hard':
                this.personality.aggressiveness *= 1.3;
                this.personality.efficiency *= 1.4;
                this.personality.adaptability *= 1.5;
                break;
        }
    }

    /**
     * 执行电脑AI决策
     * @returns {string} AI决策结果描述
     */
    executeTurn() {
        this.updateMemory();
        
        const strategy = this.analyzeSituation();
        const selectedCard = this.selectCard(strategy);
        
        if (selectedCard) {
            const useResult = this.gameState.useCard(selectedCard, false);
            if (useResult.success) {
                this.recordPlayedCard(selectedCard);
                return `${useResult.message} → ${useResult.effectResult}`;
            }
        }
        
        return "电脑没有足够的能量使用卡牌";
    }

    /**
     * 分析当前局势
     * @returns {object} 策略分析结果
     */
    analyzeSituation() {
        const analysis = {
            playerHealthRatio: this.gameState.playerHealth / 30,
            computerHealthRatio: this.gameState.computerHealth / 30,
            playerArmorRatio: this.gameState.playerArmor / 10,
            computerArmorRatio: this.gameState.computerArmor / 10,
            energyEfficiency: this.gameState.computerEnergy / 10,
            cardAdvantage: this.gameState.computerHand.length - this.gameState.playerHand.length,
            isInDanger: this.gameState.computerHealth <= 10,
            isPlayerInDanger: this.gameState.playerHealth <= 10,
            canFinishPlayer: this.canFinishPlayer(),
            shouldDefend: this.shouldDefend(),
            shouldAggress: this.shouldAggress()
        };

        return analysis;
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
        const healthRatio = this.gameState.computerHealth / 30;
        const hasHealingCards = this.gameState.computerHand.some(card => 
            card.effectCode.includes('HEAL') && card.energyCost <= this.gameState.computerEnergy
        );
        const hasArmorCards = this.gameState.computerHand.some(card => 
            card.effectCode.includes('ARMOR') && card.energyCost <= this.gameState.computerEnergy
        );

        return (healthRatio < 0.4 && (hasHealingCards || hasArmorCards)) || 
               (this.gameState.computerHealth <= 5);
    }

    /**
     * 判断是否应该攻击
     * @returns {boolean} 是否应该攻击
     */
    shouldAggress() {
        const playerHealthRatio = this.gameState.playerHealth / 30;
        const hasDamageCards = this.gameState.computerHand.some(card => 
            card.effectCode.includes('DAMAGE') && card.energyCost <= this.gameState.computerEnergy
        );

        return (playerHealthRatio < 0.5 && hasDamageCards) || 
               this.canFinishPlayer();
    }

    /**
     * 根据策略选择卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {Card|null} 选择的卡牌
     */
    selectCard(strategy) {
        const playableCards = this.gameState.computerHand.filter(card => 
            card.energyCost <= this.gameState.computerEnergy
        );

        if (playableCards.length === 0) {
            return null;
        }

        // 根据策略选择卡牌
        if (strategy.canFinishPlayer) {
            return this.selectFinishingCard(playableCards);
        } else if (strategy.shouldDefend) {
            return this.selectDefensiveCard(playableCards);
        } else if (strategy.shouldAggress) {
            return this.selectAggressiveCard(playableCards);
        } else {
            return this.selectOptimalCard(playableCards, strategy);
        }
    }

    /**
     * 选择终结卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @returns {Card} 选择的卡牌
     */
    selectFinishingCard(playableCards) {
        const damageCards = playableCards.filter(card => 
            card.effectCode.includes('DAMAGE')
        );

        if (damageCards.length > 0) {
            // 选择伤害最高的卡牌
            return damageCards.reduce((best, current) => 
                (current.value1 || 0) > (best.value1 || 0) ? current : best
            );
        }

        return this.selectRandomCard(playableCards);
    }

    /**
     * 选择防御卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @returns {Card} 选择的卡牌
     */
    selectDefensiveCard(playableCards) {
        const healingCards = playableCards.filter(card => 
            card.effectCode.includes('HEAL')
        );
        const armorCards = playableCards.filter(card => 
            card.effectCode.includes('ARMOR')
        );

        // 优先选择治疗卡牌
        if (healingCards.length > 0) {
            return this.selectBestHealingCard(healingCards);
        }

        // 其次选择护甲卡牌
        if (armorCards.length > 0) {
            return this.selectBestArmorCard(armorCards);
        }

        // 最后随机选择
        return this.selectRandomCard(playableCards);
    }

    /**
     * 选择攻击卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @returns {Card} 选择的卡牌
     */
    selectAggressiveCard(playableCards) {
        const damageCards = playableCards.filter(card => 
            card.effectCode.includes('DAMAGE')
        );

        if (damageCards.length > 0) {
            // 根据效率选择最佳伤害卡牌
            return this.selectBestDamageCard(damageCards);
        }

        return this.selectRandomCard(playableCards);
    }

    /**
     * 选择最优卡牌
     * @param {Card[]} playableCards - 可用的卡牌
     * @param {object} strategy - 策略分析结果
     * @returns {Card} 选择的卡牌
     */
    selectOptimalCard(playableCards, strategy) {
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
        }

        // 根据个性调整评分
        score *= this.getPersonalityMultiplier(card);

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
        // 记录血量历史
        this.memory.healthHistory.push({
            turn: this.gameState.currentTurn,
            playerHealth: this.gameState.playerHealth,
            computerHealth: this.gameState.computerHealth
        });

        // 记录能量历史
        this.memory.energyHistory.push({
            turn: this.gameState.currentTurn,
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
            turn: this.gameState.currentTurn,
            card: card.name,
            effectCode: card.effectCode
        });

        // 保持记录在合理范围内
        if (this.memory.lastPlayedCards.length > 5) {
            this.memory.lastPlayedCards.shift();
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
            memorySize: {
                healthHistory: this.memory.healthHistory.length,
                energyHistory: this.memory.energyHistory.length,
                lastPlayedCards: this.memory.lastPlayedCards.length
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
            energyHistory: []
        };
        this.adjustPersonalityByDifficulty();
    }
} 