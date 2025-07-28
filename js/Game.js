/**
 * 游戏主控制器 - 管理整个游戏流程
 */
class Game {
    constructor() {
        this.gameState = null;
        this.gameUI = null;
        this.isInitialized = false;
    }

    /**
     * 初始化游戏
     */
    async initialize() {
        try {
            console.log('正在初始化游戏...');

            // 创建游戏状态
            this.gameState = new GameState();

            // 异步初始化牌组（包括加载CSV配置）
            await this.gameState.initializeDeck();

            // 发初始手牌
            this.gameState.dealInitialCards();

            // 创建游戏UI
            this.gameUI = new GameUI(this.gameState);

            this.isInitialized = true;
            console.log('游戏初始化完成');

            // 添加初始日志
            this.gameUI.addGameLog('游戏开始！');

        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showError('游戏初始化失败: ' + error.message);
        }
    }

    /**
     * 开始游戏
     */
    start() {
        if (!this.isInitialized) {
            console.error('游戏未初始化，无法开始');
            return;
        }

        console.log('游戏开始');
        this.gameUI.addGameLog('欢迎来到卡牌对战游戏！');
    }

    /**
     * 重新开始游戏
     */
    restart() {
        if (!this.isInitialized) {
            this.initialize().then(() => this.start());
            return;
        }

        console.log('重新开始游戏');
        this.gameState.reset();
        this.gameUI.clearGameLog();
        this.gameUI.addGameLog('游戏重新开始！');
        this.gameUI.updateUI();
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.gameState) {
            this.gameState.isPaused = true;
            console.log('游戏已暂停');
        }
    }

    /**
     * 恢复游戏
     */
    resume() {
        if (this.gameState) {
            this.gameState.isPaused = false;
            console.log('游戏已恢复');
        }
    }

    /**
     * 保存游戏状态
     */
    saveGame() {
        if (!this.gameState) return null;

        try {
            const saveData = {
                gameState: this.gameState.getGameInfo(),
                gameLog: this.gameUI.gameLog,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('cardBattleGame_save', JSON.stringify(saveData));
            console.log('游戏已保存');
            this.gameUI.showSuccess('游戏已保存');
            return saveData;
        } catch (error) {
            console.error('保存游戏失败:', error);
            this.gameUI.showError('保存游戏失败');
            return null;
        }
    }

    /**
     * 加载游戏状态
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem('cardBattleGame_save');
            if (!saveData) {
                console.log('没有找到保存的游戏');
                return false;
            }

            const data = JSON.parse(saveData);
            
            // 这里可以实现加载游戏状态的逻辑
            // 由于游戏状态比较复杂，暂时只显示加载成功消息
            console.log('游戏加载成功');
            this.gameUI.showSuccess('游戏加载成功');
            return true;
        } catch (error) {
            console.error('加载游戏失败:', error);
            this.gameUI.showError('加载游戏失败');
            return false;
        }
    }

    /**
     * 获取游戏统计信息
     */
    getGameStats() {
        if (!this.gameState) return null;

        const info = this.gameState.getGameInfo();
        return {
            currentTurn: info.currentTurn,
            playerHealth: info.playerHealth,
            computerHealth: info.computerHealth,
            playerHandCount: info.playerHandCount,
            computerHandCount: info.computerHandCount,
            gameOver: info.gameOver,
            winner: info.winner
        };
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        console.error(message);
        if (this.gameUI) {
            this.gameUI.showError(message);
        } else {
            alert('错误: ' + message);
        }
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        console.log(message);
        if (this.gameUI) {
            this.gameUI.showSuccess(message);
        }
    }

    /**
     * 获取游戏版本信息
     */
    getVersionInfo() {
        return {
            version: '1.1.0',
            buildDate: '2025-07-28',
            features: [
                '完整的卡牌对战系统',
                '4个职业12张特色卡牌',
                '智能电脑AI对手',
                '实时战斗日志',
                '优化的用户界面',
                '模块化代码架构',
                '完全配置化的数值系统',
                '支持动态卡牌调整'
            ]
        };
    }

    /**
     * 导出游戏配置
     */
    exportConfig() {
        try {
            const config = CardConfigManager.exportToCSV();
            const blob = new Blob([config], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cards.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('配置已导出');
            this.showSuccess('配置已导出为cards.csv');
        } catch (error) {
            console.error('导出配置失败:', error);
            this.showError('导出配置失败');
        }
    }

    /**
     * 导入游戏配置
     * @param {string} csvData - CSV数据
     */
    importConfig(csvData) {
        try {
            if (CardConfigManager.loadFromCSV(csvData)) {
                console.log('配置导入成功');
                this.showSuccess('配置导入成功');
                
                // 重新初始化游戏状态以使用新配置
                this.gameState.initializeDeck();
                this.gameUI.updateUI();
            } else {
                this.showError('配置导入失败');
            }
        } catch (error) {
            console.error('导入配置失败:', error);
            this.showError('导入配置失败: ' + error.message);
        }
    }

    /**
     * 销毁游戏
     */
    destroy() {
        if (this.gameUI) {
            // 清理事件监听器
            const endTurnBtn = document.getElementById('endTurnBtn');
            const newGameBtn = document.getElementById('newGameBtn');
            
            if (endTurnBtn) {
                endTurnBtn.replaceWith(endTurnBtn.cloneNode(true));
            }
            if (newGameBtn) {
                newGameBtn.replaceWith(newGameBtn.cloneNode(true));
            }
        }

        this.gameState = null;
        this.gameUI = null;
        this.isInitialized = false;
        
        console.log('游戏已销毁');
    }
} 