# 卡牌对战游戏 - JavaScript版本

## 项目结构

```
js/
├── js/                    # 核心游戏代码
│   ├── BotPlayer.js      # AI系统
│   ├── Card.js           # 卡牌类
│   ├── CardConfig.js     # 卡牌配置管理
│   ├── Game.js           # 游戏主控制器
│   ├── GameState.js      # 游戏状态管理
│   ├── GameUI.js         # 游戏UI管理
│   ├── main.js           # 主入口文件
│   └── cards.csv         # 卡牌配置文件
├── md/                   # 文档说明
│   ├── BotPlayer AI系统实现说明.md
│   ├── CSV配置系统实现说明.md
│   ├── 修复总结.md
│   ├── 卡牌描述格式修复说明.md
│   ├── 回合控制修复说明.md
│   ├── 回合能量恢复修复说明.md
│   ├── 护甲和治疗效果修复说明.md
│   └── 能量恢复修复说明.md
├── test/                 # 测试文件
│   ├── test-armor-heal.html
│   ├── test-bot-player.html
│   ├── test-card-descriptions.html
│   ├── test-csv-config.html
│   ├── test-energy.html
│   ├── test-turn-control.html
│   └── test-turn-energy.html
├── css/                  # 样式文件
│   └── style.css
└── index.html            # 主页面
```

## 核心功能

### 1. 游戏系统
- **卡牌对战**: 回合制卡牌对战游戏
- **能量系统**: 每回合恢复能量，限制卡牌使用
- **护甲系统**: 提供额外防御机制
- **牌组管理**: 抽牌、弃牌、洗牌机制

### 2. AI系统
- **智能决策**: 基于局势分析的智能AI
- **个性系统**: 每个AI都有独特的个性特征
- **难度调整**: 简单/普通/困难三种难度
- **策略分析**: 终结、防御、攻击、最优策略

### 3. 配置系统
- **CSV配置**: 卡牌数据存储在CSV文件中
- **动态加载**: 支持运行时加载配置
- **后备机制**: 配置加载失败时使用默认配置

### 4. 卡牌效果
- **伤害卡牌**: 对目标造成伤害
- **治疗卡牌**: 恢复生命值
- **护甲卡牌**: 获得护甲值
- **控制卡牌**: 减速、中毒等效果
- **AOE卡牌**: 群体效果

## 使用方法

### 1. 启动游戏
```bash
# 使用http-server启动
npx http-server

# 或使用Python
python -m http.server 8000

# 或使用Node.js
node -e "require('http').createServer((req, res) => require('fs').createReadStream(req.url.slice(1)).pipe(res)).listen(8000)"
```

### 2. 访问游戏
打开浏览器访问 `http://localhost:8000`

### 3. 测试功能
- **AI测试**: 访问 `test/test-bot-player.html`
- **配置测试**: 访问 `test/test-csv-config.html`
- **功能测试**: 访问其他test目录下的测试页面

## 开发说明

### 1. 添加新卡牌
编辑 `js/cards.csv` 文件，添加新的卡牌配置：
```csv
Name,Class,EnergyCost,CastTime,CastType,Effect,EffectCode,Value1,Value2,Value3
新卡牌,战士,2,0,瞬发,对目标造成8点伤害,DAMAGE_8,8,0,0
```

### 2. 修改AI行为
编辑 `js/BotPlayer.js` 文件，调整AI决策逻辑。

### 3. 添加新效果
在 `js/Card.js` 的 `executeEffect` 方法中添加新的效果代码。

## 技术特性

### 1. 模块化设计
- 清晰的代码分离
- 易于维护和扩展
- 良好的代码复用

### 2. 异步处理
- 异步配置加载
- 非阻塞游戏逻辑
- 响应式UI更新

### 3. 错误处理
- 完善的错误处理机制
- 后备配置系统
- 用户友好的错误提示

### 4. 测试友好
- 完整的测试框架
- 独立的测试页面
- 详细的测试文档

## 版本历史

### v1.0.0
- 基础卡牌对战系统
- 简单的AI对手
- 基本游戏功能

### v1.1.0
- 添加护甲系统
- 修复能量恢复问题
- 改进回合控制

### v1.2.0
- 实现CSV配置系统
- 修复卡牌描述格式
- 优化游戏体验

### v1.3.0
- 实现智能AI系统
- 添加个性特征
- 支持难度调整

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。 