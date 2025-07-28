/**
 * 英雄技能系统 - 实现readme1.txt中要求的英雄技能功能
 */

/**
 * 英雄技能基类
 */
class HeroSkill {
    constructor(name, description, cooldown, energyCost = 0, effectType = '', value1 = 0, value2 = 0, value3 = 0, duration = 0) {
        this.name = name;
        this.description = description;
        this.cooldown = cooldown; // 冷却时间（秒）
        this.energyCost = energyCost; // 能量消耗
        this.currentCooldown = 0; // 当前冷却时间
        this.lastUsedTime = 0; // 上次使用时间
        this.effectType = effectType; // 效果类型
        this.value1 = value1; // 效果值1
        this.value2 = value2; // 效果值2
        this.value3 = value3; // 效果值3
        this.duration = duration; // 持续时间
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
        // 根据效果类型执行不同的技能效果
        switch (this.effectType) {
            case 'STRENGTH_BOOST':
                return this.executeStrengthBoost(character, gameState);
            case 'ENERGY_RESTORE_SPELL_BOOST':
                return this.executeEnergyRestoreSpellBoost(character, gameState);
            case 'STEALTH':
                return this.executeStealth(character, gameState);
            case 'ARMOR_BOOST':
                return this.executeArmorBoost(character, gameState);
            default:
                return {
                    success: true,
                    message: `${character.name} 使用了 ${this.name}`,
                    effectResult: "技能效果"
                };
        }
    }

    /**
     * 执行强度提升效果
     */
    executeStrengthBoost(character, gameState) {
        // 增加强度
        character.strength += this.value1;
        
        // 持续时间后恢复
        if (this.duration > 0) {
            setTimeout(() => {
                character.strength = Math.max(0, character.strength - this.value1);
            }, this.duration * 1000);
        }

        return {
            success: true,
            message: `${character.name} 使用了 ${this.name}`,
            effectResult: `强度+${this.value1}，持续${this.duration}秒`
        };
    }

    /**
     * 执行能量恢复和法术强化效果
     */
    executeEnergyRestoreSpellBoost(character, gameState) {
        // 恢复能量
        if (this.value1 > 0) {
            character.gainEnergy(this.value1);
        }
        
        // 设置下次法术伤害翻倍标记
        character.nextSpellDoubleDamage = true;

        return {
            success: true,
            message: `${character.name} 使用了 ${this.name}`,
            effectResult: `恢复${this.value1}点能量，下次法术伤害翻倍`
        };
    }

    /**
     * 执行潜行效果
     */
    executeStealth(character, gameState) {
        // 进入潜行状态
        character.stealthSystem.enterStealth(this.duration);

        return {
            success: true,
            message: `${character.name} 使用了 ${this.name}`,
            effectResult: `进入潜行状态，持续${this.duration}秒`
        };
    }

    /**
     * 执行护甲提升效果
     */
    executeArmorBoost(character, gameState) {
        const isPlayer = character.name === "玩家";
        
        // 获得护甲
        if (isPlayer) {
            gameState.playerArmor += this.value1;
        } else {
            gameState.computerArmor += this.value1;
        }
        
        // 持续时间后移除护甲
        if (this.duration > 0) {
            setTimeout(() => {
                if (isPlayer) {
                    gameState.playerArmor = Math.max(0, gameState.playerArmor - this.value1);
                } else {
                    gameState.computerArmor = Math.max(0, gameState.computerArmor - this.value1);
                }
            }, this.duration * 1000);
        }

        return {
            success: true,
            message: `${character.name} 使用了 ${this.name}`,
            effectResult: `获得${this.value1}点护甲，持续${this.duration}秒`
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
 * 通用英雄技能类 - 基于配置创建
 */
class ConfigurableHeroSkill extends HeroSkill {
    constructor(config) {
        super(
            config.name,
            config.description,
            config.cooldown,
            config.energyCost,
            config.effectType,
            config.value1,
            config.value2,
            config.value3,
            config.duration
        );
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
        // 从配置管理器获取技能配置
        if (ConfigManager && ConfigManager.isConfigLoaded()) {
            const skillConfigs = ConfigManager.getAllHeroSkillConfigs();
            for (const config of skillConfigs) {
                this.skills.set(config.class, new ConfigurableHeroSkill(config));
            }
        } else {
            // 如果配置未加载，使用默认配置
            this.initializeDefaultSkills();
        }
    }

    /**
     * 初始化默认技能（后备方案）
     */
    initializeDefaultSkills() {
        const defaultConfigs = [
            {
                class: '战士',
                name: '狂暴',
                description: '增加5点强度，持续10秒',
                cooldown: 15,
                energyCost: 2,
                effectType: 'STRENGTH_BOOST',
                value1: 5,
                value2: 0,
                value3: 0,
                duration: 10
            },
            {
                class: '法师',
                name: '奥术强化',
                description: '恢复3点能量，下次法术伤害翻倍',
                cooldown: 20,
                energyCost: 0,
                effectType: 'ENERGY_RESTORE_SPELL_BOOST',
                value1: 3,
                value2: 0,
                value3: 0,
                duration: 0
            },
            {
                class: '盗贼',
                name: '暗影步',
                description: '立即进入潜行状态，持续8秒',
                cooldown: 12,
                energyCost: 1,
                effectType: 'STEALTH',
                value1: 0,
                value2: 0,
                value3: 0,
                duration: 8
            },
            {
                class: '牧师',
                name: '神圣护盾',
                description: '获得10点护甲，持续15秒',
                cooldown: 18,
                energyCost: 1,
                effectType: 'ARMOR_BOOST',
                value1: 10,
                value2: 0,
                value3: 0,
                duration: 15
            }
        ];

        for (const config of defaultConfigs) {
            this.skills.set(config.class, new ConfigurableHeroSkill(config));
        }
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