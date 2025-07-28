/**
 * 卡牌类 - 对应C#版本的Card类
 */
class Card {
    constructor(name, cardClass, energyCost, castTime, castType, effect, effectCode = "", value1 = 0, value2 = 0, value3 = 0) {
        this.name = name;
        this.class = cardClass;
        this.energyCost = energyCost;
        this.healthCost = 0; // 生命消耗（新增）
        this.castTime = castTime;
        this.castType = castType;
        this.effect = effect;
        this.effectCode = effectCode;
        this.value1 = value1;  // 主要数值（伤害、治疗量等）
        this.value2 = value2;  // 次要数值（护甲、减速值等）
        this.value3 = value3;  // 第三数值（持续时间等）
        this.isExhaust = false; // 是否用后进入消耗堆
        this.isLocked = false; // 是否已锁定目标（锁定后不受潜行影响）
        this.lockedTarget = null; // 锁定的目标
    }

    /**
     * 锁定目标（锁定后不受潜行影响）
     * @param {Character} target - 锁定的目标
     */
    lockTarget(target) {
        this.isLocked = true;
        this.lockedTarget = target;
    }

    /**
     * 检查是否可以攻击目标（考虑潜行和锁定状态）
     * @param {Character} target - 目标角色
     * @returns {boolean} 是否可以攻击
     */
    canAttackTarget(target) {
        // 如果已锁定目标，则不受潜行影响
        if (this.isLocked && this.lockedTarget === target) {
            return true;
        }
        // 如果目标处于潜行状态且未锁定，则无法攻击
        if (target.stealthSystem && target.stealthSystem.isCurrentlyStealthed()) {
            return false;
        }
        return true;
    }

    /**
     * 计算实际伤害（考虑法师技能效果）
     * @param {number} baseDamage - 基础伤害
     * @param {Character} character - 施法者角色
     * @returns {number} 实际伤害
     */
    calculateActualDamage(baseDamage, character) {
        let actualDamage = baseDamage;
        
        // 检查法师技能效果：下次法术伤害翻倍
        if (character.nextSpellDoubleDamage && this.class === '法师') {
            actualDamage *= 2;
            character.nextSpellDoubleDamage = false; // 使用后清除标记
        }
        
        return actualDamage;
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
        
        // 获取施法者角色（用于伤害计算）
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        
        switch (effectCode) {
            case "DAMAGE_6":
                const damage6 = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damage6);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(damage6);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(damage6);
                
            case "DAMAGE_8":
                const damage8 = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damage8);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(damage8);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(damage8);
                
            case "DAMAGE_9":
                const damage9 = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damage9);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(damage9);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(damage9);
                
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
                const damagePoison = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damagePoison);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    // 添加中毒效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new PoisonEffect(this.value2, 5));
                    }
                } else {
                    gameState.playerCharacter.takeDamage(damagePoison);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    // 添加中毒效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new PoisonEffect(this.value2, 5));
                    }
                }
                return this.formatEffect(damagePoison, this.value2);
                
            case "DAMAGE_3_SLOW":
                const damageSlow = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damageSlow);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    // 添加减速效果
                    if (gameState.computerCharacter) {
                        gameState.computerCharacter.addStatusEffect(new SlowEffect(this.value2, this.value3));
                    }
                } else {
                    gameState.playerCharacter.takeDamage(damageSlow);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    // 添加减速效果
                    if (gameState.playerCharacter) {
                        gameState.playerCharacter.addStatusEffect(new SlowEffect(this.value2, this.value3));
                    }
                }
                return this.formatEffect(damageSlow, this.value2, this.value3);
                
            case "DAMAGE_4_ARMOR":
                const damageArmor = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damageArmor);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                    gameState.playerArmor += this.value2;
                } else {
                    gameState.playerCharacter.takeDamage(damageArmor);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                    gameState.computerArmor += this.value2;
                }
                return this.formatEffect(damageArmor, this.value2);
                
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
                // 获取当前能量值
                const energy = isPlayer ? gameState.playerEnergy : gameState.computerEnergy;
                // 计算伤害：1+2+3+...+energy（等差数列求和）
                const damage = (energy * (energy + 1)) / 2;
                
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
                const damage15 = this.calculateActualDamage(this.value1, character);
                // 检查潜行状态
                if (isPlayer && gameState.playerCharacter && !gameState.playerCharacter.stealthSystem.isCurrentlyStealthed()) {
                    return "伏击只能在潜行状态下使用";
                }
                if (!isPlayer && gameState.computerCharacter && !gameState.computerCharacter.stealthSystem.isCurrentlyStealthed()) {
                    return "伏击只能在潜行状态下使用";
                }
                // 检查目标是否在吟唱中，如果是则中断吟唱
                let interruptMessage = "";
                if (isPlayer && gameState.computerCastingSystem.isCurrentlyCasting()) {
                    gameState.computerCastingSystem.interruptCasting();
                    interruptMessage = "，中断了目标的吟唱";
                } else if (!isPlayer && gameState.playerCastingSystem.isCurrentlyCasting()) {
                    gameState.playerCastingSystem.interruptCasting();
                    interruptMessage = "，中断了目标的吟唱";
                }
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damage15);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(damage15);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return this.formatEffect(damage15) + interruptMessage;
                
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
                
            case "BLOOD_SACRIFICE":
                // 设置生命消耗
                this.healthCost = 2;
                const damageBlood = this.calculateActualDamage(this.value1, character);
                if (isPlayer) {
                    gameState.computerCharacter.takeDamage(damageBlood);
                    gameState.computerHealth = gameState.computerCharacter.currentHealth;
                } else {
                    gameState.playerCharacter.takeDamage(damageBlood);
                    gameState.playerHealth = gameState.playerCharacter.currentHealth;
                }
                return `${this.name} 消耗2点生命值，对${isPlayer ? "电脑" : "玩家"}造成${damageBlood}点伤害`;
                
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