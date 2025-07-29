/**
 * 游戏主入口文件
 */

// 全局游戏实例
let game = null;
let isGameInitialized = false;

// 全局UI管理器实例
let startUI = null;
let opponentSelectUI = null;
let gameUI = null;
let mapUI = null;
let globalTowerState = null;

/**
 * 页面加载完成后初始化UI管理器
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化UI管理器...');
    
    try {
        // 初始化UI管理器
        initializeUIManagers();
        
        console.log('UI管理器初始化完成，显示开始界面...');
        
    } catch (error) {
        console.error('UI初始化失败:', error);
        alert('UI初始化失败: ' + error.message);
    }
});

/**
 * 初始化所有UI管理器
 */
function initializeUIManagers() {
    // 创建开始界面UI管理器
    startUI = new StartUI();
    
    // 创建选择对手界面UI管理器
    opponentSelectUI = new OpponentSelectUI();
    
    // 将UI管理器添加到全局作用域供其他模块使用
    window.startUI = startUI;
    window.opponentSelectUI = opponentSelectUI;
    
    // 设置全局函数供UI管理器调用
    window.startDefaultGame = startDefaultGame;
    window.startGameWithOpponent = startGameWithOpponent;
    window.startTowerMode = startTowerMode;
    window.showStartScreen = () => startUI.show();
    
    console.log('所有UI管理器已初始化');
}

/**
 * 开始默认游戏（使用默认对手）
 */
async function startDefaultGame() {
    try {
        console.log('开始默认游戏');
        
        // 确保配置已加载
        await ensureConfigLoaded();
        
        // 使用第一个怪物作为默认对手
        const monsters = window.ConfigData.MONSTER_CONFIG_DATA || [];
        if (monsters.length === 0) {
            throw new Error('没有可用的对手配置');
        }
        
        const defaultMonster = monsters[0];
        await startGameWithOpponent(defaultMonster);
        
    } catch (error) {
        console.error('启动默认游戏失败:', error);
        alert('启动默认游戏失败: ' + error.message);
        
        // 返回开始界面
        if (startUI) {
            startUI.show();
        }
    }
}

// 这些函数已移动到对应的UI管理器中
// showStartScreen -> StartUI.show()
// hideStartScreen -> StartUI.hide()

// showOpponentSelection函数已移动到OpponentSelectUI.js

// startGame函数已废弃，使用startDefaultGame或showOpponentSelection

// 重复的showOpponentSelection函数已移动到OpponentSelectUI.js

/**
 * 使用选定的对手开始游戏
 */
async function startGameWithOpponent(monsterConfig) {
    try {
        console.log('=== 开始游戏启动流程 ===');
        console.log('用户选择了对手:', monsterConfig);
        
        // 验证输入参数
        if (!monsterConfig) {
            throw new Error('对手配置不能为空');
        }
        
        // 验证monsterConfig的基本属性
        const requiredFields = ['id', 'name', 'class', 'maxHealth', 'maxEnergy'];
        for (const field of requiredFields) {
            if (monsterConfig[field] === undefined) {
                console.warn(`对手配置缺少字段: ${field}, 将使用默认值`);
            }
        }
        
        // 为缺失的字段设置默认值
        monsterConfig = {
            initialEnergy: 1,
            strength: 1,
            agility: 1,
            spirit: 1,
            healthRegenRate: 0,
            energyRegenRate: 1,
            difficulty: 1,
            description: '未知对手',
            ...monsterConfig
        };
        
        console.log('完整的对手配置:', monsterConfig);
        
        // 隐藏选择界面，显示加载提示
        if (opponentSelectUI) {
            opponentSelectUI.hide();
        }
        if (startUI) {
            startUI.hide();
        }
        
        console.log(`正在准备与 ${monsterConfig.name} 的战斗...`);
        
        // 检查必要的类是否存在
        if (typeof ConfigManager === 'undefined') {
            throw new Error('ConfigManager类未找到，请检查配置管理器是否正确加载');
        }
        
        if (typeof Game === 'undefined') {
            throw new Error('Game类未找到，请检查游戏类是否正确加载');
        }
        
        if (typeof MonsterConfigManager === 'undefined') {
            throw new Error('MonsterConfigManager类未找到，请检查怪物配置管理器是否正确加载');
        }
        
        // 确保MonsterConfigManager已加载
        if (!MonsterConfigManager.isLoaded) {
            console.log('MonsterConfigManager未加载，正在加载...');
            await MonsterConfigManager.loadMonsterConfigs();
        }
        
        // 如果游戏还未初始化，则进行初始化
        if (!isGameInitialized) {
            console.log('首次启动，开始初始化游戏...');
            
            try {
                // 加载所有配置
                console.log('正在加载配置文件...');
                const configLoaded = await ConfigManager.loadAllConfigs();
                if (!configLoaded) {
                    console.warn('部分配置文件加载失败，将使用默认配置');
                }
                console.log('配置文件加载完成');
            } catch (configError) {
                console.error('配置加载失败:', configError);
                throw new Error('配置加载失败: ' + configError.message);
            }
            
            try {
                // 验证配置
                console.log('正在验证配置文件...');
                if (typeof ConfigValidator !== 'undefined') {
                    ConfigValidator.logValidationReport();
                }
                console.log('配置验证完成');
            } catch (validationError) {
                console.warn('配置验证失败:', validationError);
            }
            
            try {
                // 更新版本信息
                console.log('更新版本信息...');
                updateVersionInfo();
                console.log('版本信息更新完成');
            } catch (versionError) {
                console.warn('版本信息更新失败:', versionError);
            }
            
            try {
                // 创建游戏实例（传入选定的monster配置）
                console.log('创建游戏实例...');
                game = new Game(monsterConfig);
                console.log('游戏实例创建完成');
            } catch (gameCreateError) {
                console.error('游戏实例创建失败:', gameCreateError);
                throw new Error('游戏实例创建失败: ' + gameCreateError.message);
            }
            
            try {
                // 初始化游戏
                console.log('初始化游戏...');
                await game.initialize();
                console.log('游戏初始化完成');
            } catch (initError) {
                console.error('游戏初始化失败:', initError);
                throw new Error('游戏初始化失败: ' + initError.message);
            }
            
            try {
                // 设置键盘快捷键
                console.log('设置键盘快捷键...');
                setupKeyboardShortcuts();
                console.log('键盘快捷键设置完成');
            } catch (keyboardError) {
                console.warn('键盘快捷键设置失败:', keyboardError);
            }
            
            try {
                // 添加开发者工具
                console.log('添加开发者工具...');
                setupDeveloperTools();
                console.log('开发者工具添加完成');
            } catch (devToolsError) {
                console.warn('开发者工具添加失败:', devToolsError);
            }
            
            isGameInitialized = true;
            console.log('=== 游戏初始化完成 ===');
        } else {
            try {
                // 如果游戏已经初始化，重新创建游戏实例
                console.log('重新创建游戏实例...');
                game = new Game(monsterConfig);
                await game.initialize();
                console.log('游戏实例重新创建完成');
            } catch (recreateError) {
                console.error('游戏实例重新创建失败:', recreateError);
                throw new Error('游戏实例重新创建失败: ' + recreateError.message);
            }
        }
        
        try {
            // 显示游戏界面
            console.log('显示游戏界面...');
            if (game && game.gameUI) {
                game.gameUI.showGameInterface();
                // 保存全局gameUI引用
                gameUI = game.gameUI;
                window.globalGame = game;
                console.log('游戏界面显示完成');
            } else {
                throw new Error('游戏实例或游戏UI未正确创建');
            }
        } catch (uiError) {
            console.error('游戏界面显示失败:', uiError);
            throw new Error('游戏界面显示失败: ' + uiError.message);
        }
        
        try {
            // 开始游戏
            console.log('启动游戏...');
            if (game) {
                game.start();
                console.log(`=== 游戏启动成功！对手: ${monsterConfig.name} ===`);
            } else {
                throw new Error('游戏实例不存在');
            }
        } catch (startError) {
            console.error('游戏启动失败:', startError);
            throw new Error('游戏启动失败: ' + startError.message);
        }
        
    } catch (error) {
        console.error('=== 游戏启动失败 ===');
        console.error('错误详情:', error);
        console.error('错误堆栈:', error.stack);
        alert('游戏启动失败: ' + error.message);
        
        // 恢复开始界面
        if (startUI) {
            startUI.show();
        }
    }
}

/**
 * 设置键盘快捷键
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // 只在游戏未结束时响应快捷键
        if (game && game.gameState && game.gameState.gameOver) {
            return;
        }
        
        switch(event.key) {
            case 'r':
            case 'R':
                // R键重新开始游戏
                event.preventDefault();
                const newGameBtn = document.getElementById('newGameBtn');
                if (newGameBtn) {
                    newGameBtn.click();
                }
                break;
                
            case 's':
            case 'S':
                // S键保存游戏
                event.preventDefault();
                if (game) {
                    game.saveGame();
                }
                break;
                
            case 'l':
            case 'L':
                // L键加载游戏
                event.preventDefault();
                if (game) {
                    game.loadGame();
                }
                break;
                
            case 'Escape':
                // ESC键关闭模态框
                event.preventDefault();
                const modal = document.getElementById('gameOverModal');
                if (modal && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
                break;
        }
    });
}

/**
 * 设置开发者工具
 */
function setupDeveloperTools() {
    // 将游戏实例暴露到全局，方便调试
    window.game = game;
    
    // 添加开发者控制台命令
    window.gameCommands = {
        // 显示游戏状态
        status: function() {
            if (game) {
                console.log('游戏状态:', game.getGameStats());
            }
        },
        
        // 显示版本信息
        version: function() {
            if (game) {
                console.log('版本信息:', game.getVersionInfo());
            }
        },
        
        // 导出配置
        exportConfig: function() {
            if (game) {
                game.exportConfig();
            }
        },
        
        // 重新开始游戏
        restart: function() {
            if (game) {
                game.restart();
            }
        },
        
        // 保存游戏
        save: function() {
            if (game) {
                game.saveGame();
            }
        },
        
        // 加载游戏
        load: function() {
            if (game) {
                game.loadGame();
            }
        },
        
        // 显示帮助
        help: function() {
            console.log('可用命令:');
            console.log('  gameCommands.status() - 显示游戏状态');
            console.log('  gameCommands.version() - 显示版本信息');
            console.log('  gameCommands.exportConfig() - 导出配置');
            console.log('  gameCommands.restart() - 重新开始游戏');
            console.log('  gameCommands.save() - 保存游戏');
            console.log('  gameCommands.load() - 加载游戏');
            console.log('  gameCommands.help() - 显示此帮助');
        }
    };
    
    console.log('开发者工具已加载，使用 gameCommands.help() 查看可用命令');
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', function() {
    if (game) {
        game.destroy();
    }
});

/**
 * 错误处理
 */
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    if (game) {
        game.showError('发生错误: ' + event.error.message);
    }
});

/**
 * 未处理的Promise拒绝
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    if (game) {
        game.showError('发生错误: ' + event.reason);
    }
});

/**
 * 性能监控
 */
if (window.performance) {
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`页面加载时间: ${loadTime}ms`);
    });
}

/**
 * 移动设备检测
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 更新版本信息
 */
function updateVersionInfo() {
    try {
        // 获取配置中的版本号
        const gameVersion = ConfigManager.getGameConfig('GameVersion', '2.1.0');
        const versionText = `v${gameVersion}`;
        
        // 更新HTML中的版本信息
        const versionInfo = document.getElementById('versionInfo');
        if (versionInfo) {
            versionInfo.textContent = versionText;
        }
        
        // 更新开始界面中的版本信息
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            const versionElement = startScreen.querySelector('.game-info p');
            if (versionElement && versionElement.textContent.includes('版本:')) {
                versionElement.textContent = `版本: ${versionText}`;
            }
        }
        
        console.log(`版本信息已更新为: ${versionText}`);
    } catch (error) {
        console.warn('更新版本信息失败:', error);
    }
}

/**
 * 选择monster配置
 * @returns {Object|null} monster配置对象
 */
function selectMonsterForGame() {
    try {
        // 获取所有monster配置
        const allMonsters = ConfigManager.getAllMonsterConfigs();
        
        if (allMonsters.length === 0) {
            console.log('没有可用的monster配置，使用默认配置');
            return null;
        }
        
        // 可以根据需要实现不同的选择逻辑
        // 1. 随机选择
        const randomMonster = selectRandomMonster(allMonsters);
        
        // 2. 根据难度选择
        // const easyMonster = selectMonsterByDifficulty(allMonsters, 1);
        
        // 3. 根据职业选择
        // const warriorMonster = selectMonsterByClass(allMonsters, '战士');
        
        console.log(`选择了monster: ${randomMonster.name} (难度: ${randomMonster.difficulty})`);
        return randomMonster;
        
    } catch (error) {
        console.warn('选择monster配置失败:', error);
        return null;
    }
}

/**
 * 随机选择monster
 * @param {Array} monsters - monster配置数组
 * @returns {Object} 随机选择的monster配置
 */
function selectRandomMonster(monsters) {
    const randomIndex = Math.floor(Math.random() * monsters.length);
    return monsters[randomIndex];
}

/**
 * 根据难度选择monster
 * @param {Array} monsters - monster配置数组
 * @param {number} difficulty - 难度等级
 * @returns {Object|null} 指定难度的monster配置
 */
function selectMonsterByDifficulty(monsters, difficulty) {
    const filteredMonsters = monsters.filter(monster => monster.difficulty === difficulty);
    if (filteredMonsters.length === 0) {
        return null;
    }
    return selectRandomMonster(filteredMonsters);
}

/**
 * 根据职业选择monster
 * @param {Array} monsters - monster配置数组
 * @param {string} characterClass - 职业名称
 * @returns {Object|null} 指定职业的monster配置
 */
function selectMonsterByClass(monsters, characterClass) {
    const filteredMonsters = monsters.filter(monster => monster.class === characterClass);
    if (filteredMonsters.length === 0) {
        return null;
    }
    return selectRandomMonster(filteredMonsters);
}

// 如果是移动设备，添加移动端优化
if (isMobileDevice()) {
    console.log('检测到移动设备，启用移动端优化');
    document.body.classList.add('mobile-device');
}

/**
 * 网络状态检测
 */
if ('ononline' in window) {
    window.addEventListener('online', function() {
        console.log('网络连接已恢复');
        if (game) {
            game.showSuccess('网络连接已恢复');
        }
    });
    
    window.addEventListener('offline', function() {
        console.log('网络连接已断开');
        if (game) {
            game.showError('网络连接已断开');
        }
    });
}

/**
 * 服务工作者注册（如果支持）
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker 注册成功:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker 注册失败:', error);
            });
    });
}

// ============== 爬塔系统相关函数 ==============

/**
 * 全局爬塔状态和地图UI实例（已在顶部声明）
 */

/**
 * 开始爬塔模式
 */
async function startTowerMode() {
    console.log('开始爬塔模式');
    
    try {
        // 确保配置已加载
        await ensureConfigLoaded();
        
        // 确保爬塔配置已加载
        await ensureTowerConfigLoaded();
        
        // 创建爬塔状态
        if (!globalTowerState) {
            globalTowerState = new TowerState();
        }
        
        // 创建地图UI
        if (!mapUI) {
            mapUI = new MapUI(globalTowerState);
            mapUI.initialize();
            globalMapUI = mapUI; // 保持向后兼容
        }
        
        // 开始新的爬塔
        globalTowerState.startNewTower();
        
        // 显示地图
        mapUI.showMap();
        
        // 隐藏开始界面
        if (startUI) {
            startUI.hide();
        }
        
        console.log('爬塔模式启动成功');
        
    } catch (error) {
        console.error('启动爬塔模式失败:', error);
        alert('启动爬塔模式失败: ' + error.message);
    }
}

/**
 * 确保配置已加载
 */
async function ensureConfigLoaded() {
    // 检查是否需要加载配置
    if (!window.ConfigData || !window.ConfigData.MONSTER_CONFIG_DATA) {
        console.log('正在加载配置数据...');
        
        // 如果ConfigManager存在且未加载，则加载配置
        if (typeof ConfigManager !== 'undefined' && !ConfigManager.isLoaded) {
            await ConfigManager.loadAllConfigs();
        }
        
        // 检查是否成功加载了怪物配置
        if (!window.ConfigData || !window.ConfigData.MONSTER_CONFIG_DATA) {
            throw new Error('无法加载怪物配置数据');
        }
    }
}

/**
 * 确保爬塔配置已加载
 */
async function ensureTowerConfigLoaded() {
    if (!window.TowerConfig || !TowerConfig.isLoaded) {
        console.log('正在加载爬塔配置...');
        
        // 使用同步加载，因为ConfigData已经可用
        TowerConfig.loadSync();
        
        if (!TowerConfig.isLoaded) {
            throw new Error('无法加载爬塔配置数据');
        }
    }
}

/**
 * 退出爬塔模式，返回主菜单
 */
function exitTowerMode() {
    console.log('退出爬塔模式');
    
    // 清理爬塔状态
    if (globalTowerState) {
        globalTowerState.isInTower = false;
    }
    
    // 隐藏地图UI
    if (mapUI) {
        mapUI.hideMap();
    }
    
    // 显示开始界面
    if (startUI) {
        startUI.show();
    }
}

/**
 * 处理爬塔战斗结束
 */
function handleTowerCombatEnd(victory, nodeId) {
    console.log(`爬塔战斗结束，胜利: ${victory}, 节点: ${nodeId}`);
    
    if (globalTowerState && globalMapUI) {
        // 完成节点
        globalTowerState.completeNode(nodeId, { victory });
        
        if (victory) {
            // 战斗胜利，立即显示地图
            if (mapUI) {
                mapUI.showMap();
            }
        } else {
            // 战斗失败，显示失败选项
            setTimeout(() => {
                if (mapUI) {
                    mapUI.showGameOverOptions();
                }
            }, 2000);
        }
    }
}

// 导出游戏实例供其他模块使用
window.CardBattleGame = {
    game: null,
    init: async function() {
        if (!this.game) {
            this.game = new Game();
            await this.game.initialize();
            this.game.start();
        }
        return this.game;
    },
    getGame: function() {
        return this.game;
    }
}; 