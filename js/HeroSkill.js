/**
 * 英雄技能系统 - 实现readme1.txt中要求的英雄技能功能
 */

/**
 * 英雄技能基类
 */
class HeroSkill {
    constructor(name, description, cooldown, energyCost = 0) {
        this.name = name;
        this.description = description;
        this.cooldown = cooldown; // 冷却时间（秒）
        this.energyCost = energyCost; // 能量消耗
        this.currentCooldown = 0; // 当前冷却时间
        this.lastUsedTime = 0; // 上次使用时间
    }

    /**
     * 检查技能是否可用
     * @param {Character} character - 角色
     * @returns {boolean} 是否可用
     */
    canUse(character) {
        return this.currentCooldown <= 0 && character.currentEnergy >= this.energyCost;
    }

    /**
     * 使用技能
     * @param {Character} character - 角色
     * @param {GameState} gameState - 游戏状态
     * @returns {object} 使用结果
     */
    use(character, gameState) {
        if (!this.canUse(character)) {
            return {
                success: false,
                message: "技能不可用"
            };
        }

        // 消耗能量
        if (this.energyCost > 0) {
            character.consumeEnergy(this.energyCost);
        }

        // 设置冷却时间
        this.currentCooldown = this.cooldown;
        this.lastUsedTime = Date.now();

        // 执行技能效果
        return this.execute(character, gameState);
    }

    /**
     * 执行技能效果（子类重写）
     * @param {Character} character - 角色
     * @param {GameState} gameState - 游戏状态
     * @returns {object} 执行结果
     */
    execute(character, gameState) {
        return {
            success: true,
            message: `${character.name} 使用了 ${this.name}`,
            effectResult: "技能效果"
        };
    }

    /**
     * 更新冷却时间
     * @param {number} deltaTime - 时间间隔
     */
    update(deltaTime) {
        if (this.currentCooldown > 0) {
            this.currentCooldown = Math.max(0, this.currentCooldown - deltaTime);
        }
    }

    /**
     * 获取技能信息
     * @returns {object} 技能信息
     */
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            cooldown: this.cooldown,
            currentCooldown: this.currentCooldown,
            energyCost: this.energyCost,
            canUse: this.currentCooldown <= 0
        };
    }
}

/**
 * 战士英雄技能 - 狂暴
 */
class BerserkerRage extends HeroSkill {
    constructor() {
        super("狂暴", "增加5点强度，持续10秒", 15, 2);
    }

    execute(character, gameState) {
        // 增加强度
        character.strength += 5;
        
        // 10秒后恢复
        setTimeout(() => {
            character.strength = Math.max(0, character.strength - 5);
        }, 10000);

        return {
            success: true,
            message: `${character.name} 使用了 狂暴`,
            effectResult: "强度+5，持续10秒"
        };
    }
}

/**
 * 法师英雄技能 - 奥术强化
 */
class ArcaneEmpowerment extends HeroSkill {
    constructor() {
        super("奥术强化", "恢复3点能量，下次法术伤害翻倍", 20, 0);
    }

    execute(character, gameState) {
        // 恢复能量
        character.gainEnergy(3);
        
        // 设置下次法术伤害翻倍标记
        character.nextSpellDoubleDamage = true;

        return {
            success: true,
            message: `${character.name} 使用了 奥术强化`,
            effectResult: "恢复3点能量，下次法术伤害翻倍"
        };
    }
}

/**
 * 盗贼英雄技能 - 暗影步
 */
class Shadowstep extends HeroSkill {
    constructor() {
        super("暗影步", "立即进入潜行状态，持续8秒", 12, 1);
    }

    execute(character, gameState) {
        // 进入潜行状态
        character.stealthSystem.enterStealth(8);

        return {
            success: true,
            message: `${character.name} 使用了 暗影步`,
            effectResult: "进入潜行状态，持续8秒"
        };
    }
}

/**
 * 牧师英雄技能 - 神圣护盾
 */
class DivineShield extends HeroSkill {
    constructor() {
        super("神圣护盾", "获得10点护甲，持续15秒", 18, 1);
    }

    execute(character, gameState) {
        const isPlayer = character.name === "玩家";
        
        // 获得护甲
        if (isPlayer) {
            gameState.playerArmor += 10;
        } else {
            gameState.computerArmor += 10;
        }
        
        // 15秒后移除护甲
        setTimeout(() => {
            if (isPlayer) {
                gameState.playerArmor = Math.max(0, gameState.playerArmor - 10);
            } else {
                gameState.computerArmor = Math.max(0, gameState.computerArmor - 10);
            }
        }, 15000);

        return {
            success: true,
            message: `${character.name} 使用了 神圣护盾`,
            effectResult: "获得10点护甲，持续15秒"
        };
    }
}

/**
 * 英雄技能管理器
 */
class HeroSkillManager {
    constructor() {
        this.skills = new Map();
        this.initializeSkills();
    }

    /**
     * 初始化技能
     */
    initializeSkills() {
        this.skills.set('战士', new BerserkerRage());
        this.skills.set('法师', new ArcaneEmpowerment());
        this.skills.set('盗贼', new Shadowstep());
        this.skills.set('牧师', new DivineShield());
    }

    /**
     * 获取角色的英雄技能
     * @param {string} characterClass - 角色职业
     * @returns {HeroSkill|null} 英雄技能
     */
    getSkill(characterClass) {
        return this.skills.get(characterClass) || null;
    }

    /**
     * 更新所有技能
     * @param {number} deltaTime - 时间间隔
     */
    update(deltaTime) {
        for (let skill of this.skills.values()) {
            skill.update(deltaTime);
        }
    }
} 