/**
 * 卡牌类 - 对应C#版本的Card类
 */
class Card {
    constructor(name, cardClass, energyCost, castTime, castType, effect, effectCode = "", value1 = 0, value2 = 0, value3 = 0) {
        this.name = name;
        this.class = cardClass;
        this.energyCost = energyCost;
        this.castTime = castTime;
        this.castType = castType;
        this.effect = effect;
        this.effectCode = effectCode;
        this.value1 = value1;  // 主要数值（伤害、治疗量等）
        this.value2 = value2;  // 次要数值（护甲、减速值等）
        this.value3 = value3;  // 第三数值（持续时间等）
    }

    /**
     * 执行卡牌效果
     * @param {GameState} gameState - 游戏状态
     * @param {boolean} isPlayer - 是否为玩家使用
     * @returns {string} 效果描述
     */
    executeEffect(gameState, isPlayer) {
        // 优先使用EffectCode，如果没有则使用Name作为后备
        const effectCode = this.effectCode || this.name;
        
        switch (effectCode) {
            case "DAMAGE_6":
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(this.value1);
                
            case "DAMAGE_9":
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(this.value1);
                
            case "HEAL_6":
                if (isPlayer) {
                    gameState.playerCharacter.heal(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                } else {
                    gameState.computerCharacter.heal(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                }
                return this.formatEffect(this.value1);
                
            case "DAMAGE_6_POISON":
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    // 添加中毒效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new PoisonEffect(this.value2, 5));
                    }
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    // 添加中毒效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new PoisonEffect(this.value2, 5));
                    }
                }
                return this.formatEffect(this.value1, this.value2);
                
            case "DAMAGE_3_SLOW":
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    // 添加减速效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new SlowEffect(this.value2, this.value3));
                    }
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    // 添加减速效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new SlowEffect(this.value2, this.value3));
                    }
                }
                return this.formatEffect(this.value1, this.value2, this.value3);
                
            case "DAMAGE_4_ARMOR":
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    gameState.playerArmor += this.value2;
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    gameState.computerArmor += this.value2;
                }
                return this.formatEffect(this.value1, this.value2);
                
            case "DAMAGE_4_ALL_SLOW":
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    // 添加减速效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new SlowEffect(this.value2, 3));
                    }
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    // 添加减速效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new SlowEffect(this.value2, 3));
                    }
                }
                return this.formatEffect(this.value1, this.value2);
                
            case "CONSUME_ALL_ENERGY":
                const damage = isPlayer ? gameState.playerEnergy * this.value1 : gameState.computerEnergy * this.value1;
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damage);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    gameState.playerEnergy = 0;
                } else {
                    gameState.playerCharacter.takeDamage(damage);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    gameState.computerEnergy = 0;
                }
                return `${this.name} 消耗所有能量造成${damage}点伤害`;
                
            case "DAMAGE_15":
                // 检查潜行状态
                if (isPlayer && gameState.playerCharacter && !gameState.playerCharacter.stealthSystem.isCurrentlyStealthed()) {
                    return "伏击只能在潜行状态下使用";
                }
                if (!isPlayer && gameState.computerCharacter && !gameState.computerCharacter.stealthSystem.isCurrentlyStealthed()) {
                    return "伏击只能在潜行状态下使用";
                }
                
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(this.value1);
                
            case "STEALTH":
                if (isPlayer && gameState.playerCharacter) {
                    gameState.playerCharacter.stealthSystem.enterStealth(this.value1);
                } else if (!isPlayer && gameState.computerCharacter) {
                    gameState.computerCharacter.stealthSystem.enterStealth(this.value1);
                }
                return `进入潜行状态，持续${this.value1}秒`;
                
            case "DRAW_3_DISCARD_1":
                // 抽取3张卡牌，随机丢弃1张
                if (isPlayer) {
                    const drawnCards = [];
                    for (let i = 0; i < this.value1; i++) {
                        if (gameState.playerDeck.length > 0) {
                            drawnCards.push(gameState.playerDeck.pop());
                        }
                    }
                    
                    // 随机丢弃1张
                    if (drawnCards.length > 0) {
                        const discardIndex = Math.floor(Math.random() * drawnCards.length);
                        const discardedCard = drawnCards.splice(discardIndex, 1)[0];
                        gameState.playerDiscardPile.push(discardedCard);
                        
                        // 将剩余的卡牌加入手牌
                        gameState.playerHand.push(...drawnCards);
                    }
                } else {
                    const drawnCards = [];
                    for (let i = 0; i < this.value1; i++) {
                        if (gameState.computerDeck.length > 0) {
                            drawnCards.push(gameState.computerDeck.pop());
                        }
                    }
                    
                    // 随机丢弃1张
                    if (drawnCards.length > 0) {
                        const discardIndex = Math.floor(Math.random() * drawnCards.length);
                        const discardedCard = drawnCards.splice(discardIndex, 1)[0];
                        gameState.computerDiscardPile.push(discardedCard);
                        
                        // 将剩余的卡牌加入手牌
                        gameState.computerHand.push(...drawnCards);
                    }
                }
                return `抽取${this.value1}张卡牌，随机丢弃1张`;
                
            case "HEAL_4_ALL":
                if (isPlayer) {
                    gameState.playerCharacter.heal(this.value1);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                } else {
                    gameState.computerCharacter.heal(this.value1);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                }
                return this.formatEffect(this.value1);
                
            case "DISPEL":
                if (isPlayer && gameState.computerCharacter) {
                    gameState.computerCharacter.statusEffects = [];
                } else if (!isPlayer && gameState.playerCharacter) {
                    gameState.playerCharacter.statusEffects = [];
                }
                return "移除所有负面效果";
                
            case "STEALTH":
                return this.formatEffect(this.value1);
                
            default:
                // 默认效果：造成4点伤害
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(4);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(4);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return `${this.name} 对${isPlayer ? "电脑" : "玩家"}造成4点伤害`;
        }
    }



    /**
     * 格式化效果描述
     */
    formatEffect(value1, value2 = null, value3 = null) {
        if (value2 === null && value3 === null) {
            return this.effect.replace('{0}', value1);
        } else if (value3 === null) {
            return this.effect.replace('{0}', value1).replace('{1}', value2);
        } else {
            return this.effect.replace('{0}', value1).replace('{1}', value2).replace('{2}', value3);
        }
    }

    /**
     * 获取显示文本
     */
    getDisplayText() {
        return `${this.name} (${this.class})`;
    }

    /**
     * 检查是否可以打出（能量是否足够）
     */
    canPlay(currentEnergy) {
        return currentEnergy >= this.energyCost;
    }

    /**
     * 创建卡牌元素
     */
    createCardElement() {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${this.class.toLowerCase()}`;
        cardDiv.dataset.cardName = this.name;
        
        cardDiv.innerHTML = `
            <div class="card-cost">${this.energyCost}</div>
            <div class="card-name">${this.name}</div>
            <div class="card-class">${this.class}</div>
            <div class="card-effect">${this.effect}</div>
            <div class="card-type">${this.castType}</div>
        `;
        
        return cardDiv;
    }
} 