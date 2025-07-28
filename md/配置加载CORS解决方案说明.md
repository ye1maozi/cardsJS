# 配置加载CORS解决方案说明

## 问题背景

在本地文件系统中运行游戏时，由于浏览器的CORS（跨域资源共享）策略限制，无法直接通过`fetch()`加载CSV配置文件，导致游戏无法正常启动。

## 解决方案

### 1. 创建内置配置数据文件

创建了 `js/ConfigData.js` 文件，将所有CSV配置数据转换为JavaScript对象：

```javascript
// 卡牌配置数据
const CARD_CONFIG_DATA = [
    {
        name: "打击",
        class: "战士",
        energyCost: 1,
        castTime: 0,
        castType: "瞬发",
        effect: "对单体目标造成6点伤害",
        effectCode: "DAMAGE_6",
        value1: 6,
        value2: 0,
        value3: 0
    },
    // ... 更多卡牌配置
];

// 英雄技能配置数据
const HERO_SKILL_DATA = [
    // ... 技能配置
];

// 角色职业配置数据
const CHARACTER_CLASS_DATA = [
    // ... 职业配置
];

// 游戏配置数据
const GAME_CONFIG_DATA = {
    "InitialHandSize": 4,
    "MaxHandSize": 10,
    // ... 更多配置项
};

// 导出配置数据
window.ConfigData = {
    CARD_CONFIG_DATA,
    HERO_SKILL_DATA,
    CHARACTER_CLASS_DATA,
    GAME_CONFIG_DATA
};
```

### 2. 修改配置加载逻辑

#### CardConfig.js 修改

添加了从内置数据加载的方法：

```javascript
/**
 * 从内置配置数据加载
 * @returns {boolean} 是否加载成功
 */
static loadFromBuiltInData() {
    try {
        // 检查是否有内置配置数据
        if (typeof window.ConfigData === 'undefined' || !window.ConfigData.CARD_CONFIG_DATA) {
            console.warn('内置配置数据不可用');
            return false;
        }
        
        this.cardConfigs = [];
        const data = window.ConfigData.CARD_CONFIG_DATA;
        
        for (const item of data) {
            const config = new CardConfig(
                item.name,
                item.class,
                item.energyCost,
                item.castTime,
                item.castType,
                item.effect,
                item.effectCode,
                item.value1,
                item.value2,
                item.value3
            );
            this.cardConfigs.push(config);
        }
        
        console.log(`从内置数据成功加载 ${this.cardConfigs.length} 张卡牌配置`);
        return true;
    } catch (error) {
        console.warn('从内置数据加载失败:', error.message);
        return false;
    }
}
```

修改了主加载方法，实现三级加载策略：

```javascript
static async loadCardConfigs() {
    try {
        // 1. 优先尝试从CSV文件加载配置
        const fileSuccess = await this.loadFromCSVFile();
        if (fileSuccess) {
            this.isLoaded = true;
            console.log(`从CSV文件成功加载 ${this.cardConfigs.length} 张卡牌配置`);
            return true;
        }
        
        // 2. 如果文件加载失败，尝试使用内置配置数据
        const builtInSuccess = this.loadFromBuiltInData();
        if (builtInSuccess) {
            this.isLoaded = true;
            console.log(`从内置数据成功加载 ${this.cardConfigs.length} 张卡牌配置`);
            return true;
        }
        
        // 3. 最后使用最小化默认配置
        console.warn('所有配置加载失败，使用最小化默认配置');
        return this.loadDefaultConfigs();
    } catch (error) {
        console.error('加载卡牌配置失败:', error);
        this.isLoaded = false;
        return false;
    }
}
```

#### ConfigManager.js 修改

为每个配置类型添加了从内置数据加载的方法：

- `loadHeroSkillsFromBuiltInData()`
- `loadCharacterClassesFromBuiltInData()`
- `loadGameConfigFromBuiltInData()`

每个方法都实现了相同的三级加载策略。

### 3. 更新HTML文件

在 `index.html` 中添加了 `ConfigData.js` 的引用：

```html
<!-- JavaScript文件 -->
<script src="js/ConfigData.js?v=8"></script>
<script src="js/Character.js?v=8"></script>
<!-- ... 其他脚本 -->
```

## 加载策略

新的配置加载系统采用三级策略：

1. **CSV文件加载**：优先尝试从CSV文件加载配置（适用于HTTP服务器环境）
2. **内置数据加载**：如果CSV加载失败，使用内置的JavaScript对象数据（避免CORS问题）
3. **默认配置加载**：如果前两种方式都失败，使用硬编码的默认配置（确保游戏始终能启动）

## 优势

1. **兼容性**：同时支持HTTP服务器和本地文件系统环境
2. **可靠性**：三级加载策略确保游戏始终能够启动
3. **性能**：内置数据加载比CSV文件加载更快
4. **维护性**：配置数据集中管理，易于更新
5. **调试友好**：详细的日志输出，便于问题排查

## 测试

创建了 `test/test-config-loading.html` 测试页面，可以验证：

- 内置配置数据的可用性
- 各级配置加载功能
- 完整配置加载流程

## 使用说明

1. 在HTTP服务器环境下，游戏会优先使用CSV文件配置
2. 在本地文件系统环境下，游戏会自动切换到内置数据配置
3. 如果需要更新配置，可以修改 `ConfigData.js` 文件中的相应数据
4. 所有配置更改都会在下次页面刷新时生效

## 注意事项

1. `ConfigData.js` 文件必须在其他配置相关脚本之前加载
2. 内置数据与CSV文件数据应保持同步
3. 修改内置数据后需要更新版本号以清除浏览器缓存
4. 建议在开发环境中使用CSV文件，在生产环境中使用内置数据 