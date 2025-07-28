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
        const target = isPlayer ? "电脑" : "玩家";
        
        // 优先使用EffectCode，如果没有则使用Name作为后备
        const effectCode = this.effectCode || this.name;
        
        switch (effectCode) {
            case "DAMAGE_6":
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                } else {
                    gameState.playerHealth -= this.value1;
                }
                return this.formatEffect(this.value1);
                
            case "DAMAGE_9":
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                } else {
                    gameState.playerHealth -= this.value1;
                }
                return this.formatEffect(this.value1);
                
            case "HEAL_6":
                if (isPlayer) {
                    gameState.playerHealth = Math.min(gameState.playerHealth + this.value1, 30);
                } else {
                    gameState.computerHealth = Math.min(gameState.computerHealth + this.value1, 30);
                }
                return this.formatEffect(this.value1);
                
            case "DAMAGE_6_POISON":
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                    // 添加中毒效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new PoisonEffect(this.value2, 5));
                    }
                } else {
                    gameState.playerHealth -= this.value1;
                    // 添加中毒效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new PoisonEffect(this.value2, 5));
                    }
                }
                return this.formatEffect(this.value1, this.value2);
                
            case "DAMAGE_3_SLOW":
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                    // 添加减速效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new SlowEffect(this.value2, this.value3));
                    }
                } else {
                    gameState.playerHealth -= this.value1;
                    // 添加减速效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new SlowEffect(this.value2, this.value3));
                    }
                }
                return this.formatEffect(this.value1, this.value2, this.value3);
                
            case "DAMAGE_4_ARMOR":
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                    gameState.playerArmor += this.value2;
                } else {
                    gameState.playerHealth -= this.value1;
                    gameState.computerArmor += this.value2;
                }
                return this.formatEffect(this.value1, this.value2);
                
            case "DAMAGE_4_ALL_SLOW":
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                    // 添加减速效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new SlowEffect(this.value2, 3));
                    }
                } else {
                    gameState.playerHealth -= this.value1;
                    // 添加减速效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new SlowEffect(this.value2, 3));
                    }
                }
                return this.formatEffect(this.value1, this.value2);
                
            case "CONSUME_ALL_ENERGY":
                const damage = isPlayer ? gameState.playerEnergy * this.value1 : gameState.computerEnergy * this.value1;
                if (isPlayer) {
                    gameState.computerHealth -= damage;
                    gameState.playerEnergy = 0;
                } else {
                    gameState.playerHealth -= damage;
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
                    gameState.computerHealth -= this.value1;
                } else {
                    gameState.playerHealth -= this.value1;
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
                    gameState.playerHealth = Math.min(gameState.playerHealth + this.value1, 30);
                } else {
                    gameState.computerHealth = Math.min(gameState.computerHealth + this.value1, 30);
                }
                return this.formatEffect(this.value1);
                
            case "DISPEL":
                if (isPlayer && gameState.computerCharacter) {
                    gameState.computerCharacter.statusEffects = [];
                } else if (!isPlayer && gameState.playerCharacter) {
                    gameState.playerCharacter.statusEffects = [];
                }
                return "移除所有负面效果";
                if (isPlayer) {
                    gameState.computerHealth -= this.value1;
                } else {
                    gameState.playerHealth -= this.value1;
                }
                return this.formatEffect(this.value1);
                
            case "STEALTH":
                return this.formatEffect(this.value1);
                
            case "HEAL_4_ALL":
                if (isPlayer) {
                    gameState.playerHealth = Math.min(gameState.playerHealth + this.value1, 30);
                } else {
                    gameState.computerHealth = Math.min(gameState.computerHealth + this.value1, 30);
                }
                return this.formatEffect(this.value1);
                
            case "DISPEL":
                return this.effect;
                
            default:
                // 后备：使用Name进行匹配（兼容旧版本）
                return this.executeLegacyEffect(gameState, isPlayer, target);
        }
    }

    /**
     * 执行旧版本效果（兼容性）
     */
    executeLegacyEffect(gameState, isPlayer, target) {
        switch (this.name) {
            case "打击":
                if (isPlayer) {
                    gameState.computerHealth -= 6;
                } else {
                    gameState.playerHealth -= 6;
                }
                return `${this.name} 对${target}造成6点伤害`;
                
            case "火球术":
                if (isPlayer) {
                    gameState.computerHealth -= 8;
                } else {
                    gameState.playerHealth -= 8;
                }
                return `${this.name} 对${target}造成8点伤害`;
                
            case "治疗术":
                if (isPlayer) {
                    gameState.playerHealth = Math.min(gameState.playerHealth + 6, 30);
                } else {
                    gameState.computerHealth = Math.min(gameState.computerHealth + 6, 30);
                }
                return `${this.name} 恢复了6点生命值`;
                
            case "毒刃":
                if (isPlayer) {
                    gameState.computerHealth -= 6;
                } else {
                    gameState.playerHealth -= 6;
                }
                return `${this.name} 对${target}造成6点伤害并施加中毒效果`;
                
            case "断筋":
                if (isPlayer) {
                    gameState.computerHealth -= 3;
                } else {
                    gameState.playerHealth -= 3;
                }
                return `${this.name} 对${target}造成3点伤害并减速`;
                
            case "盾击":
                if (isPlayer) {
                    gameState.computerHealth -= 4;
                } else {
                    gameState.playerHealth -= 4;
                }
                return `${this.name} 对${target}造成4点伤害并获得护甲`;
                
            case "冰霜新星":
                if (isPlayer) {
                    gameState.computerHealth -= 4;
                } else {
                    gameState.playerHealth -= 4;
                }
                return `${this.name} 对所有敌人造成4点伤害并减速`;
                
            case "奥术冲击":
                const damage2 = isPlayer ? gameState.playerEnergy * 2 : gameState.computerEnergy * 2;
                if (isPlayer) {
                    gameState.computerHealth -= damage2;
                    gameState.playerEnergy = 0;
                } else {
                    gameState.playerHealth -= damage2;
                    gameState.computerEnergy = 0;
                }
                return `${this.name} 消耗所有能量造成${damage2}点伤害`;
                
            case "伏击":
                if (isPlayer) {
                    gameState.computerHealth -= 15;
                } else {
                    gameState.playerHealth -= 15;
                }
                return `${this.name} 造成15点高额伤害`;
                
            case "疾跑":
                return `${this.name} 进入潜行状态`;
                
            case "神圣新星":
                if (isPlayer) {
                    gameState.playerHealth = Math.min(gameState.playerHealth + 4, 30);
                } else {
                    gameState.computerHealth = Math.min(gameState.computerHealth + 4, 30);
                }
                return `${this.name} 恢复4点生命值`;
                
            case "驱散":
                return `${this.name} 移除负面效果`;
                
            default:
                // 默认效果
                if (isPlayer) {
                    gameState.computerHealth -= 4;
                } else {
                    gameState.playerHealth -= 4;
                }
                return `${this.name} 对${target}造成4点伤害`;
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