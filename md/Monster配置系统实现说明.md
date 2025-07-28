# Monster配置系统实现说明

## 概述

Monster配置系统允许电脑AI根据不同的monster配置来选择职业、卡牌和AI行为策略。每个monster都有独特的属性、卡牌偏好、AI策略和个性特征。

## 功能特性

### 1. Monster配置数据
- **8种不同的monster**：哥布林战士、黑暗法师、影刺客、治疗牧师、狂战士、元素法师、潜行盗贼、战斗牧师
- **3个难度等级**：1（简单）、2（中等）、3（困难）
- **4个职业类型**：战士、法师、盗贼、牧师
- **个性化配置**：每个monster都有独特的属性、卡牌偏好和AI策略

### 2. 配置字段说明

#### 基础信息
- `id`: 唯一标识符
- `name`: monster名称
- `class`: 职业类型
- `description`: 描述信息
- `difficulty`: 难度等级（1-3）

#### 属性配置
- `maxHealth`: 最大生命值
- `maxEnergy`: 最大能量值
- `initialEnergy`: 初始能量值
- `strength`: 力量属性
- `agility`: 敏捷属性
- `spirit`: 精神属性
- `healthRegenRate`: 生命恢复速率
- `energyRegenRate`: 能量恢复速率

#### 卡牌偏好
- `preferredCards`: 偏好的卡牌名称数组
- `avoidCards`: 避免的卡牌名称数组

#### AI行为
- `aiStrategy`: AI策略类型
- `personality`: 个性特征

## 实现架构

### 1. 配置数据层

#### ConfigData.js
```javascript
// Monster配置数据
const MONSTER_CONFIG_DATA = [
    {
        id: "goblin_warrior",
        name: "哥布林战士",
        class: "战士",
        description: "一个凶猛的哥布林战士，擅长近战攻击",
        difficulty: 1,
        maxHealth: 30,
        maxEnergy: 8,
        initialEnergy: 1,
        strength: 2,
        agility: 1,
        spirit: 0,
        healthRegenRate: 0,
        energyRegenRate: 1,
        preferredCards: ["打击", "断筋", "盾击"],
        avoidCards: ["血祭"],
        aiStrategy: "aggressive",
        personality: "reckless"
    },
    // ... 更多monster配置
];
```

### 2. 配置管理层

#### MonsterConfigManager.js
专门管理monster配置的类，提供以下功能：
- 配置加载和验证
- 根据各种条件查询monster
- 从monster配置创建角色属性
- 获取monster的偏好和避免卡牌
- 获取AI策略和个性特征

#### ConfigManager.js
统一的配置管理器，集成monster配置：
- 在`loadAllConfigs()`中包含monster配置加载
- 提供monster配置的查询接口
- 支持随机选择、按难度选择、按职业选择

### 3. 游戏逻辑层

#### GameState.js
- 构造函数接受monster配置参数
- 根据monster配置创建电脑角色
- 应用monster的属性配置
- 根据monster偏好构建牌组

#### BotPlayer.js
- 构造函数接受monster配置参数
- 根据monster配置调整AI个性特征
- 根据monster偏好过滤卡牌选择
- 应用monster的AI策略

#### Game.js
- 构造函数接受monster配置参数
- 将monster配置传递给GameState

### 4. 游戏启动层

#### main.js
- 在`startGame()`中选择monster配置
- 提供多种monster选择策略
- 将选中的monster配置传递给Game实例

## Monster配置详情

### 1. 哥布林战士 (goblin_warrior)
- **职业**: 战士
- **难度**: 1
- **特点**: 攻击性强，但生命值较低
- **偏好卡牌**: 打击、断筋、盾击
- **避免卡牌**: 血祭
- **AI策略**: aggressive
- **个性**: reckless

### 2. 黑暗法师 (dark_mage)
- **职业**: 法师
- **难度**: 2
- **特点**: 高法术伤害，低生命值
- **偏好卡牌**: 火球术、冰霜新星、奥术冲击
- **避免卡牌**: 无
- **AI策略**: spell_focused
- **个性**: calculating

### 3. 影刺客 (shadow_assassin)
- **职业**: 盗贼
- **难度**: 2
- **特点**: 高敏捷，擅长潜行
- **偏好卡牌**: 毒刃、伏击、暗影步
- **避免卡牌**: 无
- **AI策略**: stealth_focused
- **个性**: cautious

### 4. 治疗牧师 (healing_priest)
- **职业**: 牧师
- **难度**: 1
- **特点**: 擅长治疗和防护
- **偏好卡牌**: 治疗术、神圣护盾、祝福
- **避免卡牌**: 血祭
- **AI策略**: defensive
- **个性**: protective

### 5. 狂战士 (berserker)
- **职业**: 战士
- **难度**: 3
- **特点**: 高生命值，高攻击力
- **偏好卡牌**: 血祭、打击、盾击
- **避免卡牌**: 治疗术
- **AI策略**: berserk
- **个性**: reckless

### 6. 元素法师 (elemental_mage)
- **职业**: 法师
- **难度**: 3
- **特点**: 极高法术伤害，低生命值
- **偏好卡牌**: 火球术、冰霜新星、奥术冲击
- **避免卡牌**: 治疗术
- **AI策略**: elemental_burst
- **个性**: aggressive

### 7. 潜行盗贼 (stealth_rogue)
- **职业**: 盗贼
- **难度**: 2
- **特点**: 极高敏捷，擅长偷袭
- **偏好卡牌**: 伏击、毒刃、暗影步
- **避免卡牌**: 盾击
- **AI策略**: stealth_ambush
- **个性**: patient

### 8. 战斗牧师 (battle_priest)
- **职业**: 牧师
- **难度**: 2
- **特点**: 平衡的战斗和治疗能力
- **偏好卡牌**: 治疗术、神圣护盾、打击
- **避免卡牌**: 血祭
- **AI策略**: balanced
- **个性**: disciplined

## AI策略类型

### 1. aggressive (攻击型)
- 优先选择攻击卡牌
- 高攻击性，低防御性
- 适合：哥布林战士、狂战士

### 2. spell_focused (法术专注型)
- 优先选择法术卡牌
- 高法术伤害，低生命值
- 适合：黑暗法师、元素法师

### 3. stealth_focused (潜行专注型)
- 优先选择潜行和偷袭卡牌
- 高敏捷，擅长潜行
- 适合：影刺客、潜行盗贼

### 4. defensive (防御型)
- 优先选择防御和治疗卡牌
- 高生命值，擅长防护
- 适合：治疗牧师

### 5. berserk (狂暴型)
- 不惜代价的攻击
- 高生命值，高攻击力
- 适合：狂战士

### 6. elemental_burst (元素爆发型)
- 高法术伤害爆发
- 低生命值，高能量
- 适合：元素法师

### 7. stealth_ambush (潜行伏击型)
- 耐心等待伏击机会
- 高敏捷，擅长偷袭
- 适合：潜行盗贼

### 8. balanced (平衡型)
- 平衡的攻击和防御
- 中等属性，全能型
- 适合：战斗牧师

## 个性特征类型

### 1. reckless (鲁莽)
- 高攻击性，高风险承受度
- 低防御性，低效率

### 2. calculating (计算型)
- 高效率，高适应性
- 高吟唱耐心

### 3. cautious (谨慎)
- 高防御性，低风险承受度
- 低攻击性

### 4. protective (保护型)
- 极高防御性
- 低攻击性，高效率

### 5. patient (耐心)
- 极高吟唱耐心
- 高适应性，低攻击性

### 6. disciplined (纪律型)
- 高效率，高适应性
- 中等连击偏好

### 7. aggressive (攻击型)
- 高攻击性，高连击偏好
- 低防御性

## 使用方法

### 1. 基本使用
```javascript
// 获取所有monster配置
const allMonsters = ConfigManager.getAllMonsterConfigs();

// 随机选择monster
const randomMonster = ConfigManager.getRandomMonster();

// 根据难度选择
const easyMonsters = ConfigManager.getMonstersByDifficulty(1);

// 根据职业选择
const warriorMonsters = ConfigManager.getMonstersByClass('战士');
```

### 2. 创建游戏实例
```javascript
// 选择monster配置
const monsterConfig = ConfigManager.getRandomMonster();

// 创建游戏实例
const game = new Game(monsterConfig);

// 初始化游戏
await game.initialize();
```

### 3. 自定义选择逻辑
```javascript
// 在main.js中修改selectMonsterForGame函数
function selectMonsterForGame() {
    // 根据游戏进度选择不同难度的monster
    const gameProgress = getGameProgress();
    let targetDifficulty = 1;
    
    if (gameProgress > 10) targetDifficulty = 2;
    if (gameProgress > 20) targetDifficulty = 3;
    
    return ConfigManager.getRandomMonster(targetDifficulty);
}
```

## 测试验证

### 1. 测试页面
创建了`test/test-monster-config.html`测试页面，包含：
- Monster配置加载测试
- Monster选择测试
- Monster属性测试
- Monster卡牌偏好测试
- AI策略测试
- 游戏集成测试

### 2. 测试项目
- 配置数据是否正确加载
- Monster选择逻辑是否正常工作
- 属性配置是否正确应用
- 卡牌偏好是否影响牌组构建
- AI行为是否符合monster配置
- 游戏集成是否完整

## 扩展性

### 1. 添加新Monster
1. 在`ConfigData.js`的`MONSTER_CONFIG_DATA`中添加新配置
2. 确保包含所有必需字段
3. 测试新monster的配置和AI行为

### 2. 添加新AI策略
1. 在`BotPlayer.js`中添加新的策略处理逻辑
2. 在monster配置中使用新的策略名称
3. 测试新策略的AI行为

### 3. 添加新个性特征
1. 在`BotPlayer.js`的`generatePersonalityFromMonster`中添加新个性处理
2. 在monster配置中使用新的个性名称
3. 测试新个性的AI行为

## 总结

Monster配置系统为游戏提供了丰富的AI对手变化，每个monster都有独特的：
- **属性配置**：影响生命值、能量、恢复速率等
- **卡牌偏好**：影响牌组构建和卡牌选择
- **AI策略**：影响整体战斗策略
- **个性特征**：影响具体的AI行为决策

这个系统大大提升了游戏的多样性和可玩性，玩家每次游戏都可能遇到不同的AI对手，增加了游戏的挑战性和趣味性。

---

**实现完成时间**：2024年
**版本**：v1.8.4
**状态**：✅ 完成 