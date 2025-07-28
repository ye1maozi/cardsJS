/**
 * 吟唱系统 - 实现readme1.txt中要求的吟唱机制
 */
class CastingSystem {
    constructor() {
        this.isCasting = false;
        this.castTime = 0;
        this.castProgress = 0;
        this.castTarget = null;
        this.castCard = null;
        this.castStartTime = 0;
        this.castInterrupted = false;
    }
    
    /**
     * 开始吟唱
     * @param {Card} card - 要吟唱的卡牌
     * @param {Character} caster - 施法者
     * @param {Character} target - 目标
     * @returns {boolean} 是否成功开始吟唱
     */
    startCasting(card, caster, target) {
        if (this.isCasting) {
            return false; // 已经在吟唱中
        }
        
        // 计算实际吟唱时间（考虑精神属性）
        const actualCastTime = caster.calculateCastTime(card.castTime);
        
        this.isCasting = true;
        this.castTime = actualCastTime;
        this.castProgress = 0;
        this.castTarget = target;
        this.castCard = card;
        this.caster = caster; // 保存施法者信息
        this.castStartTime = Date.now();
        this.castInterrupted = false;
        
        console.log(`${caster.name} 开始吟唱 ${card.name}，吟唱时间: ${actualCastTime}秒`);
        return true;
    }
    
    /**
     * 更新吟唱进度
     * @param {number} deltaTime - 时间间隔（秒）
     * @returns {boolean} 吟唱是否完成
     */
    updateCasting(deltaTime) {
        if (!this.isCasting || this.castInterrupted) {
            return false;
        }
        
        this.castProgress += deltaTime;
        
        // 检查吟唱是否完成
        if (this.castProgress >= this.castTime) {
            this.completeCasting();
            return true;
        }
        
        return false;
    }
    
    /**
     * 完成吟唱
     */
    completeCasting() {
        if (!this.isCasting || this.castInterrupted) {
            return;
        }
        
        console.log(`吟唱完成: ${this.castCard.name}`);
        
        // 执行卡牌效果
        if (this.castCard && this.caster) {
            // 从施法者获取游戏状态和玩家标识
            const gameState = this.caster.gameState;
            if (!gameState) {
                console.error('无法获取游戏状态，吟唱效果无法执行');
                this.resetCasting();
                return;
            }
            
            const isPlayer = (this.caster === gameState.playerCharacter);
            console.log(`执行吟唱效果: ${this.castCard.name}, 施法者: ${this.caster.name}, 是否玩家: ${isPlayer}`);
            
            const effectResult = this.castCard.executeEffect(gameState, isPlayer);
            console.log(`吟唱效果执行: ${this.castCard.name} -> ${effectResult}`);
        }
        
        this.resetCasting();
    }
    
    /**
     * 中断吟唱
     * @param {string} reason - 中断原因
     */
    interruptCasting(reason = "吟唱被中断") {
        if (!this.isCasting) {
            return;
        }
        
        console.log(`吟唱中断: ${reason}`);
        this.castInterrupted = true;
        this.resetCasting();
    }
    
    /**
     * 重置吟唱状态
     */
    resetCasting() {
        this.isCasting = false;
        this.castTime = 0;
        this.castProgress = 0;
        this.castTarget = null;
        this.castCard = null;
        this.caster = null;
        this.castStartTime = 0;
        this.castInterrupted = false;
    }
    
    /**
     * 获取吟唱进度百分比
     * @returns {number} 进度百分比 (0-100)
     */
    getCastProgress() {
        if (!this.isCasting || this.castTime === 0) {
            return 0;
        }
        return (this.castProgress / this.castTime) * 100;
    }
    
    /**
     * 获取剩余吟唱时间
     * @returns {number} 剩余时间（秒）
     */
    getRemainingCastTime() {
        if (!this.isCasting) {
            return 0;
        }
        return Math.max(0, this.castTime - this.castProgress);
    }
    
    /**
     * 检查是否正在吟唱
     * @returns {boolean} 是否正在吟唱
     */
    isCurrentlyCasting() {
        return this.isCasting && !this.castInterrupted;
    }
    
    /**
     * 获取吟唱信息
     * @returns {object} 吟唱信息
     */
    getCastingInfo() {
        return {
            isCasting: this.isCasting,
            castTime: this.castTime,
            castProgress: this.castProgress,
            progressPercentage: this.getCastProgress(),
            remainingTime: this.getRemainingCastTime(),
            cardName: this.castCard ? this.castCard.name : null,
            targetName: this.castTarget ? this.castTarget.name : null,
            isInterrupted: this.castInterrupted
        };
    }
}

/**
 * 潜行系统 - 实现readme1.txt中要求的潜行机制
 */
class StealthSystem {
    constructor() {
        this.isStealthed = false;
        this.stealthDuration = 0;
        this.maxStealthDuration = 10;
        this.stealthStartTime = 0;
        this.stealthInterrupted = false;
    }
    
    /**
     * 进入潜行状态
     * @param {number} duration - 潜行持续时间
     * @returns {boolean} 是否成功进入潜行
     */
    enterStealth(duration) {
        if (this.isStealthed) {
            return false; // 已经在潜行中
        }
        
        this.isStealthed = true;
        this.stealthDuration = Math.min(duration, this.maxStealthDuration);
        this.stealthStartTime = Date.now();
        this.stealthInterrupted = false;
        
        console.log(`进入潜行状态，持续${this.stealthDuration}秒`);
        return true;
    }
    
    /**
     * 退出潜行状态
     * @param {string} reason - 退出原因
     */
    exitStealth(reason = "潜行结束") {
        if (!this.isStealthed) {
            return;
        }
        
        console.log(`退出潜行状态: ${reason}`);
        this.isStealthed = false;
        this.stealthDuration = 0;
        this.stealthStartTime = 0;
        this.stealthInterrupted = true;
    }
    
    /**
     * 更新潜行状态
     * @param {number} deltaTime - 时间间隔（秒）
     */
    updateStealth(deltaTime) {
        if (!this.isStealthed) {
            return;
        }
        
        this.stealthDuration -= deltaTime;
        
        if (this.stealthDuration <= 0) {
            this.exitStealth("潜行时间结束");
        }
    }
    
    /**
     * 受到伤害时退出潜行
     * @param {number} damage - 伤害值
     */
    onTakeDamage(damage) {
        if (this.isStealthed && damage > 0) {
            this.exitStealth("受到伤害");
        }
    }
    
    /**
     * 进行攻击时退出潜行
     */
    onAttack() {
        if (this.isStealthed) {
            this.exitStealth("进行攻击");
        }
    }
    
    /**
     * 检查是否处于潜行状态
     * @returns {boolean} 是否潜行
     */
    isCurrentlyStealthed() {
        return this.isStealthed && !this.stealthInterrupted;
    }
    
    /**
     * 获取潜行信息
     * @returns {object} 潜行信息
     */
    getStealthInfo() {
        return {
            isStealthed: this.isStealthed,
            duration: this.stealthDuration,
            maxDuration: this.maxStealthDuration,
            percentage: this.stealthDuration > 0 ? (this.stealthDuration / this.maxStealthDuration) * 100 : 0,
            isInterrupted: this.stealthInterrupted
        };
    }
} 