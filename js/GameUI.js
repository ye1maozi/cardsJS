/**
 * 游戏UI类 - 对应C#版本的GameUI类
 */
class GameUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.gameLog = [];
        this.initializeUI();
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        this.updateUI();
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 结束回合按钮
        const endTurnBtn = document.getElementById('endTurnBtn');
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => {
                this.onEndTurnClicked();
            });
        }

        // 新游戏按钮
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.onNewGameClicked();
            });
        }

        // 重新开始按钮
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.onRestartClicked();
            });
        }

        // 关闭模态框按钮
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideGameOverModal();
            });
        }
    }

    /**
     * 更新UI
     */
    updateUI() {
        this.updateStatusDisplay();
        this.updatePlayerHand();
        this.updateGameLog();
        this.updateButtons();
    }

    /**
     * 更新状态显示
     */
    updateStatusDisplay() {
        const info = this.gameState.getGameInfo();

        // 更新玩家状态
        document.getElementById('playerHealth').textContent = info.playerHealth;
        document.getElementById('playerArmor').textContent = info.playerArmor;
        document.getElementById('playerEnergy').textContent = info.playerEnergy;
        document.getElementById('playerDeckCount').textContent = info.playerDeckCount;
        document.getElementById('playerDiscardCount').textContent = info.playerDiscardCount;

        // 更新电脑状态
        document.getElementById('computerHealth').textContent = info.computerHealth;
        document.getElementById('computerArmor').textContent = info.computerArmor;
        document.getElementById('computerEnergy').textContent = info.computerEnergy;
        document.getElementById('computerDeckCount').textContent = info.computerDeckCount;
        document.getElementById('computerDiscardCount').textContent = info.computerDiscardCount;

        // 更新回合信息
        document.getElementById('turnInfo').textContent = `第${info.currentTurn}回合`;
        
        // 更新吟唱进度条
        this.updateCastingBars();
        
        // 更新状态效果显示
        this.updateStatusEffects();
    }
    
    /**
     * 更新吟唱进度条
     */
    updateCastingBars() {
        // 玩家吟唱进度
        const playerCastingInfo = this.gameState.playerCastingSystem.getCastingInfo();
        if (playerCastingInfo.isCasting) {
            // 显示玩家吟唱进度条
            this.showCastingBar('player', playerCastingInfo);
        } else {
            this.hideCastingBar('player');
        }
        
        // 电脑吟唱进度
        const computerCastingInfo = this.gameState.computerCastingSystem.getCastingInfo();
        if (computerCastingInfo.isCasting) {
            // 显示电脑吟唱进度条
            this.showCastingBar('computer', computerCastingInfo);
        } else {
            this.hideCastingBar('computer');
        }
    }
    
    /**
     * 显示吟唱进度条
     */
    showCastingBar(target, castingInfo) {
        let castingBar = document.getElementById(`${target}CastingBar`);
        if (!castingBar) {
            castingBar = document.createElement('div');
            castingBar.id = `${target}CastingBar`;
            castingBar.className = 'casting-bar';
            castingBar.innerHTML = `
                <div class="casting-progress"></div>
                <div class="casting-text">${castingInfo.cardName}</div>
            `;
            
            const targetArea = target === 'player' ? 'player-area' : 'computer-area';
            document.querySelector(`.${targetArea}`).appendChild(castingBar);
        }
        
        const progressBar = castingBar.querySelector('.casting-progress');
        progressBar.style.width = `${castingInfo.progressPercentage}%`;
        
        const textElement = castingBar.querySelector('.casting-text');
        textElement.textContent = `${castingInfo.cardName} (${castingInfo.remainingTime.toFixed(1)}s)`;
    }
    
    /**
     * 隐藏吟唱进度条
     */
    hideCastingBar(target) {
        const castingBar = document.getElementById(`${target}CastingBar`);
        if (castingBar) {
            castingBar.remove();
        }
    }
    
    /**
     * 更新状态效果显示
     */
    updateStatusEffects() {
        // 更新玩家状态效果
        const playerEffects = this.gameState.playerCharacter.statusEffects;
        this.updateStatusEffectsDisplay('player', playerEffects);
        
        // 更新电脑状态效果
        const computerEffects = this.gameState.computerCharacter.statusEffects;
        this.updateStatusEffectsDisplay('computer', computerEffects);
    }
    
    /**
     * 更新状态效果显示
     */
    updateStatusEffectsDisplay(target, effects) {
        let effectsContainer = document.getElementById(`${target}Effects`);
        if (!effectsContainer) {
            effectsContainer = document.createElement('div');
            effectsContainer.id = `${target}Effects`;
            effectsContainer.className = 'status-effects';
            
            const targetArea = target === 'player' ? 'player-area' : 'computer-area';
            document.querySelector(`.${targetArea}`).appendChild(effectsContainer);
        }
        
        effectsContainer.innerHTML = '';
        
        effects.forEach(effect => {
            const effectElement = document.createElement('div');
            effectElement.className = `effect ${effect.type}`;
            effectElement.innerHTML = `
                <span class="effect-name">${effect.description}</span>
                <span class="effect-duration">${effect.duration.toFixed(1)}s</span>
            `;
            effectsContainer.appendChild(effectElement);
        });
    }
    
    /**
     * 更新UI（每帧调用）
     */
    update() {
        this.updateStatusDisplay();
    }

    /**
     * 更新玩家手牌
     */
    updatePlayerHand() {
        const playerHandContainer = document.getElementById('playerHand');
        if (!playerHandContainer) return;

        // 清空手牌区域
        playerHandContainer.innerHTML = '';

        // 添加手牌
        this.gameState.playerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            playerHandContainer.appendChild(cardElement);
        });
    }

    /**
     * 创建卡牌元素
     * @param {Card} card - 卡牌对象
     * @param {number} index - 卡牌索引
     * @returns {HTMLElement} 卡牌元素
     */
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.class.toLowerCase()}`;
        cardDiv.dataset.cardIndex = index;
        cardDiv.dataset.cardName = card.name;

        // 检查是否可以打出
        const canPlay = card.canPlay(this.gameState.playerEnergy);
        if (!canPlay) {
            cardDiv.classList.add('disabled');
        }

        cardDiv.innerHTML = `
            <div class="card-cost">${card.energyCost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-class">${card.class}</div>
            <div class="card-effect">${card.effect}</div>
            <div class="card-type">${card.castType}</div>
        `;

        // 添加点击事件
        cardDiv.addEventListener('click', () => {
            this.onCardClicked(card, index);
        });

        return cardDiv;
    }

    /**
     * 更新游戏日志
     */
    updateGameLog() {
        const gameLogContainer = document.getElementById('gameLog');
        if (!gameLogContainer) return;

        // 清空日志区域
        gameLogContainer.innerHTML = '';

        // 添加日志条目
        this.gameLog.forEach(logEntry => {
            const logDiv = document.createElement('div');
            logDiv.className = 'log-entry';
            logDiv.textContent = logEntry;
            gameLogContainer.appendChild(logDiv);
        });

        // 滚动到底部
        gameLogContainer.scrollTop = gameLogContainer.scrollHeight;
    }

    /**
     * 更新按钮状态
     */
    updateButtons() {
        const endTurnBtn = document.getElementById('endTurnBtn');
        const newGameBtn = document.getElementById('newGameBtn');

        if (endTurnBtn) {
            endTurnBtn.disabled = this.gameState.gameOver || !this.gameState.isPlayerTurn;
        }

        if (newGameBtn) {
            newGameBtn.disabled = false;
        }
    }

    /**
     * 添加游戏日志
     * @param {string} message - 日志消息
     */
    addGameLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `${timestamp} - ${message}`;
        this.gameLog.push(logEntry);
        
        // 限制日志数量
        if (this.gameLog.length > 50) {
            this.gameLog.shift();
        }
        
        this.updateGameLog();
    }

    /**
     * 清空游戏日志
     */
    clearGameLog() {
        this.gameLog = [];
        this.updateGameLog();
    }

    /**
     * 卡牌点击事件
     * @param {Card} card - 被点击的卡牌
     * @param {number} index - 卡牌索引
     */
    onCardClicked(card, index) {
        if (this.gameState.gameOver || !this.gameState.isPlayerTurn) {
            return;
        }

        if (!card.canPlay(this.gameState.playerEnergy)) {
            this.addGameLog(`能量不足，无法使用 ${card.name}`);
            return;
        }

        // 使用卡牌
        const useResult = this.gameState.useCard(card, true);
        
        if (useResult.success) {
            // 合并使用和效果消息
            const combinedMessage = `${useResult.message} → ${useResult.effectResult}`;
            this.addGameLog(combinedMessage);
            
            // 更新UI
            this.updateUI();
            
            // 检查游戏是否结束
            const gameEndResult = this.gameState.checkGameEnd();
            if (gameEndResult.isOver) {
                this.showGameOverModal(gameEndResult.message);
                return;
            }
            
            // 如果能量耗尽，提示玩家
            if (this.gameState.playerEnergy <= 0) {
                this.addGameLog("玩家能量耗尽，请点击'结束回合'按钮");
            }
        } else {
            this.addGameLog(useResult.message);
        }
    }

    /**
     * 开始电脑回合
     */
    startComputerTurn() {
        this.gameState.isPlayerTurn = false;
        this.updateUI();
        
        // 延迟执行电脑回合，让玩家看到状态变化
        setTimeout(() => {
            const computerTurnResult = this.gameState.computerTurn();
            this.addGameLog(computerTurnResult);
            
            // 更新UI
            this.updateUI();
            
            // 检查游戏是否结束
            const gameEndResult = this.gameState.checkGameEnd();
            if (gameEndResult.isOver) {
                this.showGameOverModal(gameEndResult.message);
                return;
            }
            
            // 开始新回合
            this.gameState.startNewTurn();
            this.gameState.isPlayerTurn = true;
            
            // 合并抽牌消息
            const drawMessage = `第${this.gameState.currentTurn}回合开始，玩家和电脑各抽1张牌`;
            this.addGameLog(drawMessage);
            
            this.updateUI();
        }, 1000);
    }

    /**
     * 结束回合按钮点击事件
     */
    onEndTurnClicked() {
        if (this.gameState.gameOver || !this.gameState.isPlayerTurn) {
            return;
        }

        this.addGameLog("玩家结束回合");
        this.startComputerTurn();
    }

    /**
     * 新游戏按钮点击事件
     */
    onNewGameClicked() {
        this.gameState.reset();
        this.clearGameLog();
        this.addGameLog("游戏开始！");
        this.updateUI();
    }

    /**
     * 重新开始按钮点击事件
     */
    onRestartClicked() {
        this.hideGameOverModal();
        this.onNewGameClicked();
    }

    /**
     * 显示游戏结束模态框
     * @param {string} message - 结束消息
     */
    showGameOverModal(message) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const messageElement = document.getElementById('gameOverMessage');

        if (modal && title && messageElement) {
            title.textContent = '游戏结束';
            messageElement.textContent = message;
            modal.style.display = 'flex';
        }
    }

    /**
     * 隐藏游戏结束模态框
     */
    hideGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    showError(message) {
        console.error(message);
        this.addGameLog(`错误: ${message}`);
    }

    /**
     * 显示成功消息
     * @param {string} message - 成功消息
     */
    showSuccess(message) {
        console.log(message);
        this.addGameLog(message);
    }
} 