/**
 * 重构后的游戏主入口文件
 * 使用新的模块化架构
 */

// 全局游戏引擎实例
let gameEngine = null;

/**
 * 页面加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('页面加载完成，准备初始化重构后的游戏...');
    
    try {
        // 初始化游戏引擎
        await initializeGameEngine();
        
        // 设置UI事件监听
        setupUIEventListeners();
        
        // 显示开始游戏界面
        showStartScreen();
        
        console.log('重构后的游戏初始化完成');
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showError('游戏初始化失败: ' + error.message);
    }
});

/**
 * 初始化游戏引擎
 */
async function initializeGameEngine() {
    console.log('正在初始化游戏引擎...');
    
    // 等待核心系统加载
    await waitForCoreSystems();
    
    // 创建游戏引擎实例
    gameEngine = new GameEngine();
    
    // 等待引擎初始化完成
    await new Promise((resolve) => {
        window.EventBus.once('engine:initialized', resolve);
    });
    
    console.log('游戏引擎初始化完成');
}

/**
 * 等待核心系统加载
 */
async function waitForCoreSystems() {
    const maxWaitTime = 5000; // 最大等待时间5秒
    const checkInterval = 100; // 检查间隔100ms
    let elapsedTime = 0;
    
    while (elapsedTime < maxWaitTime) {
        if (window.EventBus && window.StateManager && window.ErrorHandler) {
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsedTime += checkInterval;
    }
    
    throw new Error('核心系统加载超时');
}

/**
 * 设置UI事件监听
 */
function setupUIEventListeners() {
    // 键盘快捷键
    setupKeyboardShortcuts();
    
    // 开发者工具
    setupDeveloperTools();
    
    // 错误处理
    setupErrorHandling();
    
    // 性能监控
    setupPerformanceMonitoring();
}

/**
 * 显示开始游戏界面
 */
function showStartScreen() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    // 创建开始游戏界面
    const startScreen = document.createElement('div');
    startScreen.id = 'startScreen';
    startScreen.className = 'start-screen';
    startScreen.innerHTML = `
        <div class="start-content">
            <h2>卡牌对战游戏 (重构版)</h2>
            <p>欢迎来到卡牌对战世界！</p>
            <div class="start-buttons">
                <button id="startGameBtn" class="btn btn-primary">开始游戏</button>
                <button id="loadGameBtn" class="btn btn-secondary">加载游戏</button>
                <button id="settingsBtn" class="btn btn-info">设置</button>
            </div>
            <div class="game-info">
                <p>版本: v${getGameVersion()}</p>
                <p>按 R 键重新开始 | 按 S 键保存 | 按 L 键加载</p>
                <p>重构版特性: 模块化架构 | 事件驱动 | 统一状态管理</p>
            </div>
        </div>
    `;
    
    // 插入到游戏容器的最前面
    gameContainer.insertBefore(startScreen, gameContainer.firstChild);
    
    // 绑定按钮事件
    bindStartScreenEvents();
}

/**
 * 绑定开始界面事件
 */
function bindStartScreenEvents() {
    // 开始游戏按钮
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }
    
    // 加载游戏按钮
    const loadGameBtn = document.getElementById('loadGameBtn');
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', loadGame);
    }
    
    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
}

/**
 * 开始游戏
 */
function startGame() {
    try {
        // 隐藏开始界面
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // 显示游戏界面
        showGameInterface();
        
        // 启动游戏引擎
        if (gameEngine) {
            gameEngine.start();
            console.log('游戏启动成功！');
        }
        
    } catch (error) {
        console.error('启动游戏失败:', error);
        showError('启动游戏失败: ' + error.message);
    }
}

/**
 * 加载游戏
 */
function loadGame() {
    try {
        if (gameEngine) {
            const success = gameEngine.loadGame();
            if (success) {
                showSuccess('游戏加载成功');
                startGame();
            } else {
                showError('没有找到保存的游戏');
            }
        }
    } catch (error) {
        console.error('加载游戏失败:', error);
        showError('加载游戏失败: ' + error.message);
    }
}

/**
 * 显示设置界面
 */
function showSettings() {
    const settings = {
        playerClass: '战士',
        computerClass: '法师',
        difficulty: 'normal',
        autoSave: true
    };
    
    const settingsHtml = `
        <div class="settings-modal">
            <div class="settings-content">
                <h3>游戏设置</h3>
                <div class="setting-group">
                    <label>玩家职业:</label>
                    <select id="playerClass">
                        <option value="战士">战士</option>
                        <option value="法师">法师</option>
                        <option value="盗贼">盗贼</option>
                        <option value="牧师">牧师</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>电脑职业:</label>
                    <select id="computerClass">
                        <option value="战士">战士</option>
                        <option value="法师">法师</option>
                        <option value="盗贼">盗贼</option>
                        <option value="牧师">牧师</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>难度:</label>
                    <select id="difficulty">
                        <option value="easy">简单</option>
                        <option value="normal">普通</option>
                        <option value="hard">困难</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="autoSave" checked>
                        自动保存
                    </label>
                </div>
                <div class="setting-buttons">
                    <button id="saveSettings" class="btn btn-primary">保存</button>
                    <button id="cancelSettings" class="btn btn-secondary">取消</button>
                </div>
            </div>
        </div>
    `;
    
    // 显示设置模态框
    document.body.insertAdjacentHTML('beforeend', settingsHtml);
    
    // 绑定设置事件
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettings);
}

/**
 * 保存设置
 */
function saveSettings() {
    const settings = {
        playerClass: document.getElementById('playerClass').value,
        computerClass: document.getElementById('computerClass').value,
        difficulty: document.getElementById('difficulty').value,
        autoSave: document.getElementById('autoSave').checked
    };
    
    localStorage.setItem('game_settings', JSON.stringify(settings));
    showSuccess('设置已保存');
    closeSettings();
}

/**
 * 关闭设置
 */
function closeSettings() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * 显示游戏界面
 */
function showGameInterface() {
    const gameArea = document.querySelector('.game-area');
    const gameStatus = document.querySelector('.game-status');
    
    if (gameArea) {
        gameArea.style.display = 'flex';
    }
    if (gameStatus) {
        gameStatus.style.display = 'flex';
    }
}

/**
 * 设置键盘快捷键
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // 只在游戏未结束时响应快捷键
        if (gameEngine && gameEngine.stateManager.get('game.gameOver')) {
            return;
        }
        
        switch(event.key) {
            case 'r':
            case 'R':
                // R键重新开始游戏
                event.preventDefault();
                if (gameEngine) {
                    gameEngine.reset();
                    showSuccess('游戏已重新开始');
                }
                break;
                
            case 's':
            case 'S':
                // S键保存游戏
                event.preventDefault();
                if (gameEngine) {
                    const saveData = gameEngine.saveGame();
                    if (saveData) {
                        showSuccess('游戏已保存');
                    }
                }
                break;
                
            case 'l':
            case 'L':
                // L键加载游戏
                event.preventDefault();
                loadGame();
                break;
                
            case 'Escape':
                // ESC键关闭模态框
                event.preventDefault();
                closeAllModals();
                break;
                
            case 'F1':
                // F1键显示帮助
                event.preventDefault();
                showHelp();
                break;
        }
    });
}

/**
 * 设置开发者工具
 */
function setupDeveloperTools() {
    // 将游戏引擎暴露到全局，方便调试
    window.gameEngine = gameEngine;
    
    // 添加开发者控制台命令
    window.gameCommands = {
        // 显示游戏状态
        status: function() {
            if (gameEngine) {
                console.log('游戏状态:', gameEngine.getGameState());
            }
        },
        
        // 显示性能统计
        performance: function() {
            if (gameEngine) {
                console.log('性能统计:', gameEngine.getPerformanceStats());
            }
        },
        
        // 显示错误日志
        errors: function() {
            if (window.ErrorHandler) {
                console.log('错误日志:', window.ErrorHandler.getErrorLog());
            }
        },
        
        // 重新开始游戏
        restart: function() {
            if (gameEngine) {
                gameEngine.reset();
                showSuccess('游戏已重新开始');
            }
        },
        
        // 保存游戏
        save: function() {
            if (gameEngine) {
                const saveData = gameEngine.saveGame();
                if (saveData) {
                    showSuccess('游戏已保存');
                }
            }
        },
        
        // 加载游戏
        load: function() {
            loadGame();
        },
        
        // 显示帮助
        help: function() {
            console.log('可用命令:');
            console.log('  gameCommands.status() - 显示游戏状态');
            console.log('  gameCommands.performance() - 显示性能统计');
            console.log('  gameCommands.errors() - 显示错误日志');
            console.log('  gameCommands.restart() - 重新开始游戏');
            console.log('  gameCommands.save() - 保存游戏');
            console.log('  gameCommands.load() - 加载游戏');
            console.log('  gameCommands.help() - 显示此帮助');
        }
    };
    
    console.log('开发者工具已加载，使用 gameCommands.help() 查看可用命令');
}

/**
 * 设置错误处理
 */
function setupErrorHandling() {
    if (window.ErrorHandler) {
        // 注册错误回调
        window.ErrorHandler.onError('all', (errorInfo) => {
            console.error('捕获到错误:', errorInfo);
            showError(`发生错误: ${errorInfo.message}`);
        });
    }
}

/**
 * 设置性能监控
 */
function setupPerformanceMonitoring() {
    if (window.performance) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`页面加载时间: ${loadTime}ms`);
        });
    }
}

/**
 * 关闭所有模态框
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal, .settings-modal');
    modals.forEach(modal => {
        if (modal.style.display === 'flex' || modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

/**
 * 显示帮助
 */
function showHelp() {
    const helpHtml = `
        <div class="help-modal">
            <div class="help-content">
                <h3>游戏帮助</h3>
                <div class="help-section">
                    <h4>快捷键</h4>
                    <ul>
                        <li>R - 重新开始游戏</li>
                        <li>S - 保存游戏</li>
                        <li>L - 加载游戏</li>
                        <li>ESC - 关闭对话框</li>
                        <li>F1 - 显示此帮助</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>游戏规则</h4>
                    <ul>
                        <li>使用卡牌攻击对手，降低其生命值</li>
                        <li>合理管理能量，避免能量不足</li>
                        <li>利用职业特色和卡牌组合</li>
                        <li>注意潜行和吟唱机制</li>
                    </ul>
                </div>
                <button id="closeHelp" class="btn btn-primary">关闭</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpHtml);
    document.getElementById('closeHelp').addEventListener('click', () => {
        document.querySelector('.help-modal').remove();
    });
}

/**
 * 显示错误信息
 */
function showError(message) {
    console.error(message);
    // 这里可以添加更友好的错误显示UI
    alert('错误: ' + message);
}

/**
 * 显示成功信息
 */
function showSuccess(message) {
    console.log(message);
    // 这里可以添加更友好的成功显示UI
    console.log('成功: ' + message);
}

/**
 * 获取游戏版本
 */
function getGameVersion() {
    return '2.0.0-refactored';
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', function() {
    if (gameEngine) {
        gameEngine.destroy();
    }
});

/**
 * 网络状态检测
 */
if ('ononline' in window) {
    window.addEventListener('online', function() {
        console.log('网络连接已恢复');
        showSuccess('网络连接已恢复');
    });
    
    window.addEventListener('offline', function() {
        console.log('网络连接已断开');
        showError('网络连接已断开');
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

// 导出游戏引擎供其他模块使用
window.CardBattleGameRefactored = {
    engine: null,
    init: async function() {
        if (!this.engine) {
            await initializeGameEngine();
            this.engine = gameEngine;
        }
        return this.engine;
    },
    getEngine: function() {
        return this.engine;
    },
    start: function() {
        if (this.engine) {
            this.engine.start();
        }
    },
    stop: function() {
        if (this.engine) {
            this.engine.stop();
        }
    },
    reset: function() {
        if (this.engine) {
            this.engine.reset();
        }
    }
}; 