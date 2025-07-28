/**
 * 角色属性系统 - 实现readme1.txt中要求的角色属性
 */
class Character {
    constructor(name, characterClass) {
        this.name = name;
        this.characterClass = characterClass;
        
        // 基础属性
        this.maxHealth = 30;
        this.currentHealth = 30;
        this.healthPercentage = 100; // 可超过100%
        this.healthRegenRate = 0; // 每秒生命恢复速度
        
        this.maxEnergy = 10;
        this.currentEnergy = 1; // 初始1点能量
        this.energyPercentage = 100; // 可超过100%
        this.energyRegenRate = 1; // 每秒能量恢复速度
        
        // 战斗属性
        this.strength = 0; // 强度，提升单次攻击伤害（可为负数）
        this.agility = 0;  // 敏捷，提升抽卡速度
        this.spirit = 0;   // 精神，提升吟唱速度
        
        // 扩展属性（通过buff实现）
        this.energyCostReduction = 0; // 能量消耗降低
        this.extraDrawChance = 0;     // 额外抽卡概率
        
        // 状态效果
        this.statusEffects = [];
        
        // 时间相关
        this.lastHealthRegen = 0;
        this.lastEnergyRegen = 0;
        this.lastDrawTime = 0;
        
        // 根据职业设置基础属性
        this.initializeClassStats();
    }
    
    /**
     * 根据职业初始化基础属性
     */
    initializeClassStats() {
        switch (this.characterClass) {
            case '战士':
                this.maxHealth = 35;
                this.currentHealth = 35;
                this.strength = 2;
                this.agility = 1;
                this.spirit = 0;
                break;
            case '法师':
                this.maxHealth = 25;
                this.currentHealth = 25;
                this.maxEnergy = 12;
                this.currentEnergy = 2;
                this.strength = 0;
                this.agility = 0;
                this.spirit = 3;
                break;
            case '盗贼':
                this.maxHealth = 28;
                this.currentHealth = 28;
                this.strength = 1;
                this.agility = 3;
                this.spirit = 0;
                break;
            case '牧师':
                this.maxHealth = 32;
                this.currentHealth = 32;
                this.strength = 0;
                this.agility = 1;
                this.spirit = 2;
                this.healthRegenRate = 0.5; // 牧师有生命恢复
                break;
        }
    }
    
    /**
     * 更新角色状态（每帧调用）
     * @param {number} deltaTime - 时间间隔（秒）
     */
    update(deltaTime) {
        this.updateHealthRegeneration(deltaTime);
        this.updateEnergyRegeneration(deltaTime);
        this.updateStatusEffects(deltaTime);
    }
    
    /**
     * 更新生命恢复
     */
    updateHealthRegeneration(deltaTime) {
        if (this.healthRegenRate > 0 && this.currentHealth < this.maxHealth) {
            this.lastHealthRegen += deltaTime;
            if (this.lastHealthRegen >= 1.0) { // 每秒恢复一次
                this.heal(this.healthRegenRate);
                this.lastHealthRegen = 0;
            }
        }
    }
    
    /**
     * 更新能量恢复
     */
    updateEnergyRegeneration(deltaTime) {
        if (this.energyRegenRate > 0 && this.currentEnergy < this.maxEnergy) {
            this.lastEnergyRegen += deltaTime;
            if (this.lastEnergyRegen >= 1.0) { // 每秒恢复一次
                this.gainEnergy(this.energyRegenRate);
                this.lastEnergyRegen = 0;
            }
        }
    }
    
    /**
     * 更新状态效果
     */
    updateStatusEffects(deltaTime) {
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration -= deltaTime;
            if (effect.duration <= 0) {
                effect.onExpire(this);
                return false;
            }
            effect.onTick(this);
            return true;
        });
    }
    
    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     * @returns {number} 实际伤害
     */
    takeDamage(damage) {
        // 计算护甲减免
        let actualDamage = Math.max(0, damage);
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return actualDamage;
    }
    
    /**
     * 治疗
     * @param {number} healAmount - 治疗量
     */
    heal(healAmount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + healAmount);
    }
    
    /**
     * 消耗能量
     * @param {number} cost - 消耗量
     * @returns {boolean} 是否成功消耗
     */
    consumeEnergy(cost) {
        const actualCost = Math.max(0, cost - this.energyCostReduction);
        if (this.currentEnergy >= actualCost) {
            this.currentEnergy -= actualCost;
            return true;
        }
        return false;
    }
    
    /**
     * 获得能量
     * @param {number} amount - 获得量
     */
    gainEnergy(amount) {
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
    }
    
    /**
     * 添加状态效果
     * @param {StatusEffect} effect - 状态效果
     */
    addStatusEffect(effect) {
        this.statusEffects.push(effect);
    }
    
    /**
     * 移除状态效果
     * @param {string} effectType - 效果类型
     */
    removeStatusEffect(effectType) {
        this.statusEffects = this.statusEffects.filter(effect => effect.type !== effectType);
    }
    
    /**
     * 获取状态效果
     * @param {string} effectType - 效果类型
     * @returns {StatusEffect|null} 状态效果
     */
    getStatusEffect(effectType) {
        return this.statusEffects.find(effect => effect.type === effectType);
    }
    
    /**
     * 计算实际伤害（考虑强度属性）
     * @param {number} baseDamage - 基础伤害
     * @returns {number} 实际伤害
     */
    calculateDamage(baseDamage) {
        return Math.max(0, baseDamage + this.strength);
    }
    
    /**
     * 计算抽卡间隔（考虑敏捷属性）
     * @param {number} baseInterval - 基础间隔
     * @returns {number} 实际间隔
     */
    calculateDrawInterval(baseInterval) {
        return Math.max(0.5, baseInterval - this.agility * 0.2);
    }
    
    /**
     * 计算吟唱时间（考虑精神属性）
     * @param {number} baseCastTime - 基础吟唱时间
     * @returns {number} 实际吟唱时间
     */
    calculateCastTime(baseCastTime) {
        return Math.max(0.1, baseCastTime - this.spirit * 0.1);
    }
    
    /**
     * 获取生命百分比
     * @returns {number} 生命百分比
     */
    getHealthPercentage() {
        return (this.currentHealth / this.maxHealth) * 100;
    }
    
    /**
     * 获取能量百分比
     * @returns {number} 能量百分比
     */
    getEnergyPercentage() {
        return (this.currentEnergy / this.maxEnergy) * 100;
    }
    
    /**
     * 检查是否死亡
     * @returns {boolean} 是否死亡
     */
    isDead() {
        return this.currentHealth <= 0;
    }
    
    /**
     * 获取角色信息
     * @returns {object} 角色信息
     */
    getInfo() {
        return {
            name: this.name,
            characterClass: this.characterClass,
            health: this.currentHealth,
            maxHealth: this.maxHealth,
            healthPercentage: this.getHealthPercentage(),
            energy: this.currentEnergy,
            maxEnergy: this.maxEnergy,
            energyPercentage: this.getEnergyPercentage(),
            strength: this.strength,
            agility: this.agility,
            spirit: this.spirit,
            statusEffects: this.statusEffects.map(effect => effect.getInfo())
        };
    }
}

/**
 * 状态效果基类
 */
class StatusEffect {
    constructor(type, duration, description) {
        this.type = type;
        this.duration = duration;
        this.description = description;
        this.originalDuration = duration;
    }
    
    /**
     * 效果生效时调用
     * @param {Character} character - 角色
     */
    onApply(character) {
        // 子类重写
    }
    
    /**
     * 效果持续时调用
     * @param {Character} character - 角色
     */
    onTick(character) {
        // 子类重写
    }
    
    /**
     * 效果结束时调用
     * @param {Character} character - 角色
     */
    onExpire(character) {
        // 子类重写
    }
    
    /**
     * 获取效果信息
     * @returns {object} 效果信息
     */
    getInfo() {
        return {
            type: this.type,
            duration: this.duration,
            description: this.description,
            percentage: (this.duration / this.originalDuration) * 100
        };
    }
}

/**
 * 中毒效果
 */
class PoisonEffect extends StatusEffect {
    constructor(damage, duration) {
        super('poison', duration, `中毒，每秒受到${damage}点伤害`);
        this.damage = damage;
        this.lastTick = 0;
    }
    
    onApply(character) {
        // 中毒效果应用时的逻辑
    }
    
    onTick(character) {
        this.lastTick += 1/60; // 假设60FPS
        if (this.lastTick >= 1.0) { // 每秒造成伤害
            character.takeDamage(this.damage);
            this.lastTick = 0;
        }
    }
    
    onExpire(character) {
        // 中毒效果结束时的逻辑
    }
}

/**
 * 减速效果
 */
class SlowEffect extends StatusEffect {
    constructor(slowAmount, duration) {
        super('slow', duration, `减速${slowAmount}点，持续${duration}秒`);
        this.slowAmount = slowAmount;
    }
    
    onApply(character) {
        character.agility -= this.slowAmount;
    }
    
    onExpire(character) {
        character.agility += this.slowAmount;
    }
}

/**
 * 潜行效果
 */
class StealthEffect extends StatusEffect {
    constructor(duration) {
        super('stealth', duration, `潜行状态，持续${duration}秒`);
    }
    
    onApply(character) {
        // 潜行效果应用时的逻辑
    }
    
    onExpire(character) {
        // 潜行效果结束时的逻辑
    }
} 