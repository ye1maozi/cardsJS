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
        // 支持新的damage字段和兼容旧的value1字段
        const damageValue = card.damage || card.value1;
        const damage = card.calculateActualDamage(damageValue, character);
        
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
        // 支持新的heal字段和兼容旧的value1字段
        const healValue = card.heal || card.value1;
        
        if (isPlayer) {
            gameState.playerCharacter.heal(healValue);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        } else {
            gameState.computerCharacter.heal(healValue);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        }
        
        return card.formatEffect(healValue);
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
                const poisonEffect = new PoisonEffect(card.value2, 5);
                gameState.computerCharacter.addStatusEffect(poisonEffect);
                console.log(`添加中毒效果到电脑: ${poisonEffect.description}, 持续时间: ${poisonEffect.duration}s`);
            }
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            if (gameState.playerCharacter) {
                const poisonEffect = new PoisonEffect(card.value2, 5);
                gameState.playerCharacter.addStatusEffect(poisonEffect);
                console.log(`添加中毒效果到玩家: ${poisonEffect.description}, 持续时间: ${poisonEffect.duration}s`);
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
                const slowEffect = new SlowEffect(card.value2, card.value3);
                gameState.computerCharacter.addStatusEffect(slowEffect);
                console.log(`添加减速效果到电脑: ${slowEffect.description}, 持续时间: ${slowEffect.duration}s`);
            }
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            if (gameState.playerCharacter) {
                const slowEffect = new SlowEffect(card.value2, card.value3);
                gameState.playerCharacter.addStatusEffect(slowEffect);
                console.log(`添加减速效果到玩家: ${slowEffect.description}, 持续时间: ${slowEffect.duration}s`);
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
        // 支持新的damage字段和兼容旧的value1字段
        const damageValue = card.damage || card.value1;
        const damage = card.calculateActualDamage(damageValue, character);
        // 支持新的armor字段和兼容旧的value2字段
        const armorValue = card.armor || card.value2;
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            gameState.playerArmor += armorValue;
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            gameState.computerArmor += armorValue;
        }
        
        return card.formatEffect(damage, armorValue);
    }
}

/**
 * 伤害+Buff效果策略
 */
class DamageWithBuffEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        console.log('卡牌buff字段：', card.buff, card);
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        // 支持新的damage字段和兼容旧的value1字段
        const damageValue = card.damage || card.value1;
        const damage = card.calculateActualDamage(damageValue, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            
            // 应用buff效果
            if (card.buff && gameState.computerCharacter) {
                this.applyBuff(gameState.computerCharacter, card.buff);
            }
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            
            // 应用buff效果
            if (card.buff && gameState.playerCharacter) {
                this.applyBuff(gameState.playerCharacter, card.buff);
            }
        }
        
        return this.formatBuffEffect(damage, card.buff);
    }
    
    applyBuff(character, buff) {
        if (!character || !buff) {
            console.warn('applyBuff: 角色或buff配置为空');
            return;
        }
        
        console.log(`应用buff到角色 ${character.name}:`, buff);
        
        switch (buff.type) {
            case 'poison':
                const poisonEffect = new PoisonEffect(buff.value, buff.duration);
                character.addStatusEffect(poisonEffect);
                console.log(`✓ 添加中毒效果: ${poisonEffect.description}, 持续时间: ${poisonEffect.duration}s`);
                console.log(`角色当前状态效果数量: ${character.statusEffects.length}`);
                break;
            case 'slow':
                const slowEffect = new SlowEffect(buff.value, buff.duration);
                character.addStatusEffect(slowEffect);
                console.log(`✓ 添加减速效果: ${slowEffect.description}, 持续时间: ${slowEffect.duration}s`);
                console.log(`角色当前状态效果数量: ${character.statusEffects.length}`);
                break;
            case 'stealth':
                const stealthEffect = new StealthEffect(buff.duration);
                character.addStatusEffect(stealthEffect);
                console.log(`✓ 添加潜行效果: ${stealthEffect.description}, 持续时间: ${stealthEffect.duration}s`);
                console.log(`角色当前状态效果数量: ${character.statusEffects.length}`);
                break;
            default:
                console.warn(`未知的buff类型: ${buff.type}`);
        }
        
        // 强制触发UI更新
        if (character.gameState && character.gameState.gameUI) {
            console.log('触发UI更新...');
            character.gameState.gameUI.updateStatusEffects();
        }
    }
    
    formatBuffEffect(damage, buff) {
        if (!buff) return `造成${damage}点伤害`;
        
        switch (buff.type) {
            case 'poison':
                return `造成${damage}点伤害，并使目标获得${buff.value}层中毒，持续${buff.duration}秒`;
            case 'slow':
                return `造成${damage}点伤害，并使目标速度降低${buff.value}点，持续${buff.duration}秒`;
            case 'stealth':
                return `造成${damage}点伤害，并使目标进入潜行状态，持续${buff.duration}秒`;
            default:
                return `造成${damage}点伤害`;
        }
    }
}

/**
 * 全目标伤害+Buff效果策略
 */
class DamageAllWithBuffEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        // 支持新的damage字段和兼容旧的value1字段
        const damageValue = card.damage || card.value1;
        const damage = card.calculateActualDamage(damageValue, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
            
            // 应用buff效果到所有敌人（这里只有电脑）
            if (card.buff && gameState.computerCharacter) {
                this.applyBuff(gameState.computerCharacter, card.buff);
            }
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
            
            // 应用buff效果到所有敌人（这里只有玩家）
            if (card.buff && gameState.playerCharacter) {
                this.applyBuff(gameState.playerCharacter, card.buff);
            }
        }
        
        return this.formatBuffEffect(damage, card.buff);
    }
    
    applyBuff(character, buff) {
        if (!character || !buff) {
            console.warn('applyBuff: 角色或buff配置为空');
            return;
        }
        
        console.log(`应用buff到角色 ${character.name}:`, buff);
        
        switch (buff.type) {
            case 'poison':
                const poisonEffect = new PoisonEffect(buff.value, buff.duration);
                character.addStatusEffect(poisonEffect);
                console.log(`✓ 添加中毒效果: ${poisonEffect.description}, 持续时间: ${poisonEffect.duration}s`);
                console.log(`角色当前状态效果数量: ${character.statusEffects.length}`);
                break;
            case 'slow':
                const slowEffect = new SlowEffect(buff.value, buff.duration);
                character.addStatusEffect(slowEffect);
                console.log(`✓ 添加减速效果: ${slowEffect.description}, 持续时间: ${slowEffect.duration}s`);
                console.log(`角色当前状态效果数量: ${character.statusEffects.length}`);
                break;
            case 'stealth':
                const stealthEffect = new StealthEffect(buff.duration);
                character.addStatusEffect(stealthEffect);
                console.log(`✓ 添加潜行效果: ${stealthEffect.description}, 持续时间: ${stealthEffect.duration}s`);
                console.log(`角色当前状态效果数量: ${character.statusEffects.length}`);
                break;
            default:
                console.warn(`未知的buff类型: ${buff.type}`);
        }
        
        // 强制触发UI更新
        if (character.gameState && character.gameState.gameUI) {
            console.log('触发UI更新...');
            character.gameState.gameUI.updateStatusEffects();
        }
    }
    
    formatBuffEffect(damage, buff) {
        if (!buff) return `对所有敌人造成${damage}点伤害`;
        
        switch (buff.type) {
            case 'poison':
                return `对所有敌人造成${damage}点伤害，并使其获得${buff.value}层中毒，持续${buff.duration}秒`;
            case 'slow':
                return `对所有敌人造成${damage}点伤害，并使其速度降低${buff.value}点，持续${buff.duration}秒`;
            case 'stealth':
                return `对所有敌人造成${damage}点伤害，并使其进入潜行状态，持续${buff.duration}秒`;
            default:
                return `对所有敌人造成${damage}点伤害`;
        }
    }
}

/**
 * 消耗所有能量效果策略
 */
class ConsumeAllEnergyEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        const energy = isPlayer ? gameState.playerEnergy : gameState.computerEnergy;
        // 支持新的baseDamage字段和兼容旧的value1字段
        const baseDamage = card.baseDamage || card.value1 || 0;
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
        // 支持新的buff配置和兼容旧的value1字段
        let duration = card.value1;
        if (card.buff && card.buff.duration) {
            duration = card.buff.duration;
        }
        
        if (isPlayer && gameState.playerCharacter) {
            gameState.playerCharacter.stealthSystem.enterStealth(duration);
        } else if (!isPlayer && gameState.computerCharacter) {
            gameState.computerCharacter.stealthSystem.enterStealth(duration);
        }
        return `进入潜行状态，持续${duration}秒`;
    }
}

/**
 * 抽牌弃牌效果策略
 */
class DrawDiscardEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        if (isPlayer) {
            // 使用drawCards方法，不检查手牌数量限制
            gameState.drawCards(gameState.playerDeck, gameState.playerHand, card.value1, true, false);
            
            // 随机丢弃1张
            if (gameState.playerHand.length > 0) {
                const discardIndex = Math.floor(Math.random() * gameState.playerHand.length);
                const discardedCard = gameState.playerHand.splice(discardIndex, 1)[0];
                gameState.playerDiscardPile.push(discardedCard);
            }
        } else {
            // 使用drawCards方法，不检查手牌数量限制
            gameState.drawCards(gameState.computerDeck, gameState.computerHand, card.value1, false, false);
            
            // 随机丢弃1张
            if (gameState.computerHand.length > 0) {
                const discardIndex = Math.floor(Math.random() * gameState.computerHand.length);
                const discardedCard = gameState.computerHand.splice(discardIndex, 1)[0];
                gameState.computerDiscardPile.push(discardedCard);
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
        const target = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        const targetName = isPlayer ? "玩家" : "电脑";
        
        // 记录驱散前的状态效果数量
        const effectsBefore = target.statusEffects.length;
        console.log(`驱散前 ${targetName} 的状态效果数量: ${effectsBefore}`);
        if (effectsBefore > 0) {
            console.log(`状态效果详情:`, target.statusEffects.map(effect => `${effect.type} (${effect.duration.toFixed(1)}s)`));
        }
        
        // 清空状态效果
        target.statusEffects = [];
        
        // 记录驱散后的状态效果数量
        const effectsAfter = target.statusEffects.length;
        console.log(`驱散后 ${targetName} 的状态效果数量: ${effectsAfter}`);
        
        return `移除${targetName}身上的所有负面效果 (${effectsBefore}个效果被移除)`;
    }
}

/**
 * 血祭效果策略
 */
class BloodSacrificeEffectStrategy extends CardEffectStrategy {
    execute(gameState, isPlayer, card) {
        // 支持新的healthCost字段和兼容旧的固定值
        const healthCost = card.healthCost || 2;
        card.healthCost = healthCost;
        
        const character = isPlayer ? gameState.playerCharacter : gameState.computerCharacter;
        // 支持新的damage字段和兼容旧的value1字段
        const damageValue = card.damage || card.value1;
        const damage = card.calculateActualDamage(damageValue, character);
        
        if (isPlayer) {
            gameState.computerCharacter.takeDamage(damage);
            gameState.computerHealth = gameState.computerCharacter.currentHealth;
        } else {
            gameState.playerCharacter.takeDamage(damage);
            gameState.playerHealth = gameState.playerCharacter.currentHealth;
        }
        
        return `${card.name} 消耗${healthCost}点生命值，对${isPlayer ? "电脑" : "玩家"}造成${damage}点伤害`;
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
        
        // 支持新的配置字段
        this.damage = null;     // 伤害值
        this.heal = null;       // 治疗值
        this.armor = null;      // 护甲值
        this.buff = null;       // buff配置
        this.baseDamage = null; // 基础伤害（用于消耗能量类技能）
        this.healthCost = null; // 生命消耗
        this.requiresStealth = false; // 是否需要潜行状态
        
        // 初始化效果策略
        this.effectStrategy = this.createEffectStrategy();
    }

    /**
     * 从配置对象创建卡牌
     * @param {Object} config - 卡牌配置对象
     * @returns {Card} 卡牌实例
     */
    static fromConfig(config) {
        const card = new Card(
            config.name,
            config.class,
            config.energyCost,
            config.castTime || 0,
            config.castType || "瞬发",
            config.effect,
            config.effectCode || "",
            config.value1 || 0,
            config.value2 || 0,
            config.value3 || 0
        );
        
        // 设置新的配置字段
        if (config.damage !== undefined) card.damage = config.damage;
        if (config.heal !== undefined) card.heal = config.heal;
        if (config.armor !== undefined) card.armor = config.armor;
        if (config.buff !== undefined) card.buff = config.buff;
        if (config.baseDamage !== undefined) card.baseDamage = config.baseDamage;
        if (config.healthCost !== undefined) card.healthCost = config.healthCost;
        if (config.requiresStealth !== undefined) card.requiresStealth = config.requiresStealth;
        
        return card;
    }

    /**
     * 创建效果策略
     */
    createEffectStrategy() {
        const effectCode = this.effectCode || this.name;
        
        const strategyMap = {
            // 基础效果
            'DAMAGE': new DamageEffectStrategy(),
            'HEAL': new HealEffectStrategy(),
            'HEAL_ALL': new HealEffectStrategy(),
            
            // 复合效果
            'DAMAGE_WITH_ARMOR': new DamageArmorEffectStrategy(),
            'DAMAGE_WITH_BUFF': new DamageWithBuffEffectStrategy(),
            'DAMAGE_ALL_WITH_BUFF': new DamageAllWithBuffEffectStrategy(),
            
            // 特殊效果
            'CONSUME_ALL_ENERGY': new ConsumeAllEnergyEffectStrategy(),
            'STEALTH': new StealthEffectStrategy(),
            'DRAW_3_DISCARD_1': new DrawDiscardEffectStrategy(),
            'DISPEL': new DispelEffectStrategy(),
            'BLOOD_SACRIFICE': new BloodSacrificeEffectStrategy(),
            
            // 兼容旧版本的effectCode
            'DAMAGE_6': new DamageEffectStrategy(),
            'DAMAGE_8': new DamageEffectStrategy(),
            'DAMAGE_9': new DamageEffectStrategy(),
            'HEAL_6': new HealEffectStrategy(),
            'DAMAGE_6_POISON': new DamagePoisonEffectStrategy(),
            'DAMAGE_3_SLOW': new DamageSlowEffectStrategy(),
            'DAMAGE_4_ARMOR': new DamageArmorEffectStrategy(),
            'DAMAGE_4_ALL_SLOW': new DamageSlowEffectStrategy(),
            'DAMAGE_15': new AmbushEffectStrategy()
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