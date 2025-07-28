/**
 * 卡牌效果策略接口
 */
class CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        throw new Error('execute method must be implemented');
    }
}

/**
 * 伤害效果策略
 */
class DamageEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const damage = card.calculateActualDamage(card.value1, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        }
        
        return card.formatEffect(damage);
    }
}

/**
 * 治疗效果策略
 */
class HealEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        if (isPlayer) {
            gameState.playerCharacter.heal(card.value1);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        } else {
            gameState.computerCharacter.heal(card.value1);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        }
        
        return card.formatEffect(card.value1);
    }
}

/**
 * 伤害+中毒效果策略
 */
class DamagePoisonEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const damage = card.calculateActualDamage(card.value1, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            if (gameState.computerCharacter) {
                gameState.computerCharacter.addStatusEffect(new PoisonEffect(card.value2, 5));
            }
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            if (gameState.playerCharacter) {
                gameState.playerCharacter.addStatusEffect(new PoisonEffect(card.value2, 5));
            }
        }
        
        return card.formatEffect(damage, card.value2);
    }
}

/**
 * 伤害+减速效果策略
 */
class DamageSlowEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const damage = card.calculateActualDamage(card.value1, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            if (gameState.computerCharacter) {
                gameState.computerCharacter.addStatusEffect(new SlowEffect(card.value2, card.value3));
            }
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            if (gameState.playerCharacter) {
                gameState.playerCharacter.addStatusEffect(new SlowEffect(card.value2, card.value3));
            }
        }
        
        return card.formatEffect(damage, card.value2, card.value3);
    }
}

/**
 * 伤害+护甲效果策略
 */
class DamageArmorEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const damage = card.calculateActualDamage(card.value1, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            gameState.playerArmor += card.value2;
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            gameState.computerArmor += card.value2;
        }
        
        return card.formatEffect(damage, card.value2);
    }
}

/**
 * 消耗所有能量效果策略
 */
class ConsumeAllEnergyEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const energy = isPlayer ? gameState.playerEnergy : gameState.computerEnergy;
        // 修改伤害计算：基础伤害 + 额外消耗的能量
        const baseDamage = card.value1 || 0; // 基础伤害，如果没有设置则默认为0
        const extraDamage = energy; // 额外消耗的能量直接转换为伤害
        const totalDamage = baseDamage + extraDamage;
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(totalDamage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            gameState.playerEnergy = 0;
        } else {
            gameState.playerCharacter.takeDamage(totalDamage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            gameState.computerEnergy = 0;
        }
        
        return `${card.name} 消耗所有能量造成${totalDamage}点伤害（基础${baseDamage} + 额外${extraDamage}）`;
    }
}

/**
 * 伏击效果策略
 */
class AmbushEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const damage = card.calculateActualDamage(card.value1, character);
        
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
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        }
        
        return card.formatEffect(damage) + interruptMessage;
    }
}

/**
 * 潜行效果策略
 */
class StealthEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        if (isPlayer && gameState.playerCharacter) {
            gameState.playerCharacter.stealthSystem.enterStealth(card.value1);
        } else if (!isPlayer && gameState.computerCharacter) {
            gameState.computerCharacter.stealthSystem.enterStealth(card.value1);
        }
        return `进入潜行状态，持续${card.value1}秒`;
    }
}

/**
 * 抽牌弃牌效果策略
 */
class DrawDiscardEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        if (isPlayer) {
            const drawnCards = [];
            for (let i = 0; i < card.value1; i++) {
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
            for (let i = 0; i < card.value1; i++) {
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
        return `抽取${card.value1}张卡牌，随机丢弃1张`;
    }
}

/**
 * 驱散效果策略
 */
class DispelEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        if (isPlayer && gameState.computerCharacter) {
            gameState.computerCharacter.statusEffects = [];
        } else if (!isPlayer && gameState.playerCharacter) {
            gameState.playerCharacter.statusEffects = [];
        }
        return "移除所有负面效果";
    }
}

/**
 * 血祭效果策略
 */
class BloodSacrificeEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        // 设置生命消耗
        card.healthCost = 2;
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const damage = card.calculateActualDamage(card.value1, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        }
        
        return `${card.name} 消耗2点生命值，对${isPlayer ? "电脑" : "玩家"}造成${damage}点伤害`;
    }
}

/**
 * 默认效果策略
 */
class DefaultEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(4);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        } else {
            gameState.playerCharacter.takeDamage(4);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        }
        return `${card.name} 对${isPlayer ? "电脑" : "玩家"}造成4点伤害`;
    }
}

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
        
        // 初始化效果策略
        this.effectStrategy = this.createEffectStrategy();
    }

    /**
     * 创建效果策略
     */
    createEffectStrategy() {
        const effectCode = this.effectCode || this.name;
        
        const strategyMap = {
            'DAMAGE_6': new DamageEffectStrategy(),
            'DAMAGE_8': new DamageEffectStrategy(),
            'DAMAGE_9': new DamageEffectStrategy(),
            'HEAL_6': new HealEffectStrategy(),
            'DAMAGE_6_POISON': new DamagePoisonEffectStrategy(),
            'DAMAGE_3_SLOW': new DamageSlowEffectStrategy(),
            'DAMAGE_4_ARMOR': new DamageArmorEffectStrategy(),
            'DAMAGE_4_ALL_SLOW': new DamageSlowEffectStrategy(),
            'CONSUME_ALL_ENERGY': new ConsumeAllEnergyEffectStrategy(),
            'DAMAGE_15': new AmbushEffectStrategy(),
            'STEALTH': new StealthEffectStrategy(),
            'DRAW_3_DISCARD_1': new DrawDiscardEffectStrategy(),
            'HEAL_4_ALL': new HealEffectStrategy(),
            'DISPEL': new DispelEffectStrategy(),
            'BLOOD_SACRIFICE': new BloodSacrificeEffectStrategy()
        };
        
        return strategyMap[effectCode] || new DefaultEffectStrategy();
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
        return this.effectStrategy.execute(gameState, isPlayer, this);
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