# 爬塔系统配置说明

爬塔系统的配置已集成到 `js/ConfigData.js` 文件中，与其他游戏配置保持一致。这种方式避免了CORS问题，简化了部署和管理。

## 配置数据结构

### 1. `TOWER_CONFIG_DATA` - 主要配置对象
包含爬塔系统的核心参数设置：

| 配置项 | 默认值 | 说明 | 分类 |
|--------|---------|------|------|
| TotalLayers | 8 | 爬塔总层数 | Map |
| MinNodesPerLayer | 2 | 每层最少节点数 | Map |
| MaxNodesPerLayer | 4 | 每层最多节点数 | Map |
| MinConnections | 1 | 每个节点最少连接数 | Map |
| MaxConnections | 3 | 每个节点最多连接数 | Map |
| RestLayerInterval | 3 | 休息点出现间隔层数 | Map |
| StartingHealth | 30 | 玩家初始生命值 | Player |
| StartingEnergy | 3 | 玩家初始能量 | Player |
| StartingGold | 0 | 玩家初始金币 | Player |
| CombatBaseReward | 10 | 战斗基础金币奖励 | Rewards |
| CombatLayerBonus | 5 | 战斗每层额外金币奖励 | Rewards |
| TreasureBaseGold | 25 | 宝箱基础金币奖励 | Rewards |
| TreasureLayerBonus | 10 | 宝箱每层额外金币奖励 | Rewards |
| RestHealPercent | 0.3 | 休息点恢复生命值比例 | Healing |
| BossHealthMultiplier | 1.5 | Boss生命值倍数 | Combat |
| BossEnergyBonus | 1 | Boss额外能量 | Combat |
| TowerCompletionReward | 100 | 完成爬塔基础奖励 | Rewards |
| TowerCompletionLayerBonus | 20 | 完成爬塔每层额外奖励 | Rewards |

### 2. `TOWER_NODE_TYPES_DATA` - 节点类型配置数组
定义地图中可出现的节点类型：

| 字段 | 说明 |
|------|------|
| type | 节点类型标识符 |
| displayName | 显示名称 |
| icon | 图标（支持Emoji） |
| description | 描述文本 |
| weight | 权重（影响出现概率） |
| minLayer | 最小出现层数 |
| maxLayer | 最大出现层数 |
| isSpecial | 是否为特殊节点 |

**默认节点类型：**
- `combat` - 战斗节点（权重60）
- `treasure` - 宝箱节点（权重25）  
- `rest` - 休息点（权重15）
- `boss` - Boss节点（仅第8层）
- `start` - 起始点（仅第0层）
- `elite` - 精英节点（权重20，3-6层）
- `shop` - 商店节点（权重10，2-6层）
- `event` - 事件节点（权重15，1-7层）

### 3. `TOWER_REWARDS_DATA` - 奖励配置数组
定义各种奖励的属性：

| 字段 | 说明 |
|------|------|
| type | 奖励类型标识符 |
| icon | 奖励图标 |
| baseAmount | 基础数量 |
| layerMultiplier | 层数倍数 |
| probability | 出现概率 |
| minLayer | 最小出现层数 |
| maxLayer | 最大出现层数 |
| description | 描述文本 |

**奖励计算公式：**
```
实际数量 = baseAmount + (layerMultiplier × 当前层数)
```

## 配置自定义示例

### 示例1：创建高难度模式
在 `js/ConfigData.js` 中修改 `TOWER_CONFIG_DATA`：
```javascript
const TOWER_CONFIG_DATA = {
    TotalLayers: 12,
    StartingHealth: 20,
    RestHealPercent: 0.2,
    BossHealthMultiplier: 2.0,
    CombatBaseReward: 5,
    // ... 其他配置
};
```

### 示例2：添加新节点类型
在 `TOWER_NODE_TYPES_DATA` 数组中添加：
```javascript
{
    type: "mystery",
    displayName: "神秘房间",
    icon: "🔮",
    description: "未知的神秘事件",
    weight: 10,
    minLayer: 2,
    maxLayer: 6,
    isSpecial: false
}
```

### 示例3：调整奖励分布
在 `TOWER_REWARDS_DATA` 数组中修改：
```javascript
{
    type: "card_legendary",
    icon: "⭐",
    baseAmount: 1,
    layerMultiplier: 0,
    probability: 15,  // 提高概率从5到15
    minLayer: 3,      // 降低最小层数从6到3
    maxLayer: 8,
    description: "获得传说卡牌"
}
```

## 配置加载机制

1. **自动加载**：游戏启动时自动从 `js/ConfigData.js` 读取配置
2. **默认值保护**：如果配置读取失败，系统会使用内置的默认配置
3. **热重载**：可通过代码调用 `TowerConfig.reload()` 重新加载配置
4. **验证机制**：配置加载后会自动验证必需的配置项
5. **无CORS问题**：配置直接内嵌在JavaScript中，避免了跨域问题

## 开发者接口

### 获取配置值
```javascript
// 获取主配置
const totalLayers = TowerConfig.getTowerConfig('TotalLayers', 8);

// 获取节点类型配置
const nodeConfig = TowerConfig.getNodeTypeConfig('combat');

// 获取奖励配置
const rewardConfig = TowerConfig.getRewardConfig('gold');

// 计算奖励数量
const goldAmount = TowerConfig.calculateRewardAmount('gold', 3);
```

### 获取可用选项
```javascript
// 获取指定层的可用节点类型
const availableNodes = TowerConfig.getAvailableNodeTypesForLayer(3);

// 获取指定层的可用奖励
const availableRewards = TowerConfig.getAvailableRewardsForLayer(5);
```

### 配置调试
```javascript
// 导出所有配置为JSON
console.log(TowerConfig.exportToJSON());

// 重新加载配置
await TowerConfig.reload();
```

## 注意事项

1. **文件位置**：所有配置都在 `js/ConfigData.js` 文件中
2. **数据类型**：JavaScript原生类型，无需字符串转换
3. **布尔值**：直接使用 `true`/`false` 布尔值
4. **权重系统**：节点类型和奖励都支持权重控制出现概率
5. **层数限制**：层数从0开始计算（0为起始层）
6. **代码编辑**：修改配置需要编辑JavaScript文件并重新加载页面

## 扩展建议

- 添加季节性事件配置
- 实现难度等级预设
- 支持自定义卡牌池配置
- 添加成就系统配置
- 实现动态平衡调整 