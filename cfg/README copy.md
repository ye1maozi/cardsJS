# 游戏配置文件说明

本目录包含游戏的所有配置文件，使用CSV格式便于编辑和管理。

## 文件列表

### 1. cards.csv - 卡牌配置
包含所有卡牌的属性配置：
- **Name**: 卡牌名称
- **Class**: 卡牌职业（战士/法师/盗贼/牧师）
- **EnergyCost**: 能量消耗
- **CastTime**: 吟唱时间
- **CastType**: 施法类型（瞬发/吟唱）
- **Effect**: 效果描述
- **EffectCode**: 效果代码
- **Value1-3**: 效果数值参数
- **Value3**: 额外参数

### 2. hero_skills.csv - 英雄技能配置
包含所有职业的英雄技能配置：
- **Class**: 职业名称
- **SkillName**: 技能名称
- **Description**: 技能描述
- **Cooldown**: 冷却时间（秒）
- **EnergyCost**: 能量消耗
- **EffectType**: 效果类型
- **Value1-3**: 效果数值参数
- **Duration**: 持续时间（秒）

### 3. character_classes.csv - 角色职业配置
包含所有职业的基础属性配置：
- **Class**: 职业名称
- **MaxHealth**: 最大生命值
- **MaxEnergy**: 最大能量值
- **InitialEnergy**: 初始能量值
- **Strength**: 强度属性
- **Agility**: 敏捷属性
- **Spirit**: 精神属性
- **HealthRegenRate**: 生命恢复速度
- **EnergyRegenRate**: 能量恢复速度
- **Description**: 职业描述

### 4. game_config.csv - 游戏配置
包含游戏的各种参数设置：
- **ConfigKey**: 配置键名
- **Value**: 配置值
- **Description**: 配置描述

## 配置修改说明

### 修改卡牌
1. 编辑 `cards.csv` 文件
2. 添加新行或修改现有行
3. 确保所有必需字段都已填写
4. 重启游戏以应用更改

### 修改英雄技能
1. 编辑 `hero_skills.csv` 文件
2. 修改技能参数（冷却时间、能量消耗、效果值等）
3. 重启游戏以应用更改

### 修改职业属性
1. 编辑 `character_classes.csv` 文件
2. 调整职业的基础属性
3. 重启游戏以应用更改

### 修改游戏参数
1. 编辑 `game_config.csv` 文件
2. 调整游戏参数（初始手牌数量、抽卡间隔等）
3. 重启游戏以应用更改

## 效果类型说明

### 英雄技能效果类型
- **STRENGTH_BOOST**: 强度提升
- **ENERGY_RESTORE_SPELL_BOOST**: 能量恢复+法术强化
- **STEALTH**: 潜行效果
- **ARMOR_BOOST**: 护甲提升

### 卡牌效果代码
- **DAMAGE_X**: 造成X点伤害
- **HEAL_X**: 恢复X点生命值
- **DAMAGE_X_POISON**: 造成X点伤害并中毒
- **DAMAGE_X_SLOW**: 造成X点伤害并减速
- **DAMAGE_X_ARMOR**: 造成X点伤害并获得护甲
- **BLOOD_SACRIFICE**: 血祭效果
- **CONSUME_ALL_ENERGY**: 消耗所有能量
- **DAMAGE_X_ALL_SLOW**: 对所有敌人造成X点伤害并减速
- **HEAL_X_ALL**: 对所有友军恢复X点生命值
- **DISPEL**: 驱散效果
- **STEALTH**: 潜行效果

## 注意事项

1. **CSV格式**: 确保CSV文件格式正确，字段间用逗号分隔
2. **数值类型**: 数值字段必须为数字，字符串字段用引号包围
3. **编码**: 文件必须使用UTF-8编码
4. **备份**: 修改配置前建议备份原文件
5. **测试**: 修改后请测试游戏功能是否正常

## 故障排除

如果配置文件加载失败：
1. 检查文件格式是否正确
2. 确认文件编码为UTF-8
3. 检查字段数量是否匹配
4. 查看浏览器控制台的错误信息
5. 游戏会自动使用默认配置作为后备方案 