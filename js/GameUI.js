/**
 * 游戏UI类 - 对应C#版本的GameUI类
 */
class GameUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.gameLog = [];
        this.gameOverModalShown = false; // 添加游戏结束弹窗显示标志
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
        
        // 显示对手信息
        this.showOpponentInfo();
    }
    
    /**
     * 显示对手信息
     */
    showOpponentInfo() {
        const computerCharacter = this.gameState.computerCharacter;
        if (computerCharacter && computerCharacter.monsterConfig) {
            const monsterConfig = computerCharacter.monsterConfig;
            this.addGameLog(`对手: ${monsterConfig.name} (${monsterConfig.class})`);
            this.addGameLog(`难度: ${'★'.repeat(monsterConfig.difficulty)}`);
            this.addGameLog(`描述: ${monsterConfig.description}`);
        }
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

        // 英雄技能按钮
        const heroSkillBtn = document.getElementById('heroSkillBtn');
        if (heroSkillBtn) {
            heroSkillBtn.addEventListener('click', () => {
                this.onHeroSkillClicked();
            });
        }
        
        // 绑定关闭按钮事件
        this.bindCloseModalEvent();
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

        // 更新玩家属性
        document.getElementById('playerStrength').textContent = this.gameState.playerCharacter.strength;
        document.getElementById('playerAgility').textContent = this.gameState.playerCharacter.agility;
        document.getElementById('playerSpirit').textContent = this.gameState.playerCharacter.spirit;
        document.getElementById('playerHealthRegen').textContent = this.gameState.playerCharacter.healthRegenRate.toFixed(1);
        document.getElementById('playerEnergyRegen').textContent = this.gameState.playerCharacter.energyRegenRate.toFixed(1);

        // 更新电脑属性
        document.getElementById('computerStrength').textContent = this.gameState.computerCharacter.strength;
        document.getElementById('computerAgility').textContent = this.gameState.computerCharacter.agility;
        document.getElementById('computerSpirit').textContent = this.gameState.computerCharacter.spirit;
        document.getElementById('computerHealthRegen').textContent = this.gameState.computerCharacter.healthRegenRate.toFixed(1);
        document.getElementById('computerEnergyRegen').textContent = this.gameState.computerCharacter.energyRegenRate.toFixed(1);

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
            // 在player-field中显示吟唱中的卡牌
            this.showCastingCardInField('player', playerCastingInfo);
        } else {
            this.hideCastingCardInField('player');
        }
        
        // 电脑吟唱进度
        const computerCastingInfo = this.gameState.computerCastingSystem.getCastingInfo();
        if (computerCastingInfo.isCasting) {
            // 在computer-field中显示吟唱中的卡牌
            this.showCastingCardInField('computer', computerCastingInfo);
        } else {
            this.hideCastingCardInField('computer');
        }
    }
    
    /**
     * 在场上显示吟唱中的卡牌
     */
    showCastingCardInField(target, castingInfo) {
        const fieldId = target === 'player' ? 'playerField' : 'computerField';
        const field = document.getElementById(fieldId);
        
        if (!field) return;
        
        // 清空场上内容
        field.innerHTML = '';
        
        // 创建吟唱中的卡牌元素
        const castingCard = document.createElement('div');
        castingCard.className = `card casting-card ${castingInfo.cardClass.toLowerCase()}`;
        castingCard.innerHTML = `
            <div class="card-cost">${castingInfo.energyCost}</div>
            <div class="card-name">${castingInfo.cardName}</div>
            <div class="card-effect">${castingInfo.cardEffect}</div>
            <div class="card-info-row">
                <span class="card-class">${castingInfo.cardClass}</span>
                <div class="card-cast-info">
                    <span class="card-cast-time">${castingInfo.castTime}s</span>
                    <span class="card-cast-type">吟唱</span>
                </div>
            </div>
            <div class="casting-progress-bar">
                <div class="casting-progress-fill" style="width: ${castingInfo.progressPercentage}%"></div>
                <div class="casting-time-remaining">${castingInfo.remainingTime.toFixed(1)}s</div>
            </div>
        `;
        
        field.appendChild(castingCard);
    }
    
    /**
     * 隐藏场上的吟唱卡牌
     */
    hideCastingCardInField(target) {
        const fieldId = target === 'player' ? 'playerField' : 'computerField';
        const field = document.getElementById(fieldId);
        
        if (field) {
            field.innerHTML = '';
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
        let effectsContainer;
        
        if (target === 'player') {
            // 玩家效果显示在player-effects区域
            effectsContainer = document.getElementById('playerEffects');
        } else if (target === 'computer') {
            // 电脑效果显示在computer-effects区域
            effectsContainer = document.getElementById('computerEffects');
        } else {
            // 其他情况保持原有逻辑
            effectsContainer = document.getElementById(`${target}Effects`);
            if (!effectsContainer) {
                effectsContainer = document.createElement('div');
                effectsContainer.id = `${target}Effects`;
                effectsContainer.className = 'status-effects';
                
                const targetArea = target === 'player' ? 'player-area' : 'computer-area';
                const areaElement = document.querySelector(`.${targetArea}`);
                if (areaElement) {
                    areaElement.appendChild(effectsContainer);
                } else {
                    console.error(`找不到目标区域: .${targetArea}`);
                    return;
                }
            }
        }
        
        if (!effectsContainer) {
            console.error(`找不到${target}状态效果容器`);
            return;
        }
        
        // 添加调试信息
        console.log(`更新${target}状态效果显示，效果数量: ${effects.length}`);
        if (effects.length > 0) {
            console.log(`效果详情:`, effects.map(effect => `${effect.type} (${effect.duration.toFixed(1)}s)`));
        }
        
        // 清空容器
        effectsContainer.innerHTML = '';
        
        // 如果没有效果，显示提示信息
        if (effects.length === 0) {
            const noEffectElement = document.createElement('div');
            noEffectElement.className = 'no-effects';
            noEffectElement.textContent = '无状态效果';
            noEffectElement.style.cssText = 'color: #999; font-size: 12px; font-style: italic;';
            effectsContainer.appendChild(noEffectElement);
            return;
        }
        
        // 添加效果元素
        effects.forEach(effect => {
            try {
                const effectElement = document.createElement('div');
                effectElement.className = `effect ${effect.type}`;
                effectElement.innerHTML = `
                    <span class="effect-name">${effect.description || effect.type}</span>
                    <span class="effect-duration">${effect.duration.toFixed(1)}s</span>
                `;
                
                // 确保效果元素可见
                effectElement.style.cssText = `
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: bold;
                    color: white;
                    display: inline-block;
                    margin: 2px;
                    background: ${this.getEffectColor(effect.type)};
                `;
                
                effectsContainer.appendChild(effectElement);
                console.log(`添加效果元素: ${effect.type}`);
            } catch (error) {
                console.error(`创建效果元素失败: ${error.message}`, effect);
            }
        });
    }
    
    /**
     * 获取效果颜色
     */
    getEffectColor(effectType) {
        const colors = {
            'poison': '#8b4513',
            'slow': '#4169e1',
            'stealth': '#2f4f4f',
            'default': '#666'
        };
        return colors[effectType] || colors.default;
    }
    
    /**
     * 更新UI（每帧调用）
     */
    update() {
        // 如果游戏已结束，只更新基本的UI显示，不更新游戏时间
        if (this.gameState.gameOver) {
            // 游戏结束时只更新手牌和日志显示
            this.updatePlayerHand();
            this.updateGameLog();
            
            // 检查是否需要显示游戏结束弹窗
            if (this.gameState.winner && !this.gameOverModalShown) {
                const message = this.gameState.winner === "玩家" ? "玩家获胜！" : "电脑获胜！";
                this.showGameOverModal(message);
                this.gameOverModalShown = true;
            }
        } else {
            // 游戏进行中，正常更新所有UI
            this.updateStatusDisplay();
        }
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

        // 构建吟唱信息
        const castInfo = card.castTime > 0 ? `${card.castTime}s` : '';
        const castType = card.castType || '瞬发';

        cardDiv.innerHTML = `
            <div class="card-cost">${card.energyCost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-effect">${card.effect}</div>
            <div class="card-info-row">
                <span class="card-class">${card.class}</span>
                <div class="card-cast-info">
                    ${castInfo ? `<span class="card-cast-time">${castInfo}</span>` : ''}
                    <span class="card-cast-type">${castType}</span>
                </div>
            </div>
        `;

        // 添加点击事件
        cardDiv.addEventListener('click', () => {
            this.onCardClicked(card, index);
        });

        return cardDiv;
    }

    /**
     * 更新游戏日志显示
     */
    updateGameLog() {
        const gameLogContainer = document.getElementById('gameLog');
        if (!gameLogContainer) return;

        // 清空日志区域
        gameLogContainer.innerHTML = '';

        // 只显示最近的日志条目（限制显示数量）
        const recentLogs = this.gameLog.slice(-20); // 只显示最近20条

        // 添加日志条目
        recentLogs.forEach(logEntry => {
            const logDiv = document.createElement('div');
            logDiv.className = 'log-entry';
            logDiv.textContent = logEntry;
            gameLogContainer.appendChild(logDiv);
        });

        // 平滑滚动到底部
        setTimeout(() => {
            gameLogContainer.scrollTop = gameLogContainer.scrollHeight;
        }, 10);
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
        
        // 限制日志总数量
        if (this.gameLog.length > 100) {
            this.gameLog = this.gameLog.slice(-80); // 保留最近80条
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
        this.gameOverModalShown = false; // 重置游戏结束弹窗显示标志
        this.clearGameLog();
        this.addGameLog("游戏开始！");
        this.updateUI();
    }

    /**
     * 重新开始按钮点击事件
     */
    onRestartClicked() {
        this.hideGameOverModal();
        this.gameOverModalShown = false; // 重置游戏结束弹窗显示标志
        this.onNewGameClicked();
    }

    /**
     * 显示游戏结束模态框
     * @param {string} message - 结束消息
     */
    showGameOverModal(message) {
        console.log(`显示游戏结束弹窗: ${message}`);
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
            // 直接绑定点击事件
            closeModalBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('关闭按钮被点击');
                this.hideGameOverModal();
            };
            
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
        
        // 更新玩家英雄技能按钮
        const heroSkillBtn = document.getElementById('heroSkillBtn');
        if (heroSkillBtn && info.playerHeroSkill) {
            const skill = info.playerHeroSkill;
            
            if (skill.currentCooldown > 0) {
                // 技能在冷却中，显示倒计时并变灰
                heroSkillBtn.textContent = `${skill.name} (${skill.currentCooldown.toFixed(1)}s)`;
                heroSkillBtn.disabled = true;
                heroSkillBtn.classList.add('cooldown');
            } else {
                // 技能可用
                heroSkillBtn.textContent = skill.name;
                heroSkillBtn.disabled = false;
                heroSkillBtn.classList.remove('cooldown');
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