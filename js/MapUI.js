/**
 * 地图UI管理器 - 管理爬塔地图的显示和交互
 */

// 确保NodeType定义存在，如果不存在则使用备用定义
if (typeof NodeType === 'undefined') {
    console.warn('NodeType未定义，使用备用定义');
    window.NodeType = {
        COMBAT: 'combat',
        TREASURE: 'treasure',
        REST: 'rest',
        BOSS: 'boss',
        START: 'start',
        ELITE: 'elite',
        SHOP: 'shop',
        EVENT: 'event'
    };
}

class MapUI {
    constructor(towerState) {
        this.towerState = towerState;
        this.mapContainer = null;
        this.nodeElements = new Map();
        this.isVisible = false;
    }

    /**
     * 初始化地图UI
     */
    initialize() {
        this.createMapContainer();
        this.setupEventListeners();
        console.log('地图UI初始化完成');
    }

    /**
     * 创建地图容器
     */
    createMapContainer() {
        // 创建地图容器
        this.mapContainer = document.createElement('div');
        this.mapContainer.id = 'towerMapContainer';
        this.mapContainer.className = 'tower-map-container';
        this.mapContainer.style.display = 'none';
        
        // 添加到游戏容器中
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.mapContainer);
        }
    }

    /**
     * 显示地图
     */
    showMap() {
        if (!this.mapContainer) {
            this.initialize();
        }
        
        this.renderMap();
        this.mapContainer.style.display = 'block';
        this.isVisible = true;
        
        // 隐藏其他界面
        this.hideOtherScreens();
        
        console.log('显示爬塔地图');
    }

    /**
     * 隐藏地图
     */
    hideMap() {
        if (this.mapContainer) {
            this.mapContainer.style.display = 'none';
        }
        this.isVisible = false;
    }

    /**
     * 渲染地图
     */
    renderMap() {
        console.log('开始渲染地图...');
        
        if (!this.mapContainer) {
            console.error('地图容器不存在！');
            return;
        }
        
        const mapData = this.towerState.getCurrentState().mapData;
        const towerState = this.towerState.getCurrentState();
        
        console.log('地图数据:', mapData);
        console.log('爬塔状态:', towerState);
        
        this.mapContainer.innerHTML = `
            <div class="map-header">
                <div class="tower-info">
                    <h2>爬塔地图</h2>
                    <div class="tower-stats">
                        <div class="stat-item">
                            <span class="label">当前层数:</span>
                            <span class="value">${towerState.currentFloor + 1}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">生命值:</span>
                            <span class="value">${towerState.playerCurrentHealth}/${towerState.playerMaxHealth}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">金币:</span>
                            <span class="value">${towerState.playerGold}</span>
                        </div>
                    </div>
                </div>
                <div class="map-controls">
                    <button id="exitTowerBtn" class="btn btn-secondary">退出爬塔</button>
                </div>
            </div>
            <div class="map-content">
                <div class="map-layers" id="mapLayers">
                    ${this.renderLayers(mapData.layers)}
                </div>
            </div>
            <div class="map-footer">
                <div class="map-legend">
                    <div class="legend-item">
                        <span class="legend-icon">⚔️</span>
                        <span class="legend-text">战斗</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon">📦</span>
                        <span class="legend-text">宝箱</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon">🔥</span>
                        <span class="legend-text">休息点</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon">👹</span>
                        <span class="legend-text">Boss</span>
                    </div>
                </div>
            </div>
        `;
        
        console.log('地图HTML渲染完成，设置事件监听器...');
        this.setupMapEventListeners();
        
        console.log('地图渲染完成');
    }

    /**
     * 渲染地图层
     */
    renderLayers(layers) {
        return layers.map((layer, layerIndex) => `
            <div class="map-layer ${layerIndex === 0 ? 'start-layer' : ''}" data-layer="${layerIndex}">
                <div class="layer-header">
                    <span class="layer-number">${layerIndex === 0 ? '起始' : `第${layerIndex}层`}</span>
                </div>
                <div class="layer-nodes">
                    ${layer.map(node => this.renderNode(node, layerIndex)).join('')}
                </div>
                ${layerIndex < layers.length - 1 ? this.renderConnections(layer, layers[layerIndex + 1]) : ''}
            </div>
        `).reverse().join(''); // 反转显示，从上到下
    }

    /**
     * 渲染单个节点
     */
    renderNode(node, layerIndex) {
        const isAvailable = node.available && !node.completed;
        const isCompleted = node.completed;
        const isCurrent = node.id === this.towerState.mapSystem.currentNode?.id;
        
        console.log(`渲染节点 ${node.id}: available=${node.available}, completed=${node.completed}, isAvailable=${isAvailable}`);
        
        let nodeClass = 'map-node';
        if (isCompleted) nodeClass += ' completed';
        if (isAvailable) nodeClass += ' available';
        if (isCurrent) nodeClass += ' current';
        if (node.type === 'boss') nodeClass += ' boss-node';
        
        console.log(`节点 ${node.id} 的CSS类: ${nodeClass}`);
        
        return `
            <div class="${nodeClass}" 
                 data-node-id="${node.id}" 
                 data-node-type="${node.type}"
                 title="${node.description}">
                <div class="node-icon">${node.icon}</div>
                <div class="node-name">${node.displayName}</div>
                ${isCompleted ? '<div class="node-completed">✓</div>' : ''}
            </div>
        `;
    }

    /**
     * 渲染节点连接线
     */
    renderConnections(currentLayer, nextLayer) {
        // 这里可以添加SVG连接线的渲染
        return '<div class="layer-connections"></div>';
    }

    /**
     * 设置地图事件监听器
     */
    setupMapEventListeners() {
        console.log('设置地图事件监听器...');
        
        // 节点点击事件
        this.mapContainer.addEventListener('click', (e) => {
            console.log('地图容器点击事件触发:', e.target);
            
            const nodeElement = e.target.closest('.map-node');
            console.log('找到的节点元素:', nodeElement);
            
            if (nodeElement) {
                const nodeId = nodeElement.getAttribute('data-node-id');
                const hasAvailableClass = nodeElement.classList.contains('available');
                console.log(`节点ID: ${nodeId}, 是否可用: ${hasAvailableClass}`);
                
                if (hasAvailableClass) {
                    console.log(`调用selectNode: ${nodeId}`);
                    this.selectNode(nodeId);
                } else {
                    console.log('节点不可用，忽略点击');
                }
            } else {
                console.log('未找到节点元素');
            }
        });

        // 退出爬塔按钮
        const exitBtn = this.mapContainer.querySelector('#exitTowerBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.exitTower();
            });
        } else {
            console.warn('未找到退出爬塔按钮');
        }
        
        console.log('地图事件监听器设置完成');
    }

    /**
     * 选择节点
     */
    selectNode(nodeId) {
        console.log(`selectNode被调用，nodeId: ${nodeId}`);
        
        const node = this.towerState.mapSystem.nodes.get(nodeId);
        console.log(`找到节点:`, node);
        
        if (!node) {
            console.log('节点不存在');
            return;
        }
        
        if (!node.available) {
            console.log('节点不可用');
            return;
        }
        
        if (node.completed) {
            console.log('节点已完成');
            return;
        }
        
        console.log(`选择节点: ${node.getDisplayName()}`);
        
        // 检查NodeType是否定义
        if (typeof NodeType === 'undefined') {
            console.error('NodeType未定义！');
            return;
        }
        
        console.log(`节点类型: ${node.type}, NodeType定义:`, NodeType);
        
        // 根据节点类型执行不同操作
        switch (node.type) {
            case NodeType.START:
                console.log('处理起始点节点 - 直接通过');
                this.completeStartNode(node);
                break;
            case NodeType.COMBAT:
                console.log('处理战斗节点');
                this.startCombat(node);
                break;
            case NodeType.ELITE:
                console.log('处理精英节点');
                this.startCombat(node); // 精英节点也是战斗，但奖励更好
                break;
            case NodeType.BOSS:
                console.log('处理Boss节点');
                this.startCombat(node);
                break;
            case NodeType.TREASURE:
                console.log('处理宝箱节点');
                this.openTreasure(node);
                break;
            case NodeType.REST:
                console.log('处理休息点节点');
                this.showRestSite(node);
                break;
            case NodeType.SHOP:
                console.log('处理商店节点');
                this.openShop(node);
                break;
            case NodeType.EVENT:
                console.log('处理事件节点');
                this.triggerEvent(node);
                break;
            default:
                console.warn(`未知的节点类型: ${node.type}`);
                break;
        }
    }

    /**
     * 开始战斗
     */
    startCombat(node) {
        // 隐藏地图，开始战斗
        this.hideMap();
        
        // 使用现有的游戏系统开始战斗
        if (window.startGameWithOpponent && node.data.monsterConfig) {
            // 设置战斗结束回调
            this.setupCombatCallback(node);
            window.startGameWithOpponent(node.data.monsterConfig);
        } else {
            console.error('无法开始战斗：缺少必要的游戏系统或怪物配置');
        }
    }

    /**
     * 设置战斗结束回调
     */
    setupCombatCallback(node) {
        // 监听游戏结束事件
        const checkGameEnd = () => {
            if (window.globalGame && window.globalGame.gameState && window.globalGame.gameState.gameOver) {
                const winner = window.globalGame.gameState.winner;
                const victory = winner === 'player';
                
                // 完成节点
                this.towerState.completeNode(node.id, { victory });
                
                if (victory) {
                    // 战斗胜利，立即返回地图
                    this.showMap();
                    if (window.globalGame) {
                        window.globalGame.isDestroyed = true;
                        window.globalGame = null;
                    }
                } else {
                    // 战斗失败，可以选择重新开始或退出
                    this.showGameOverOptions();
                    if (window.globalGame) {
                        window.globalGame.isDestroyed = true;
                        window.globalGame = null;
                    }
                }
                // 移除监听器
                clearInterval(gameCheckInterval);
            }
        };
        
        const gameCheckInterval = setInterval(checkGameEnd, 1000);
    }

    /**
     * 打开宝箱
     */
    openTreasure(node) {
        // 显示宝箱奖励界面
        this.showTreasureModal(node);
    }

    /**
     * 显示宝箱奖励模态框
     */
    showTreasureModal(node) {
        const rewards = node.data.rewards || [];
        const modal = document.createElement('div');
        modal.className = 'treasure-modal modal';
        modal.innerHTML = `
            <div class="modal-content treasure-content">
                <h2>🎁 宝箱奖励</h2>
                <div class="treasure-rewards">
                    ${rewards.map(reward => `
                        <div class="reward-item">
                            <div class="reward-icon">${this.getRewardIcon(reward.type)}</div>
                            <div class="reward-text">${this.getRewardText(reward)}</div>
                        </div>
                    `).join('')}
                </div>
                <button id="claimTreasureBtn" class="btn btn-primary">领取奖励</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 设置领取按钮事件
        modal.querySelector('#claimTreasureBtn').addEventListener('click', () => {
            // 处理奖励
            this.towerState.processTreasureRewards(rewards);
            this.towerState.completeNode(node.id);
            
            // 关闭模态框并刷新地图
            document.body.removeChild(modal);
            this.renderMap();
        });
    }

    /**
     * 显示休息点
     */
    showRestSite(node) {
        this.showRestModal(node);
    }

    /**
     * 显示休息点模态框
     */
    showRestModal(node) {
        const currentState = this.towerState.getCurrentState();
        const canHeal = currentState.playerCurrentHealth < currentState.playerMaxHealth;
        
        const modal = document.createElement('div');
        modal.className = 'rest-modal modal';
        modal.innerHTML = `
            <div class="modal-content rest-content">
                <h2>🔥 休息点</h2>
                <p>你找到了一个安全的休息地点，可以选择恢复体力或改进装备。</p>
                <div class="rest-options">
                    <button id="restHealBtn" class="btn btn-primary rest-option ${!canHeal ? 'disabled' : ''}" 
                            ${!canHeal ? 'disabled' : ''}>
                        <div class="option-icon">❤️</div>
                        <div class="option-title">恢复生命值</div>
                        <div class="option-desc">恢复30%最大生命值</div>
                    </button>
                    <button id="restUpgradeBtn" class="btn btn-primary rest-option">
                        <div class="option-icon">⬆️</div>
                        <div class="option-title">升级卡牌</div>
                        <div class="option-desc">选择一张卡牌进行升级</div>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 设置选项事件
        modal.querySelector('#restHealBtn').addEventListener('click', () => {
            if (canHeal) {
                const healAmount = this.towerState.restHeal();
                this.showRestResult(`恢复了 ${healAmount} 点生命值！`);
                this.completeRestAndCloseModal(node, modal);
            }
        });
        
        modal.querySelector('#restUpgradeBtn').addEventListener('click', () => {
            this.showCardUpgradeOptions(node, modal);
        });
    }

    /**
     * 显示卡牌升级选项
     */
    showCardUpgradeOptions(node, modal) {
        // 这里可以添加卡牌升级的具体实现
        // 现在先简单处理
        this.showRestResult('升级了一张卡牌！');
        this.completeRestAndCloseModal(node, modal);
    }

    /**
     * 显示休息结果
     */
    showRestResult(message) {
        const result = document.createElement('div');
        result.className = 'rest-result';
        result.innerHTML = `<p>${message}</p>`;
        
        // 可以添加更好的显示效果
        console.log(message);
    }

    /**
     * 完成休息并关闭模态框
     */
    completeRestAndCloseModal(node, modal) {
        this.towerState.completeNode(node.id);
        document.body.removeChild(modal);
        this.renderMap();
    }

    /**
     * 获取奖励图标
     */
    getRewardIcon(type) {
        const config = TowerConfig.getRewardConfig(type);
        return config ? config.icon : '🎁';
    }

    /**
     * 获取奖励文本
     */
    getRewardText(reward) {
        const config = TowerConfig.getRewardConfig(reward.type);
        
        if (!config) {
            return '未知奖励';
        }
        
        // 根据奖励类型生成文本
        if (reward.type.startsWith('card_')) {
            return `获得新卡牌 (${reward.rarity || '普通'})`;
        } else if (reward.amount) {
            return `${config.description} +${reward.amount}`;
        } else {
            return config.description;
        }
    }

    /**
     * 退出爬塔
     */
    exitTower() {
        if (confirm('确定要退出爬塔吗？进度将会丢失。')) {
            this.hideMap();
            this.towerState.isInTower = false;
            
            // 返回主菜单
            if (window.showStartScreen) {
                window.showStartScreen();
            }
        }
    }

    /**
     * 显示游戏失败选项
     */
    showGameOverOptions() {
        const modal = document.createElement('div');
        modal.className = 'gameover-modal modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>挑战失败</h2>
                <p>你在爬塔中失败了...</p>
                <div class="gameover-options">
                    <button id="retryTowerBtn" class="btn btn-primary">重新开始爬塔</button>
                    <button id="exitToMenuBtn" class="btn btn-secondary">返回主菜单</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        modal.querySelector('#retryTowerBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.towerState.startNewTower();
            this.showMap();
        });
        
        modal.querySelector('#exitToMenuBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.exitTower();
        });
    }

    /**
     * 完成起始点节点
     */
    completeStartNode(node) {
        console.log(`完成起始点节点: ${node.id}`);
        
        // 标记节点为完成状态
        this.towerState.completeNode(node.id);
        
        // 显示起始点完成的消息
        this.showStartNodeMessage();
        
        // 重新渲染地图以显示新解锁的节点
        setTimeout(() => {
            this.renderMap();
        }, 1000);
    }

    /**
     * 显示起始点完成消息
     */
    showStartNodeMessage() {
        const modal = document.createElement('div');
        modal.className = 'start-node-modal modal';
        modal.innerHTML = `
            <div class="modal-content start-content">
                <h2>🏠 冒险开始！</h2>
                <p>你已经踏上了爬塔的征程，前方的路充满了挑战和机遇。</p>
                <p>选择你的下一步行动吧！</p>
                <button id="continueStartBtn" class="btn btn-primary">继续</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 设置继续按钮事件
        modal.querySelector('#continueStartBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * 隐藏其他界面
     */
    hideOtherScreens() {
        // 隐藏开始界面
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // 隐藏游戏界面
        const gameStatus = document.querySelector('.game-status');
        const gameArea = document.querySelector('.game-area');
        if (gameStatus) gameStatus.style.display = 'none';
        if (gameArea) gameArea.style.display = 'none';
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 可以添加全局键盘事件等
    }

    /**
     * 销毁UI
     */
    destroy() {
        if (this.mapContainer && this.mapContainer.parentNode) {
            this.mapContainer.parentNode.removeChild(this.mapContainer);
        }
        this.nodeElements.clear();
    }

    /**
     * 打开商店
     */
    openShop(node) {
        console.log('打开商店:', node.id);
        this.showShopModal(node);
    }

    /**
     * 显示商店模态框
     */
    showShopModal(node) {
        const shopItems = node.data.shopItems || [];
        const currentState = this.towerState.getCurrentState();
        
        const modal = document.createElement('div');
        modal.className = 'shop-modal modal';
        modal.innerHTML = `
            <div class="modal-content shop-content">
                <h2>🏪 商店</h2>
                <p>欢迎光临！你有 ${currentState.playerGold} 金币</p>
                <div class="shop-items">
                    ${shopItems.map(item => `
                        <div class="shop-item ${currentState.playerGold >= item.price ? 'affordable' : 'expensive'}">
                            <div class="item-icon">${item.icon || '📦'}</div>
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-description">${item.description}</div>
                                <div class="item-price">${item.price} 金币</div>
                            </div>
                            <button class="btn btn-primary buy-btn" 
                                    data-item-id="${item.id}" 
                                    data-item-price="${item.price}"
                                    ${currentState.playerGold >= item.price ? '' : 'disabled'}>
                                购买
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button id="leaveShopBtn" class="btn btn-secondary">离开商店</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 设置购买按钮事件
        modal.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const itemPrice = parseInt(e.target.getAttribute('data-item-price'));
                this.buyShopItem(itemId, itemPrice, modal, node);
            });
        });
        
        // 设置离开按钮事件
        modal.querySelector('#leaveShopBtn').addEventListener('click', () => {
            this.towerState.completeNode(node.id);
            document.body.removeChild(modal);
            this.renderMap();
        });
    }

    /**
     * 购买商店物品
     */
    buyShopItem(itemId, price, modal, node) {
        const currentState = this.towerState.getCurrentState();
        
        if (currentState.playerGold >= price) {
            this.towerState.playerGold -= price;
            console.log(`购买了物品: ${itemId}，花费 ${price} 金币`);
            
            // 这里可以添加物品效果处理
            this.showPurchaseSuccess(itemId);
            
            // 重新显示商店（更新金币显示）
            document.body.removeChild(modal);
            this.showShopModal(node);
        }
    }

    /**
     * 显示购买成功消息
     */
    showPurchaseSuccess(itemId) {
        console.log(`成功购买: ${itemId}`);
        // 这里可以添加更详细的购买反馈
    }

    /**
     * 触发随机事件
     */
    triggerEvent(node) {
        console.log('触发随机事件:', node.id);
        this.showEventModal(node);
    }

    /**
     * 显示事件模态框
     */
    showEventModal(node) {
        const eventConfig = node.data.eventConfig || {
            name: '神秘事件',
            description: '你遇到了一个意外的情况...',
            choices: [
                {
                    text: '继续前进',
                    cost: {},
                    rewards: [{ type: 'gold', value: 10 }]
                }
            ]
        };
        
        const modal = document.createElement('div');
        modal.className = 'event-modal modal';
        modal.innerHTML = `
            <div class="modal-content event-content">
                <h2>❓ ${eventConfig.name}</h2>
                <p>${eventConfig.description}</p>
                <div class="event-choices">
                    ${eventConfig.choices.map((choice, index) => `
                        <button class="btn btn-primary event-choice" 
                                data-choice-index="${index}">
                            ${choice.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 设置选择按钮事件
        modal.querySelectorAll('.event-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choiceIndex = parseInt(e.target.getAttribute('data-choice-index'));
                this.handleEventChoice(eventConfig.choices[choiceIndex], modal, node);
            });
        });
    }

    /**
     * 处理事件选择
     */
    handleEventChoice(choice, modal, node) {
        console.log('选择了事件选项:', choice.text);
        
        // 处理消耗
        if (choice.cost.gold) {
            this.towerState.playerGold = Math.max(0, this.towerState.playerGold - choice.cost.gold);
        }
        if (choice.cost.health) {
            this.towerState.playerCurrentHealth = Math.max(1, this.towerState.playerCurrentHealth - choice.cost.health);
        }
        
        // 处理奖励
        choice.rewards.forEach(reward => {
            switch (reward.type) {
                case 'gold':
                    this.towerState.playerGold += reward.value;
                    break;
                case 'health':
                    this.towerState.playerCurrentHealth = Math.min(
                        this.towerState.playerCurrentHealth + reward.value,
                        this.towerState.playerMaxHealth
                    );
                    break;
                // 可以添加更多奖励类型处理
            }
        });
        
        // 完成事件节点
        this.towerState.completeNode(node.id);
        document.body.removeChild(modal);
        this.renderMap();
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.MapUI = MapUI;
} 