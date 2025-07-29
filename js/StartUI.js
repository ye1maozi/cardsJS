/**
 * 开始界面UI管理器
 */
class StartUI {
    constructor() {
        this.startScreen = null;
        this.isVisible = false;
        this.initialize();
    }

    /**
     * 初始化开始界面
     */
    initialize() {
        this.startScreen = document.getElementById('startScreen');
        if (!this.startScreen) {
            console.error('开始界面元素未找到');
            return;
        }
        
        this.setupEventListeners();
        this.show(); // 首次进入显示开始界面
        console.log('开始界面UI初始化完成');
    }

    /**
     * 显示开始界面
     */
    show() {
        if (this.startScreen) {
            this.startScreen.style.display = 'flex';
            this.isVisible = true;
            
            // 隐藏其他界面
            this.hideOtherScreens();
            
            console.log('显示开始界面');
        }
    }

    /**
     * 隐藏开始界面
     */
    hide() {
        if (this.startScreen) {
            this.startScreen.style.display = 'none';
            this.isVisible = false;
            console.log('隐藏开始界面');
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 开始游戏按钮
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.onStartGameClicked();
            });
        }

        // 开始爬塔按钮
        const startTowerBtn = document.getElementById('startTowerBtn');
        if (startTowerBtn) {
            startTowerBtn.addEventListener('click', () => {
                this.onStartTowerClicked();
            });
        }

        // 选择对手按钮
        const selectOpponentBtn = document.getElementById('selectOpponentBtn');
        if (selectOpponentBtn) {
            selectOpponentBtn.addEventListener('click', () => {
                this.onSelectOpponentClicked();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            switch (e.key.toLowerCase()) {
                case 'r':
                    this.onStartGameClicked();
                    break;
                case 's':
                    // 保存功能
                    console.log('保存功能暂未实现');
                    break;
                case 'l':
                    // 加载功能
                    console.log('加载功能暂未实现');
                    break;
            }
        });
    }

    /**
     * 开始游戏按钮点击事件
     */
    onStartGameClicked() {
        console.log('开始游戏被点击');
        this.hide();
        
        // 直接开始游戏，使用默认对手
        if (window.startDefaultGame) {
            window.startDefaultGame();
        } else {
            console.error('startDefaultGame函数未找到');
        }
    }

    /**
     * 开始爬塔按钮点击事件
     */
    onStartTowerClicked() {
        console.log('开始爬塔被点击');
        this.hide();
        
        // 启动爬塔模式
        if (window.startTowerMode) {
            window.startTowerMode();
        } else {
            console.error('startTowerMode函数未找到');
        }
    }

    /**
     * 选择对手按钮点击事件
     */
    async onSelectOpponentClicked() {
        console.log('选择对手被点击');
        this.hide();
        
        // 显示对手选择界面
        if (window.opponentSelectUI) {
            try {
                await window.opponentSelectUI.show();
            } catch (error) {
                console.error('显示对手选择界面失败:', error);
                alert('显示对手选择界面失败: ' + error.message);
                // 发生错误时重新显示开始界面
                this.show();
            }
        } else {
            console.error('对手选择界面未初始化');
            alert('对手选择界面未初始化，请刷新页面重试！');
        }
    }

    /**
     * 隐藏其他界面
     */
    hideOtherScreens() {
        // 隐藏游戏界面
        const gameArea = document.querySelector('.game-area');
        const gameStatus = document.querySelector('.game-status');
        if (gameArea) gameArea.style.display = 'none';
        if (gameStatus) gameStatus.style.display = 'none';

        // 隐藏选择对手界面
        const opponentSelectScreen = document.getElementById('opponentSelectScreen');
        if (opponentSelectScreen) opponentSelectScreen.style.display = 'none';

        // 隐藏爬塔地图
        const towerMapContainer = document.getElementById('towerMapContainer');
        if (towerMapContainer) towerMapContainer.style.display = 'none';

        // 隐藏模态框
        const gameOverModal = document.getElementById('gameOverModal');
        if (gameOverModal) gameOverModal.style.display = 'none';
    }

    /**
     * 更新界面信息
     */
    updateInfo(version = 'v2.1.0') {
        const versionElement = this.startScreen?.querySelector('.game-info p');
        if (versionElement) {
            versionElement.textContent = `版本: ${version}`;
        }
    }

    /**
     * 检查界面是否可见
     */
    isShowing() {
        return this.isVisible;
    }

    /**
     * 销毁UI
     */
    destroy() {
        // 移除事件监听器等清理工作
        console.log('开始界面UI已销毁');
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.StartUI = StartUI;
} 