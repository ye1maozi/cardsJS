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
        // 初始时隐藏游戏界面，等待用户开始游戏
        this.hideGameInterface();
        this.bindEvents();
    }
    
    /**
     * 隐藏游戏界面
     */
    hideGameInterface() {
        const gameArea = document.querySelector('.game-area');
        const gameStatus = document.querySelector('.game-status');
        
        if (gameArea) {
            gameArea.style.display = 'none';
        }
        if (gameStatus) {
            gameStatus.style.display = 'none';
        }
    }
    
    /**
     * 显示游戏界面
     */
    showGameInterface() {
        const gameArea = document.querySelector('.game-area');
        const gameStatus = document.querySelector('.game-status');
        
        if (gameArea) {
            gameArea.style.display = 'flex';
        }
        if (gameStatus) {
            gameStatus.style.display = 'flex';
        }
        
        // 更新UI
        this.updateUI();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
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

        // 关闭模态框按钮 - 修复事件绑定
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) {
            // 移除可能存在的旧事件监听器
            const newCloseBtn = closeModalBtn.cloneNode(true);
            closeModalBtn.parentNode.replaceChild(newCloseBtn, closeModalBtn);
            
            // 重新绑定事件
            newCloseBtn.addEventListener('click', () => {
                console.log('关闭按钮被点击');
                this.hideGameOverModal();
            });
        }
        
        // 英雄技能按钮
        const heroSkillBtn = document.getElementById('heroSkillBtn');
        if (heroSkillBtn) {
            heroSkillBtn.addEventListener('click', () => {
                this.onHeroSkillClicked();
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
        document.getElementById('playerHealthPercent').textContent = info.playerHealthPercent + '%';
        document.getElementById('playerEnergyPercent').textContent = info.playerEnergyPercent + '%';
        document.getElementById('playerExhaustCount').textContent = info.playerExhaustCount;

        // 更新电脑状态
        document.getElementById('computerHealth').textContent = info.computerHealth;
        document.getElementById('computerArmor').textContent = info.computerArmor;
        document.getElementById('computerEnergy').textContent = info.computerEnergy;
        document.getElementById('computerDeckCount').textContent = info.computerDeckCount;
        document.getElementById('computerDiscardCount').textContent = info.computerDiscardCount;
        document.getElementById('computerHandCount').textContent = info.computerHandCount;
        document.getElementById('computerHealthPercent').textContent = info.computerHealthPercent + '%';
        document.getElementById('computerEnergyPercent').textContent = info.computerEnergyPercent + '%';
        document.getElementById('computerExhaustCount').textContent = info.computerExhaustCount;

        // 更新百分比样式（超过100%时高亮显示）
        const playerHealthPercent = document.getElementById('playerHealthPercent');
        const playerEnergyPercent = document.getElementById('playerEnergyPercent');
        const computerHealthPercent = document.getElementById('computerHealthPercent');
        const computerEnergyPercent = document.getElementById('computerEnergyPercent');

        playerHealthPercent.className = info.playerHealthPercent > 100 ? 'percent over-100' : 'percent';
        playerEnergyPercent.className = info.playerEnergyPercent > 100 ? 'percent over-100' : 'percent';
        computerHealthPercent.className = info.computerHealthPercent > 100 ? 'percent over-100' : 'percent';
        computerEnergyPercent.className = info.computerEnergyPercent > 100 ? 'percent over-100' : 'percent';

        // 更新潜行状态显示
        this.updateStealthDisplay();

        // 更新游戏时间信息
        const gameTime = info.gameTime || 0;
        document.getElementById('turnInfo').textContent = `游戏时间: ${gameTime.toFixed(1)}秒`;
        
        // 更新倒计时显示
        document.getElementById('drawCountdown').textContent = `${info.drawCountdown.toFixed(1)}s`;
        document.getElementById('energyCountdown').textContent = `${info.energyCountdown.toFixed(1)}s`;
        
        // 更新英雄技能显示
        this.updateHeroSkillDisplay(info);
        
        // 更新吟唱进度条
        this.updateCastingBars();
        
        // 更新状态效果显示
        this.updateStatusEffects();
    }

    /**
     * 更新潜行状态显示
     */
    updateStealthDisplay() {
        const playerArea = document.querySelector('.player-area');
        const computerArea = document.querySelector('.computer-area');

        // 检查玩家潜行状态
        if (this.gameState.playerCharacter.stealthSystem.isCurrentlyStealthed()) {
            playerArea.classList.add('stealthed');
        } else {
            playerArea.classList.remove('stealthed');
        }

        // 检查电脑潜行状态
        if (this.gameState.computerCharacter.stealthSystem.isCurrentlyStealthed()) {
            computerArea.classList.add('stealthed');
        } else {
            computerArea.classList.remove('stealthed');
        }
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
        const newGameBtn = document.getElementById('newGameBtn');

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
     * 卡牌被点击
     * @param {Card} card - 被点击的卡牌
     * @param {number} index - 卡牌在手牌中的索引
     */
    onCardClicked(card, index) {
        if (this.gameState.gameOver) {
            return;
        }

        // 检查能量是否足够
        if (!card.canPlay(this.gameState.playerEnergy)) {
            this.showError("能量不足！");
            return;
        }

        // 检查目标是否可攻击（考虑潜行和锁定状态）
        const target = this.gameState.computerCharacter;
        if (this.gameState.isAttackCard(card) && !card.canAttackTarget(target)) {
            this.showError('目标处于潜行，无法被选中！');
            return;
        }

        // 设置卡牌在手牌中的索引
        card.handIndex = index;

        // 使用卡牌
        const result = this.gameState.useCard(card, true);
        
        if (result.success) {
            this.addGameLog(result.message);
            if (result.effectResult) {
                this.addGameLog(result.effectResult);
            }
            
            // 更新UI
            this.updateUI();
            
            // 如果是吟唱卡牌，显示吟唱进度
            if (result.isCasting) {
                this.addGameLog("开始吟唱...");
            }
            
            // 检查游戏是否结束
            if (result.gameOver) {
                this.addGameLog(result.gameOverMessage);
                this.showGameOverModal(result.gameOverMessage);
            }
        } else {
            this.showError(result.message);
        }
    }

    /**
     * 显示AI决策结果
     * @param {string} result - AI决策结果
     */
    showAIResult(result) {
        this.addGameLog(result);
        this.updateUI();
    }

    /**
     * 结束回合按钮点击事件（已废弃）
     * @deprecated 游戏不再使用回合制
     */
    onEndTurnClicked() {
        console.warn('onEndTurnClicked已废弃，游戏不再使用回合制');
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
            
            // 重新绑定关闭按钮事件
            this.bindCloseModalEvent();
            
            console.log('游戏结束模态框已显示');
        } else {
            console.error('游戏结束模态框元素未找到');
        }
    }

    /**
     * 隐藏游戏结束模态框
     */
    hideGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('游戏结束模态框已隐藏');
        } else {
            console.error('游戏结束模态框元素未找到');
        }
    }

    /**
     * 绑定关闭模态框事件
     */
    bindCloseModalEvent() {
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) {
            // 移除所有现有的事件监听器
            const newCloseBtn = closeModalBtn.cloneNode(true);
            closeModalBtn.parentNode.replaceChild(newCloseBtn, closeModalBtn);
            
            // 重新绑定事件
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('关闭按钮被点击');
                this.hideGameOverModal();
            });
            
            // 也支持ESC键关闭
            const handleEscKey = (e) => {
                if (e.key === 'Escape') {
                    this.hideGameOverModal();
                    document.removeEventListener('keydown', handleEscKey);
                }
            };
            document.addEventListener('keydown', handleEscKey);
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
    
    /**
     * 更新英雄技能显示
     */
    updateHeroSkillDisplay(info) {
        // 更新电脑英雄技能显示
        const computerSkillDisplay = document.getElementById('computerHeroSkill');
        if (computerSkillDisplay && info.computerHeroSkill) {
            const skill = info.computerHeroSkill;
            const skillNameElement = computerSkillDisplay.querySelector('.skill-name');
            const skillCooldownElement = computerSkillDisplay.querySelector('.skill-cooldown');
            
            skillNameElement.textContent = skill.name;
            
            if (skill.currentCooldown > 0) {
                skillCooldownElement.textContent = `${skill.currentCooldown.toFixed(1)}s`;
                computerSkillDisplay.className = 'hero-skill-display cooldown';
            } else {
                skillCooldownElement.textContent = '可用';
                computerSkillDisplay.className = 'hero-skill-display available';
            }
        }
    }
    
    /**
     * 英雄技能按钮点击事件
     */
    onHeroSkillClicked() {
        const result = this.gameState.useHeroSkill(true);
        
        if (result.success) {
            this.addGameLog(result.message);
            if (result.effectResult) {
                this.addGameLog(`效果: ${result.effectResult}`);
            }
        } else {
            this.showError(result.message);
        }
        
        // 更新UI
        this.updateUI();
    }
} 