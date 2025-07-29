/**
 * 对手选择界面UI管理器
 */
class OpponentSelectUI {
    constructor() {
        this.opponentSelectScreen = null;
        this.isVisible = false;
        this.opponents = [];
        this.selectedOpponent = null;
        this.initialize();
    }

    /**
     * 初始化对手选择界面
     */
    initialize() {
        this.createOpponentSelectScreen();
        this.setupEventListeners();
        console.log('对手选择界面UI初始化完成');
    }

    /**
     * 创建对手选择界面
     */
    createOpponentSelectScreen() {
        // 检查是否已存在
        this.opponentSelectScreen = document.getElementById('opponentSelectScreen');
        if (this.opponentSelectScreen) {
            return;
        }

        // 创建对手选择界面
        this.opponentSelectScreen = document.createElement('div');
        this.opponentSelectScreen.id = 'opponentSelectScreen';
        this.opponentSelectScreen.className = 'opponent-select-screen';
        this.opponentSelectScreen.style.display = 'none';

        this.opponentSelectScreen.innerHTML = `
            <div class="opponent-select-content">
                <div class="select-header">
                    <h2>选择对手</h2>
                    <p>选择你要挑战的对手</p>
                </div>
                
                <div class="opponents-grid" id="opponentsGrid">
                    <!-- 对手列表将在这里动态生成 -->
                </div>
                
                <div class="select-controls">
                    <button id="confirmOpponentBtn" class="btn btn-primary" disabled>确认挑战</button>
                    <button id="backToMenuBtn" class="btn btn-secondary">返回主菜单</button>
                </div>
                
                <div class="opponent-details" id="opponentDetails" style="display: none;">
                    <div class="details-content">
                        <h3 id="detailName">对手详情</h3>
                        <div class="detail-stats">
                            <div class="stat-item">
                                <span class="label">职业:</span>
                                <span id="detailClass" class="value">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">难度:</span>
                                <span id="detailDifficulty" class="value">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">生命值:</span>
                                <span id="detailHealth" class="value">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">能量:</span>
                                <span id="detailEnergy" class="value">-</span>
                            </div>
                        </div>
                        <div class="detail-description">
                            <p id="detailDescriptionText">选择一个对手查看详情</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加到游戏容器
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.opponentSelectScreen);
        }
    }

    /**
     * 显示对手选择界面
     */
    async show() {
        if (!this.opponentSelectScreen) {
            this.createOpponentSelectScreen();
        }

        this.opponentSelectScreen.style.display = 'flex';
        this.isVisible = true;

        // 隐藏其他界面
        this.hideOtherScreens();

        // 加载对手列表
        await this.loadOpponents();

        console.log('显示对手选择界面');
    }

    /**
     * 隐藏对手选择界面
     */
    hide() {
        if (this.opponentSelectScreen) {
            this.opponentSelectScreen.style.display = 'none';
            this.isVisible = false;
            console.log('隐藏对手选择界面');
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 延迟设置，等待DOM创建完成
        setTimeout(() => {
            // 确认挑战按钮
            const confirmBtn = document.getElementById('confirmOpponentBtn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    this.onConfirmOpponent();
                });
            }

            // 返回主菜单按钮
            const backBtn = document.getElementById('backToMenuBtn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.onBackToMenu();
                });
            }

            // 键盘事件
            document.addEventListener('keydown', (e) => {
                if (!this.isVisible) return;

                switch (e.key) {
                    case 'Escape':
                        this.onBackToMenu();
                        break;
                    case 'Enter':
                        if (this.selectedOpponent) {
                            this.onConfirmOpponent();
                        }
                        break;
                }
            });
        }, 100);
    }

    /**
     * 加载对手列表
     */
    async loadOpponents() {
        try {
            // 从配置中获取对手数据
            if (window.MonsterConfigManager) {
                // 检查是否已加载配置
                if (!window.MonsterConfigManager.isLoaded) {
                    console.log('MonsterConfigManager配置未加载，正在加载...');
                    await window.MonsterConfigManager.loadMonsterConfigs();
                }
                
                // 获取配置的对手数据
                const configOpponents = window.MonsterConfigManager.getAllMonsterConfigs();
                if (configOpponents && configOpponents.length > 0) {
                    this.opponents = configOpponents;
                    console.log(`从MonsterConfigManager加载了 ${this.opponents.length} 个对手`);
                } else {
                    console.warn('MonsterConfigManager配置数据为空，使用默认对手数据');
                    this.opponents = this.getDefaultOpponents();
                }
            } else {
                console.warn('MonsterConfigManager不存在，使用默认对手数据');
                this.opponents = this.getDefaultOpponents();
            }
        } catch (error) {
            console.error('加载对手配置失败:', error);
            console.log('使用默认对手数据');
            this.opponents = this.getDefaultOpponents();
        }

        this.renderOpponents();
    }

    /**
     * 获取默认对手数据
     */
    getDefaultOpponents() {
        return [
            {
                id: 'goblin',
                name: '地精战士',
                class: '战士',
                difficulty: 1,
                maxHealth: 25,
                maxEnergy: 3,
                initialEnergy: 1,
                strength: 1,
                agility: 1,
                spirit: 0,
                healthRegenRate: 0,
                energyRegenRate: 1,
                description: '一个弱小但狡猾的地精战士，适合新手练习。'
            },
            {
                id: 'orc',
                name: '兽人勇士',
                class: '战士',
                difficulty: 2,
                maxHealth: 35,
                maxEnergy: 3,
                initialEnergy: 1,
                strength: 2,
                agility: 0,
                spirit: 0,
                healthRegenRate: 0.5,
                energyRegenRate: 1,
                description: '强壮的兽人勇士，具有强大的攻击力。'
            },
            {
                id: 'skeleton_mage',
                name: '骷髅法师',
                class: '法师',
                difficulty: 2,
                maxHealth: 30,
                maxEnergy: 4,
                initialEnergy: 2,
                strength: 0,
                agility: 1,
                spirit: 2,
                healthRegenRate: 0,
                energyRegenRate: 1.5,
                description: '掌握黑暗魔法的亡灵法师，擅长魔法攻击。'
            },
            {
                id: 'dragon',
                name: '红龙',
                class: 'Boss',
                difficulty: 5,
                maxHealth: 80,
                maxEnergy: 5,
                initialEnergy: 2,
                strength: 5,
                agility: 2,
                spirit: 3,
                healthRegenRate: 2,
                energyRegenRate: 2,
                description: '强大的红龙，终极挑战对手。'
            }
        ];
    }

    /**
     * 渲染对手列表
     */
    renderOpponents() {
        const opponentsGrid = document.getElementById('opponentsGrid');
        if (!opponentsGrid) return;

        opponentsGrid.innerHTML = '';

        this.opponents.forEach(opponent => {
            const opponentCard = document.createElement('div');
            opponentCard.className = 'opponent-card';
            opponentCard.dataset.opponentId = opponent.id;

            // 根据难度添加样式类
            if (opponent.difficulty >= 4) {
                opponentCard.classList.add('boss-opponent');
            } else if (opponent.difficulty >= 3) {
                opponentCard.classList.add('elite-opponent');
            }

            opponentCard.innerHTML = `
                <div class="opponent-icon">${this.getOpponentIcon(opponent)}</div>
                <div class="opponent-name">${opponent.name}</div>
                <div class="opponent-class">${opponent.class}</div>
                <div class="opponent-difficulty">
                    ${'★'.repeat(opponent.difficulty)}${'☆'.repeat(5 - opponent.difficulty)}
                </div>
                <div class="opponent-stats">
                    <span>生命: ${opponent.maxHealth}</span>
                    <span>能量: ${opponent.maxEnergy}</span>
                </div>
            `;

            // 添加点击事件
            opponentCard.addEventListener('click', () => {
                this.selectOpponent(opponent);
            });

            opponentsGrid.appendChild(opponentCard);
        });
    }

    /**
     * 获取对手图标
     */
    getOpponentIcon(opponent) {
        const icons = {
            'goblin': '👺',
            'orc': '🧌',
            'skeleton_mage': '💀',
            'dragon': '🐲'
        };

        return icons[opponent.id] || '👹';
    }

    /**
     * 选择对手
     */
    selectOpponent(opponent) {
        // 取消之前的选择
        const previousSelected = document.querySelector('.opponent-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // 选择新对手
        const opponentCard = document.querySelector(`[data-opponent-id="${opponent.id}"]`);
        if (opponentCard) {
            opponentCard.classList.add('selected');
        }

        this.selectedOpponent = opponent;
        this.updateOpponentDetails(opponent);

        // 启用确认按钮
        const confirmBtn = document.getElementById('confirmOpponentBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }

        console.log(`选择对手: ${opponent.name}`);
    }

    /**
     * 更新对手详情显示
     */
    updateOpponentDetails(opponent) {
        const detailsPanel = document.getElementById('opponentDetails');
        if (!detailsPanel) return;

        detailsPanel.style.display = 'block';

        document.getElementById('detailName').textContent = opponent.name;
        document.getElementById('detailClass').textContent = opponent.class;
        document.getElementById('detailDifficulty').textContent = '★'.repeat(opponent.difficulty);
        document.getElementById('detailHealth').textContent = opponent.maxHealth;
        document.getElementById('detailEnergy').textContent = opponent.maxEnergy;
        document.getElementById('detailDescriptionText').textContent = opponent.description;
    }

    /**
     * 确认挑战对手
     */
    onConfirmOpponent() {
        console.log('=== 确认挑战对手开始 ===');
        
        if (!this.selectedOpponent) {
            console.warn('未选择对手');
            alert('请先选择一个对手！');
            return;
        }

        console.log('选择的对手数据:', this.selectedOpponent);
        console.log(`确认挑战对手: ${this.selectedOpponent.name}`);
        
        // 验证对手数据的完整性
        if (!this.selectedOpponent.name || !this.selectedOpponent.id) {
            console.error('对手数据不完整:', this.selectedOpponent);
            alert('对手数据不完整，请重新选择！');
            return;
        }
        
        this.hide();

        // 开始游戏
        console.log('检查startGameWithOpponent函数...');
        if (window.startGameWithOpponent) {
            console.log('调用startGameWithOpponent函数...');
            try {
                window.startGameWithOpponent(this.selectedOpponent);
            } catch (error) {
                console.error('调用startGameWithOpponent函数失败:', error);
                alert('启动游戏失败: ' + error.message);
                // 重新显示选择界面
                this.show().catch(err => console.error('重新显示选择界面失败:', err));
            }
        } else {
            console.error('startGameWithOpponent函数未找到');
            alert('游戏启动函数未找到，请刷新页面重试！');
            // 重新显示选择界面
            this.show().catch(err => console.error('重新显示选择界面失败:', err));
        }
    }

    /**
     * 返回主菜单
     */
    onBackToMenu() {
        console.log('返回主菜单');
        this.hide();

        // 显示开始界面
        if (window.startUI) {
            window.startUI.show();
        } else {
            console.error('开始界面UI未初始化');
        }
    }

    /**
     * 隐藏其他界面
     */
    hideOtherScreens() {
        // 隐藏开始界面
        const startScreen = document.getElementById('startScreen');
        if (startScreen) startScreen.style.display = 'none';

        // 隐藏游戏界面
        const gameArea = document.querySelector('.game-area');
        const gameStatus = document.querySelector('.game-status');
        if (gameArea) gameArea.style.display = 'none';
        if (gameStatus) gameStatus.style.display = 'none';

        // 隐藏爬塔地图
        const towerMapContainer = document.getElementById('towerMapContainer');
        if (towerMapContainer) towerMapContainer.style.display = 'none';
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
        if (this.opponentSelectScreen && this.opponentSelectScreen.parentNode) {
            this.opponentSelectScreen.parentNode.removeChild(this.opponentSelectScreen);
        }
        console.log('对手选择界面UI已销毁');
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.OpponentSelectUI = OpponentSelectUI;
} 