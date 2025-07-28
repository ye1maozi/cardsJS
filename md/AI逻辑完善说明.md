# AI逻辑完善说明

## 概述

本次对BotPlayer.js进行了全面的AI逻辑完善，增加了多个智能决策机制，使AI能够更智能地应对不同的游戏局势。

## 主要改进内容

### 1. 威胁评估系统

#### 功能描述
- 实时计算威胁等级（0-10分）
- 考虑玩家伤害潜力、血量对比、手牌数量等因素
- 动态调整AI策略

#### 实现细节
```javascript
updateThreatLevel() {
    const playerDamage = this.calculatePlayerDamagePotential();
    const playerHealth = this.gameState.playerHealth;
    const computerHealth = this.gameState.computerHealth;
    
    // 计算威胁等级 (0-10)
    let threat = 0;
    
    // 玩家血量低时威胁降低
    if (playerHealth <= 5) threat -= 3;
    else if (playerHealth <= 10) threat -= 1;
    
    // 电脑血量低时威胁增加
    if (computerHealth <= 5) threat += 4;
    else if (computerHealth <= 10) threat += 2;
    
    // 玩家伤害潜力高时威胁增加
    if (playerDamage >= 15) threat += 3;
    else if (playerDamage >= 10) threat += 2;
    else if (playerDamage >= 5) threat += 1;
    
    // 玩家手牌多时威胁增加
    if (this.gameState.playerHand.length >= 5) threat += 2;
    else if (this.gameState.playerHand.length >= 3) threat += 1;
    
    this.threatLevel = Math.max(0, Math.min(10, threat));
}
```

### 2. 连击系统

#### 功能描述
- 跟踪连续使用低消耗卡牌的情况
- 连击数越高，后续卡牌评分越高
- 鼓励AI进行连击操作

#### 实现细节
```javascript
updateComboCounter(card) {
    if (this.gameState.currentTurn === this.lastComboTurn + 1) {
        this.comboCounter++;
    } else {
        this.comboCounter = 1;
    }
    this.lastComboTurn = this.gameState.currentTurn;
}

// 连击加成
if (this.comboCounter > 0) {
    score *= (1 + this.comboCounter * 0.1);
}
```

### 3. 吟唱系统支持

#### 功能描述
- 检测是否有吟唱机会
- 为吟唱卡牌提供特殊评分
- 处理吟唱状态下的回合

#### 实现细节
```javascript
hasCastingOpportunity() {
    const castingCards = this.gameState.computerHand.filter(card => 
        card.castTime > 0 && card.energyCost <= this.gameState.computerEnergy
    );
    return castingCards.length > 0 && !this.gameState.computerCastingSystem.isCasting();
}

handleCastingTurn() {
    const castingInfo = this.gameState.computerCastingSystem.getCastingInfo();
    if (castingInfo) {
        const remainingTime = castingInfo.remainingTime.toFixed(1);
        return `电脑正在吟唱 ${castingInfo.card.name} (剩余 ${remainingTime}秒)`;
    }
    return "电脑正在吟唱中...";
}
```

### 4. 英雄技能使用

#### 功能描述
- 根据职业特性判断是否使用英雄技能
- 考虑当前局势和血量状态
- 智能选择使用时机

#### 实现细节
```javascript
shouldUseHeroSkill() {
    const character = this.gameState.computerCharacter;
    
    // 检查能量是否足够
    if (character.currentEnergy < 2) {
        return false;
    }

    // 根据职业和局势判断
    switch (character.characterClass) {
        case '战士':
            // 战士技能：造成伤害，血量低时更倾向于使用
            return this.gameState.computerHealth <= 15 || this.gameState.playerHealth <= 10;
        case '法师':
            // 法师技能：下次法术伤害翻倍，有高伤害法术时使用
            const hasHighDamageSpell = this.gameState.computerHand.some(card => 
                card.class === '法师' && card.effectCode.includes('DAMAGE') && (card.value1 || 0) >= 8
            );
            return hasHighDamageSpell;
        case '盗贼':
            // 盗贼技能：进入潜行，血量低时使用
            return this.gameState.computerHealth <= 12;
        case '牧师':
            // 牧师技能：治疗，血量低时使用
            return this.gameState.computerHealth <= 20;
        default:
            return false;
    }
}
```

### 5. 策略切换系统

#### 功能描述
- 动态切换策略：balanced（平衡）、aggressive（攻击）、defensive（防御）、combo（连击）
- 根据威胁等级、血量比例、连击机会等因素
- 每种策略有不同的卡牌选择逻辑

#### 实现细节
```javascript
updateStrategy() {
    const healthRatio = this.gameState.computerHealth / this.gameState.computerCharacter.maxHealth;
    const playerHealthRatio = this.gameState.playerHealth / this.gameState.playerCharacter.maxHealth;
    
    if (this.threatLevel >= 7 || healthRatio < 0.3) {
        this.strategy = 'defensive';
    } else if (playerHealthRatio < 0.4 || this.canFinishPlayer()) {
        this.strategy = 'aggressive';
    } else if (this.comboCounter > 0 && this.hasComboCards()) {
        this.strategy = 'combo';
    } else {
        this.strategy = 'balanced';
    }
}
```

### 6. 状态效果考虑

#### 功能描述
- 为不同类型的状态效果卡牌提供专门的评分
- 考虑中毒、减速、潜行等效果
- 根据局势调整状态效果卡牌的优先级

#### 新增评分方法
- `getPoisonCardScore()` - 中毒卡牌评分
- `getStealthCardScore()` - 潜行卡牌评分
- `getCastingCardScore()` - 吟唱卡牌评分

### 7. 增强的个性系统

#### 功能描述
- 新增连击偏好（comboPreference）
- 新增吟唱耐心（castingPatience）
- 根据难度调整个性特征

#### 实现细节
```javascript
generatePersonality() {
    return {
        aggressiveness: Math.random() * 0.8 + 0.2,
        defensiveness: Math.random() * 0.8 + 0.2,
        efficiency: Math.random() * 0.8 + 0.2,
        riskTolerance: Math.random() * 0.8 + 0.2,
        adaptability: Math.random() * 0.8 + 0.2,
        comboPreference: Math.random() * 0.8 + 0.2, // 新增
        castingPatience: Math.random() * 0.8 + 0.2  // 新增
    };
}
```

### 8. 增强的记忆系统

#### 功能描述
- 新增威胁历史记录
- 新增连击历史记录
- 新增吟唱历史记录
- 更详细的使用卡牌记录

#### 实现细节
```javascript
this.memory = {
    lastPlayedCards: [],
    playerPatterns: [],
    healthHistory: [],
    energyHistory: [],
    threatHistory: [],      // 新增
    comboHistory: [],       // 新增
    castingHistory: []      // 新增
};
```

## 测试验证

创建了专门的测试文件 `test/test-ai-improvement.html`，包含以下测试：

1. **威胁评估系统测试** - 验证不同局势下的威胁等级计算
2. **连击系统测试** - 验证连击计数和连击机会检测
3. **吟唱系统测试** - 验证吟唱卡牌选择和状态处理
4. **英雄技能测试** - 验证不同职业的技能使用逻辑
5. **策略切换测试** - 验证策略动态切换
6. **状态效果测试** - 验证状态效果卡牌评分
7. **综合AI表现测试** - 验证整体AI决策效果

## 性能优化

1. **智能缓存** - 缓存计算结果，避免重复计算
2. **历史记录限制** - 限制历史记录大小，避免内存泄漏
3. **评分优化** - 优化卡牌评分算法，提高决策速度

## 兼容性

- 保持与现有游戏系统的完全兼容
- 不影响现有的游戏逻辑
- 向后兼容旧的AI接口

## 使用建议

1. **难度设置** - 根据玩家水平调整AI难度
2. **策略监控** - 通过AI状态监控了解AI决策过程
3. **测试验证** - 使用测试文件验证AI逻辑的正确性

## 后续改进方向

1. **机器学习集成** - 考虑集成简单的机器学习算法
2. **模式识别** - 增强对玩家行为模式的学习
3. **预测系统** - 预测玩家可能的下一步行动
4. **情绪系统** - 为AI添加情绪状态，影响决策风格

## 总结

本次AI逻辑完善显著提升了电脑AI的智能水平，使其能够：

- 更准确地评估局势威胁
- 更灵活地切换策略
- 更智能地使用特殊机制（吟唱、连击、英雄技能）
- 更合理地考虑状态效果
- 更个性化地表现不同难度和个性特征

这些改进使游戏更具挑战性和趣味性，为玩家提供了更好的游戏体验。 