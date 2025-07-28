/**
 * 游戏主入口文件
 */

// 全局游戏实例
let game = null;

/**
 * 页面加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('页面加载完成，准备游戏...');
    
    try {
        // 首先加载所有配置
        console.log('正在加载配置文件...');
        const configLoaded = await ConfigManager.loadAllConfigs();
        if (!configLoaded) {
            console.warn('部分配置文件加载失败，将使用默认配置');
        }
        
        // 验证配置
        console.log('正在验证配置文件...');
        ConfigValidator.logValidationReport();
        
        // 更新版本信息
        const versionInfo = document.getElementById('versionInfo');
        if (versionInfo) {
            const gameVersion = ConfigManager.getGameConfig('GameVersion', '1.4.2');
            versionInfo.textContent = `v${gameVersion}`;
        }
        
        // 创建游戏实例
        game = new Game();
        
        // 初始化游戏（但不自动开始）
        await game.initialize();
        
        console.log('游戏准备完成，等待用户开始...');
        
        // 添加键盘快捷键
        setupKeyboardShortcuts();
        
        // 添加开发者工具
        setupDeveloperTools();
        
        // 显示开始游戏界面
        showStartScreen();
        
    } catch (error) {
        console.error('游戏准备失败:', error);
        alert('游戏准备失败: ' + error.message);
    }
});

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
            <h2>卡牌对战游戏</h2>
            <p>欢迎来到卡牌对战世界！</p>
            <div class="start-buttons">
                <button id="startGameBtn" class="btn btn-primary">开始游戏</button>
                <button id="loadGameBtn" class="btn btn-secondary">加载游戏</button>
            </div>
            <div class="game-info">
                <p>版本: v${ConfigManager.getGameConfig('GameVersion', '1.4.2')}</p>
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
 * 开始游戏
 */
function startGame() {
    // 隐藏开始界面
    const startScreen = document.getElementById('startScreen');
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
        console.log('游戏启动成功！');
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