/**
 * 重构后的游戏引擎 - 整合事件系统、状态管理和错误处理
 */
class GameEngine {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.gameLoop = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.targetFrameTime = 1000 / this.fps;
        
        // 核心系统
        this.eventBus = window.EventBus;
        this.stateManager = window.StateManager;
        this.errorHandler = window.ErrorHandler;
        
        // 游戏系统
        this.cardSystem = null;
        this.characterSystem = null;
        this.castingSystem = null;
        this.aiSystem = null;
        this.uiSystem = null;
        
        // 性能监控
        this.performanceStats = {
            frameTime: 0,
            fps: 0,
            memoryUsage: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        this.init();
    }

    /**
     * 初始化游戏引擎
     */
    async init() {
        try {
            console.log('初始化游戏引擎...');
            
            // 初始化错误处理器
            this.errorHandler.init();
            
            // 初始化核心系统
            await this.initCoreSystems();
            
            // 初始化游戏系统
            await this.initGameSystems();
            
            // 设置事件监听
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('游戏引擎初始化完成');
            
            // 触发初始化完成事件
            this.eventBus.emit('engine:initialized');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'engine',
                phase: 'initialization'
            });
            throw error;
        }
    }

    /**
     * 初始化核心系统
     */
    async initCoreSystems() {
        // 验证核心系统
        if (!this.eventBus || !this.stateManager || !this.errorHandler) {
            throw new Error('核心系统未正确加载');
        }
        
        // 设置状态管理器初始状态
        this.stateManager.set('game.isRunning', false);
        this.stateManager.set('game.isPaused', false);
        this.stateManager.set('game.gameTime', 0);
        this.stateManager.set('game.gameOver', false);
        this.stateManager.set('game.winner', null);
        
        console.log('核心系统初始化完成');
    }

    /**
     * 初始化游戏系统
     */
    async initGameSystems() {
        // 初始化卡牌系统
        this.cardSystem = new CardSystem(this);
        
        // 初始化角色系统
        this.characterSystem = new CharacterSystem(this);
        
        // 初始化吟唱系统
        this.castingSystem = new CastingSystem(this);
        
        // 初始化AI系统
        this.aiSystem = new AISystem(this);
        
        // 初始化UI系统
        this.uiSystem = new UISystem(this);
        
        console.log('游戏系统初始化完成');
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 游戏状态事件
        this.eventBus.on(GameEvents.GAME_START, () => this.start(), this);
        this.eventBus.on(GameEvents.GAME_END, () => this.stop(), this);
        this.eventBus.on(GameEvents.GAME_PAUSE, () => this.pause(), this);
        this.eventBus.on(GameEvents.GAME_RESUME, () => this.resume(), this);
        this.eventBus.on(GameEvents.GAME_RESET, () => this.reset(), this);
        
        // 状态变更事件
        this.eventBus.on('state:changed', (data) => this.handleStateChange(data), this);
        
        // 错误事件
        this.eventBus.on('error:occurred', (errorInfo) => this.handleError(errorInfo), this);
        
        console.log('事件监听器设置完成');
    }

    /**
     * 启动游戏引擎
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('游戏引擎未初始化');
        }
        
        if (this.isRunning) {
            console.warn('游戏引擎已在运行中');
            return;
        }
        
        console.log('启动游戏引擎...');
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        this.stateManager.set('game.isRunning', true);
        this.stateManager.set('game.isPaused', false);
        
        // 启动游戏循环
        this.gameLoop = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        this.eventBus.emit('engine:started');
        console.log('游戏引擎启动完成');
    }

    /**
     * 停止游戏引擎
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        console.log('停止游戏引擎...');
        
        this.isRunning = false;
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.stateManager.set('game.isRunning', false);
        
        this.eventBus.emit('engine:stopped');
        console.log('游戏引擎已停止');
    }

    /**
     * 暂停游戏引擎
     */
    pause() {
        if (!this.isRunning || this.stateManager.get('game.isPaused')) {
            return;
        }
        
        console.log('暂停游戏引擎...');
        
        this.stateManager.set('game.isPaused', true);
        this.eventBus.emit('engine:paused');
    }

    /**
     * 恢复游戏引擎
     */
    resume() {
        if (!this.isRunning || !this.stateManager.get('game.isPaused')) {
            return;
        }
        
        console.log('恢复游戏引擎...');
        
        this.stateManager.set('game.isPaused', false);
        this.lastFrameTime = performance.now();
        this.eventBus.emit('engine:resumed');
    }

    /**
     * 重置游戏引擎
     */
    reset() {
        console.log('重置游戏引擎...');
        
        this.stop();
        
        // 重置状态
        this.stateManager.reset();
        
        // 重置系统
        if (this.cardSystem) this.cardSystem.reset();
        if (this.characterSystem) this.characterSystem.reset();
        if (this.castingSystem) this.castingSystem.reset();
        if (this.aiSystem) this.aiSystem.reset();
        if (this.uiSystem) this.uiSystem.reset();
        
        this.eventBus.emit('engine:reset');
        console.log('游戏引擎重置完成');
    }

    /**
     * 游戏主循环
     * @param {number} timestamp - 当前时间戳
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const frameStartTime = performance.now();
        
        // 计算帧时间
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // 更新游戏时间
        const currentGameTime = this.stateManager.get('game.gameTime') + deltaTime / 1000;
        this.stateManager.set('game.gameTime', currentGameTime);
        
        // 检查是否暂停
        if (!this.stateManager.get('game.isPaused')) {
            // 更新游戏系统
            this.update(deltaTime);
        }
        
        // 渲染
        this.render();
        
        // 更新性能统计
        this.updatePerformanceStats(frameStartTime, performance.now());
        
        // 继续游戏循环
        this.gameLoop = requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
    }

    /**
     * 更新游戏系统
     * @param {number} deltaTime - 帧时间
     */
    update(deltaTime) {
        const updateStartTime = performance.now();
        
        try {
            // 更新角色系统
            if (this.characterSystem) {
                this.characterSystem.update(deltaTime);
            }
            
            // 更新吟唱系统
            if (this.castingSystem) {
                this.castingSystem.update(deltaTime);
            }
            
            // 更新AI系统
            if (this.aiSystem) {
                this.aiSystem.update(deltaTime);
            }
            
            // 检查游戏结束条件
            this.checkGameEnd();
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'gameLogic',
                phase: 'update',
                deltaTime: deltaTime
            });
        }
        
        this.performanceStats.updateTime = performance.now() - updateStartTime;
    }

    /**
     * 渲染游戏
     */
    render() {
        const renderStartTime = performance.now();
        
        try {
            // 更新UI系统
            if (this.uiSystem) {
                this.uiSystem.render();
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'ui',
                phase: 'render'
            });
        }
        
        this.performanceStats.renderTime = performance.now() - renderStartTime;
    }

    /**
     * 检查游戏结束条件
     */
    checkGameEnd() {
        const playerHealth = this.stateManager.get('player.health');
        const computerHealth = this.stateManager.get('computer.health');
        
        if (playerHealth <= 0 || computerHealth <= 0) {
            const winner = playerHealth <= 0 ? 'computer' : 'player';
            
            this.stateManager.set('game.gameOver', true);
            this.stateManager.set('game.winner', winner);
            
            this.eventBus.emit(GameEvents.GAME_END, { winner });
            this.stop();
        }
    }

    /**
     * 处理状态变更
     * @param {Object} data - 状态变更数据
     */
    handleStateChange(data) {
        // 触发UI更新
        this.stateManager.set('ui.needsUpdate', true);
        
        // 记录状态变更
        console.log(`状态变更: ${data.path} = ${data.newValue}`);
    }

    /**
     * 处理错误
     * @param {Object} errorInfo - 错误信息
     */
    handleError(errorInfo) {
        // 显示错误信息
        if (this.uiSystem) {
            this.uiSystem.showError(errorInfo.message);
        }
        
        // 记录错误
        console.error('游戏引擎错误:', errorInfo);
    }

    /**
     * 更新性能统计
     * @param {number} frameStartTime - 帧开始时间
     * @param {number} frameEndTime - 帧结束时间
     */
    updatePerformanceStats(frameStartTime, frameEndTime) {
        this.frameCount++;
        
        this.performanceStats.frameTime = frameEndTime - frameStartTime;
        this.performanceStats.fps = 1000 / this.performanceStats.frameTime;
        
        // 每60帧更新一次内存使用情况
        if (this.frameCount % 60 === 0) {
            if (performance.memory) {
                this.performanceStats.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            }
        }
    }

    /**
     * 获取性能统计
     * @returns {Object} 性能统计信息
     */
    getPerformanceStats() {
        return { ...this.performanceStats };
    }

    /**
     * 获取游戏状态
     * @returns {Object} 游戏状态
     */
    getGameState() {
        return this.stateManager.getSnapshot();
    }

    /**
     * 保存游戏
     * @returns {Object} 保存数据
     */
    saveGame() {
        try {
            const saveData = {
                gameState: this.getGameState(),
                timestamp: Date.now(),
                version: '1.0.0'
            };
            
            localStorage.setItem('game_save', JSON.stringify(saveData));
            
            this.eventBus.emit('game:saved', saveData);
            console.log('游戏保存成功');
            
            return saveData;
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'save',
                operation: 'saveGame'
            });
            return null;
        }
    }

    /**
     * 加载游戏
     * @returns {boolean} 是否加载成功
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('game_save');
            if (!saveData) {
                console.log('没有找到保存的游戏');
                return false;
            }
            
            const data = JSON.parse(saveData);
            this.stateManager.restoreFromSnapshot(data.gameState);
            
            this.eventBus.emit('game:loaded', data);
            console.log('游戏加载成功');
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, {
                type: 'load',
                operation: 'loadGame'
            });
            return false;
        }
    }

    /**
     * 销毁游戏引擎
     */
    destroy() {
        console.log('销毁游戏引擎...');
        
        this.stop();
        
        // 销毁系统
        if (this.cardSystem) this.cardSystem.destroy();
        if (this.characterSystem) this.characterSystem.destroy();
        if (this.castingSystem) this.castingSystem.destroy();
        if (this.aiSystem) this.aiSystem.destroy();
        if (this.uiSystem) this.uiSystem.destroy();
        
        // 清理事件监听器
        this.eventBus.clear();
        
        // 销毁状态管理器
        this.stateManager.destroy();
        
        // 销毁错误处理器
        this.errorHandler.destroy();
        
        this.isInitialized = false;
        console.log('游戏引擎已销毁');
    }
}

// 创建全局游戏引擎实例
window.GameEngine = new GameEngine(); 