/**
 * 配置验证工具 - 验证配置文件的正确性
 */
class ConfigValidator {
    /**
     * 验证所有配置文件
     * @returns {object} 验证结果
     */
    static validateAllConfigs() {
        const results = {
            heroSkills: this.validateHeroSkills(),
            characterClasses: this.validateCharacterClasses(),
            gameConfig: this.validateGameConfig(),
            cards: this.validateCards(),
            overall: true
        };

        // 检查整体结果
        results.overall = results.heroSkills.valid && 
                         results.characterClasses.valid && 
                         results.gameConfig.valid && 
                         results.cards.valid;

        return results;
    }

    /**
     * 验证英雄技能配置
     * @returns {object} 验证结果
     */
    static validateHeroSkills() {
        const configs = ConfigManager.getAllHeroSkillConfigs();
        const errors = [];
        const warnings = [];

        // 检查是否有配置
        if (configs.length === 0) {
            errors.push('没有找到英雄技能配置');
            return { valid: false, errors, warnings };
        }

        // 检查每个技能配置
        for (const config of configs) {
            // 必需字段检查
            if (!config.class) errors.push(`技能缺少职业字段: ${config.name || '未知'}`);
            if (!config.name) errors.push(`技能缺少名称字段: ${config.class || '未知'}`);
            if (!config.description) errors.push(`技能缺少描述字段: ${config.name || '未知'}`);
            
            // 数值字段检查
            if (typeof config.cooldown !== 'number' || config.cooldown < 0) {
                errors.push(`技能冷却时间无效: ${config.name} (${config.cooldown})`);
            }
            if (typeof config.energyCost !== 'number' || config.energyCost < 0) {
                errors.push(`技能能量消耗无效: ${config.name} (${config.energyCost})`);
            }
            if (typeof config.duration !== 'number' || config.duration < 0) {
                errors.push(`技能持续时间无效: ${config.name} (${config.duration})`);
            }

            // 效果类型检查
            const validEffectTypes = ['STRENGTH_BOOST', 'ENERGY_RESTORE_SPELL_BOOST', 'STEALTH', 'ARMOR_BOOST'];
            if (!validEffectTypes.includes(config.effectType)) {
                errors.push(`无效的效果类型: ${config.name} (${config.effectType})`);
            }

            // 数值参数检查
            if (typeof config.value1 !== 'number') {
                errors.push(`技能数值参数1无效: ${config.name} (${config.value1})`);
            }
            if (typeof config.value2 !== 'number') {
                errors.push(`技能数值参数2无效: ${config.name} (${config.value2})`);
            }
            if (typeof config.value3 !== 'number') {
                errors.push(`技能数值参数3无效: ${config.name} (${config.value3})`);
            }

            // 警告检查
            if (config.cooldown > 60) {
                warnings.push(`技能冷却时间过长: ${config.name} (${config.cooldown}秒)`);
            }
            if (config.energyCost > 10) {
                warnings.push(`技能能量消耗过高: ${config.name} (${config.energyCost})`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            count: configs.length
        };
    }

    /**
     * 验证角色职业配置
     * @returns {object} 验证结果
     */
    static validateCharacterClasses() {
        const configs = ConfigManager.getAllCharacterClassConfigs();
        const errors = [];
        const warnings = [];

        // 检查是否有配置
        if (configs.length === 0) {
            errors.push('没有找到角色职业配置');
            return { valid: false, errors, warnings };
        }

        // 检查每个职业配置
        for (const config of configs) {
            // 必需字段检查
            if (!config.class) errors.push(`职业缺少名称字段`);
            if (!config.description) errors.push(`职业缺少描述字段: ${config.class || '未知'}`);
            
            // 数值字段检查
            if (typeof config.maxHealth !== 'number' || config.maxHealth <= 0) {
                errors.push(`最大生命值无效: ${config.class} (${config.maxHealth})`);
            }
            if (typeof config.maxEnergy !== 'number' || config.maxEnergy <= 0) {
                errors.push(`最大能量值无效: ${config.class} (${config.maxEnergy})`);
            }
            if (typeof config.initialEnergy !== 'number' || config.initialEnergy < 0) {
                errors.push(`初始能量值无效: ${config.class} (${config.initialEnergy})`);
            }
            if (typeof config.strength !== 'number') {
                errors.push(`强度属性无效: ${config.class} (${config.strength})`);
            }
            if (typeof config.agility !== 'number') {
                errors.push(`敏捷属性无效: ${config.class} (${config.agility})`);
            }
            if (typeof config.spirit !== 'number') {
                errors.push(`精神属性无效: ${config.class} (${config.spirit})`);
            }
            if (typeof config.healthRegenRate !== 'number' || config.healthRegenRate < 0) {
                errors.push(`生命恢复速度无效: ${config.class} (${config.healthRegenRate})`);
            }
            if (typeof config.energyRegenRate !== 'number' || config.energyRegenRate <= 0) {
                errors.push(`能量恢复速度无效: ${config.class} (${config.energyRegenRate})`);
            }

            // 逻辑检查
            if (config.initialEnergy > config.maxEnergy) {
                errors.push(`初始能量值超过最大能量值: ${config.class}`);
            }

            // 警告检查
            if (config.maxHealth > 100) {
                warnings.push(`最大生命值过高: ${config.class} (${config.maxHealth})`);
            }
            if (config.maxEnergy > 20) {
                warnings.push(`最大能量值过高: ${config.class} (${config.maxEnergy})`);
            }
            if (config.healthRegenRate > 5) {
                warnings.push(`生命恢复速度过高: ${config.class} (${config.healthRegenRate})`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            count: configs.length
        };
    }

    /**
     * 验证游戏配置
     * @returns {object} 验证结果
     */
    static validateGameConfig() {
        const configs = ConfigManager.getAllGameConfigs();
        const errors = [];
        const warnings = [];

        // 检查是否有配置
        if (configs.size === 0) {
            errors.push('没有找到游戏配置');
            return { valid: false, errors, warnings };
        }

        // 必需配置项检查
        const requiredConfigs = ['InitialHandSize', 'MaxHandSize', 'DrawInterval', 'MaxDeckSize', 'EnergyPerTurn', 'MaxEnergy'];
        for (const required of requiredConfigs) {
            if (!configs.has(required)) {
                errors.push(`缺少必需的游戏配置: ${required}`);
            }
        }

        // 数值检查
        const initialHandSize = configs.get('InitialHandSize');
        if (typeof initialHandSize !== 'number' || initialHandSize <= 0) {
            errors.push(`初始手牌数量无效: ${initialHandSize}`);
        }

        const maxHandSize = configs.get('MaxHandSize');
        if (typeof maxHandSize !== 'number' || maxHandSize <= 0) {
            errors.push(`最大手牌数量无效: ${maxHandSize}`);
        }

        const drawInterval = configs.get('DrawInterval');
        if (typeof drawInterval !== 'number' || drawInterval <= 0) {
            errors.push(`抽卡间隔无效: ${drawInterval}`);
        }

        const maxDeckSize = configs.get('MaxDeckSize');
        if (typeof maxDeckSize !== 'number' || maxDeckSize <= 0) {
            errors.push(`牌组最大数量无效: ${maxDeckSize}`);
        }

        const energyPerTurn = configs.get('EnergyPerTurn');
        if (typeof energyPerTurn !== 'number' || energyPerTurn <= 0) {
            errors.push(`每秒能量恢复无效: ${energyPerTurn}`);
        }

        const maxEnergy = configs.get('MaxEnergy');
        if (typeof maxEnergy !== 'number' || maxEnergy <= 0) {
            errors.push(`最大能量值无效: ${maxEnergy}`);
        }

        // 逻辑检查
        if (initialHandSize > maxHandSize) {
            errors.push(`初始手牌数量超过最大手牌数量`);
        }

        // 警告检查
        if (initialHandSize > 10) {
            warnings.push(`初始手牌数量过多: ${initialHandSize}`);
        }
        if (maxHandSize > 20) {
            warnings.push(`最大手牌数量过多: ${maxHandSize}`);
        }
        if (drawInterval > 10) {
            warnings.push(`抽卡间隔过长: ${drawInterval}秒`);
        }
        if (maxDeckSize > 100) {
            warnings.push(`牌组最大数量过多: ${maxDeckSize}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            count: configs.size
        };
    }

    /**
     * 验证卡牌配置
     * @returns {object} 验证结果
     */
    static validateCards() {
        const configs = ConfigManager.configs.cards;
        const errors = [];
        const warnings = [];

        // 检查是否有配置
        if (configs.length === 0) {
            errors.push('没有找到卡牌配置');
            return { valid: false, errors, warnings };
        }

        // 检查每张卡牌配置
        for (const config of configs) {
            // 必需字段检查
            if (!config.name) errors.push(`卡牌缺少名称字段`);
            if (!config.class) errors.push(`卡牌缺少职业字段: ${config.name || '未知'}`);
            if (!config.effect) errors.push(`卡牌缺少效果字段: ${config.name || '未知'}`);
            if (!config.effectCode) errors.push(`卡牌缺少效果代码字段: ${config.name || '未知'}`);
            
            // 数值字段检查
            if (typeof config.energyCost !== 'number' || config.energyCost < 0) {
                errors.push(`能量消耗无效: ${config.name} (${config.energyCost})`);
            }
            if (typeof config.castTime !== 'number' || config.castTime < 0) {
                errors.push(`吟唱时间无效: ${config.name} (${config.castTime})`);
            }
            if (typeof config.value1 !== 'number') {
                errors.push(`数值参数1无效: ${config.name} (${config.value1})`);
            }
            if (typeof config.value2 !== 'number') {
                errors.push(`数值参数2无效: ${config.name} (${config.value2})`);
            }
            if (typeof config.value3 !== 'number') {
                errors.push(`数值参数3无效: ${config.name} (${config.value3})`);
            }

            // 职业检查
            const validClasses = ['战士', '法师', '盗贼', '牧师'];
            if (!validClasses.includes(config.class)) {
                errors.push(`无效的职业: ${config.name} (${config.class})`);
            }

            // 施法类型检查
            const validCastTypes = ['瞬发', '吟唱'];
            if (!validCastTypes.includes(config.castType)) {
                errors.push(`无效的施法类型: ${config.name} (${config.castType})`);
            }

            // 警告检查
            if (config.energyCost > 10) {
                warnings.push(`能量消耗过高: ${config.name} (${config.energyCost})`);
            }
            if (config.castTime > 5) {
                warnings.push(`吟唱时间过长: ${config.name} (${config.castTime}秒)`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            count: configs.length
        };
    }

    /**
     * 生成验证报告
     * @returns {string} 验证报告
     */
    static generateValidationReport() {
        const results = this.validateAllConfigs();
        let report = '=== 配置验证报告 ===\n\n';

        // 整体结果
        report += `整体验证结果: ${results.overall ? '✅ 通过' : '❌ 失败'}\n\n`;

        // 英雄技能验证
        report += `英雄技能配置 (${results.heroSkills.count}个): ${results.heroSkills.valid ? '✅' : '❌'}\n`;
        if (results.heroSkills.errors.length > 0) {
            report += '错误:\n';
            results.heroSkills.errors.forEach(error => report += `  - ${error}\n`);
        }
        if (results.heroSkills.warnings.length > 0) {
            report += '警告:\n';
            results.heroSkills.warnings.forEach(warning => report += `  - ${warning}\n`);
        }
        report += '\n';

        // 角色职业验证
        report += `角色职业配置 (${results.characterClasses.count}个): ${results.characterClasses.valid ? '✅' : '❌'}\n`;
        if (results.characterClasses.errors.length > 0) {
            report += '错误:\n';
            results.characterClasses.errors.forEach(error => report += `  - ${error}\n`);
        }
        if (results.characterClasses.warnings.length > 0) {
            report += '警告:\n';
            results.characterClasses.warnings.forEach(warning => report += `  - ${warning}\n`);
        }
        report += '\n';

        // 游戏配置验证
        report += `游戏配置 (${results.gameConfig.count}项): ${results.gameConfig.valid ? '✅' : '❌'}\n`;
        if (results.gameConfig.errors.length > 0) {
            report += '错误:\n';
            results.gameConfig.errors.forEach(error => report += `  - ${error}\n`);
        }
        if (results.gameConfig.warnings.length > 0) {
            report += '警告:\n';
            results.gameConfig.warnings.forEach(warning => report += `  - ${warning}\n`);
        }
        report += '\n';

        // 卡牌配置验证
        report += `卡牌配置 (${results.cards.count}张): ${results.cards.valid ? '✅' : '❌'}\n`;
        if (results.cards.errors.length > 0) {
            report += '错误:\n';
            results.cards.errors.forEach(error => report += `  - ${error}\n`);
        }
        if (results.cards.warnings.length > 0) {
            report += '警告:\n';
            results.cards.warnings.forEach(warning => report += `  - ${warning}\n`);
        }

        return report;
    }

    /**
     * 在控制台输出验证报告
     */
    static logValidationReport() {
        console.log(this.generateValidationReport());
    }
} 