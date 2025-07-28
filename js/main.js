/**
 * 游戏主入口文件
 */

// 全局游戏实例
let game = null;
let isGameInitialized = false;

/**
 * 页面加载完成后只显示开始界面，不初始化游戏
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，显示开始界面...');
    
    try {
        // 只显示开始游戏界面，不初始化游戏
        showStartScreen();
        
        console.log('开始界面显示完成，等待用户点击开始...');
        
    } catch (error) {
        console.error('显示开始界面失败:', error);
        alert('显示开始界面失败: ' + error.message);
    }
});

/**
 * 显示开始游戏界面
 */
function showStartScreen() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    // 获取版本号（如果配置已加载则使用配置中的版本号，否则使用默认值）
    let version = 'v2.1.0'; // 默认版本号
    try {
        if (typeof ConfigManager !== 'undefined' && ConfigManager.isLoaded) {
            version = 'v' + ConfigManager.getGameConfig('GameVersion', '2.1.0');
        }
    } catch (error) {
        console.warn('无法获取配置版本号，使用默认版本号:', error);
    }
    
    // 创建开始游戏界面
    const startScreen = document.createElement('div');
    startScreen.id = 'startScreen';
    startScreen.className = 'start-screen';
    startScreen.innerHTML = `
        <div class="start-content">
            <h2>卡牌对战游戏</h2>
            <p>欢迎来到卡牌对战世界！</p>
            <div class="start-buttons">
                <button id="startGameBtn" class="btn btn-primary">开始游戏</button>
                <button id="loadGameBtn" class="btn btn-secondary">加载游戏</button>
            </div>
            <div class="game-info">
                <p>版本: ${version}</p>
                <p>按 R 键重新开始 | 按 S 键保存 | 按 L 键加载</p>
            </div>
        </div>
    `;
    
    // 插入到游戏容器的最前面
    gameContainer.insertBefore(startScreen, gameContainer.firstChild);
    
    // 绑定开始游戏按钮事件
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            startGame();
        });
    }
    
    // 绑定加载游戏按钮事件
    const loadGameBtn = document.getElementById('loadGameBtn');
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', () => {
            if (game) {
                game.loadGame();
            }
        });
    }
}

/**
 * 开始游戏 - 只在用户点击开始游戏时才初始化
 */
async function startGame() {
    try {
        console.log('用户点击开始游戏，开始初始化...');
        
        // 显示选择对手界面
        showOpponentSelection();
        
    } catch (error) {
        console.error('游戏启动失败:', error);
        alert('游戏启动失败: ' + error.message);
        
        // 恢复开始界面
        if (startScreen) {
            showStartScreen();
        }
    }
}

/**
 * 显示选择对手界面
 */
function showOpponentSelection() {
    const startScreen = document.getElementById('startScreen');
    if (!startScreen) return;
    
    // 获取monster配置
    const monsters = ConfigData.MONSTER_CONFIG_DATA || [];
    
    // 创建选择对手界面
    startScreen.innerHTML = `
        <div class="start-content">
            <h2>选择对手</h2>
            <p>请选择你要挑战的对手：</p>
            <div class="opponent-grid">
                ${monsters.map(monster => `
                    <div class="opponent-card" data-monster-id="${monster.id}">
                        <div class="opponent-header">
                            <h3>${monster.name}</h3>
                            <span class="opponent-class">${monster.class}</span>
                        </div>
                        <div class="opponent-stats">
                            <div class="stat-item">
                                <span class="stat-label">生命值:</span>
                                <span class="stat-value">${monster.maxHealth}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">能量:</span>
                                <span class="stat-value">${monster.maxEnergy}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">难度:</span>
                                <span class="stat-value">${'★'.repeat(monster.difficulty)}</span>
                            </div>
                        </div>
                        <div class="opponent-description">
                            ${monster.description}
                        </div>
                        <button class="btn btn-primary select-opponent-btn">选择此对手</button>
                    </div>
                `).join('')}
            </div>
            <div class="back-button">
                <button id="backToStartBtn" class="btn btn-secondary">返回</button>
            </div>
        </div>
    `;
    
    // 绑定选择对手事件
    const opponentCards = startScreen.querySelectorAll('.opponent-card');
    opponentCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-opponent-btn')) {
                const monsterId = card.dataset.monsterId;
                const monster = monsters.find(m => m.id === monsterId);
                if (monster) {
                    startGameWithOpponent(monster);
                }
            }
        });
    });
    
    // 绑定返回按钮事件
    const backBtn = document.getElementById('backToStartBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showStartScreen();
        });
    }
}

/**
 * 使用选定的对手开始游戏
 */
async function startGameWithOpponent(monsterConfig) {
    try {
        console.log('用户选择了对手:', monsterConfig.name);
        
        // 显示加载提示
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.innerHTML = `
                <div class="start-content">
                    <h2>正在加载游戏...</h2>
                    <p>正在准备与 ${monsterConfig.name} 的战斗...</p>
                    <div class="loading-spinner"></div>
                </div>
            `;
        }
        
        // 如果游戏还未初始化，则进行初始化
        if (!isGameInitialized) {
            console.log('首次启动，开始初始化游戏...');
            
            // 加载所有配置
            console.log('正在加载配置文件...');
            const configLoaded = await ConfigManager.loadAllConfigs();
            if (!configLoaded) {
                console.warn('部分配置文件加载失败，将使用默认配置');
            }
            
            // 验证配置
            console.log('正在验证配置文件...');
            ConfigValidator.logValidationReport();
            
            // 更新版本信息
            updateVersionInfo();
            
            // 创建游戏实例（传入选定的monster配置）
            game = new Game(monsterConfig);
            
            // 初始化游戏
            await game.initialize();
            
            // 设置键盘快捷键
            setupKeyboardShortcuts();
            
            // 添加开发者工具
            setupDeveloperTools();
            
            isGameInitialized = true;
            console.log('游戏初始化完成');
        } else {
            // 如果游戏已经初始化，重新创建游戏实例
            game = new Game(monsterConfig);
            await game.initialize();
        }
        
        // 隐藏开始界面
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // 显示游戏界面
        if (game && game.gameUI) {
            game.gameUI.showGameInterface();
        }
        
        // 开始游戏
        if (game) {
            game.start();
            console.log(`游戏启动成功！对手: ${monsterConfig.name}`);
        }
        
    } catch (error) {
        console.error('游戏启动失败:', error);
        alert('游戏启动失败: ' + error.message);
        
        // 恢复开始界面
        showStartScreen();
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