/**
 * 状态管理器 - 统一管理游戏状态和状态变更
 */
class StateManager {
    constructor() {
        this.state = {
            game: {
                isRunning: false,
                isPaused: false,
                gameTime: 0,
                gameOver: false,
                winner: null
            },
            player: {
                health: 30,
                maxHealth: 30,
                energy: 1,
                maxEnergy: 10,
                armor: 0,
                hand: [],
                deck: [],
                discardPile: [],
                exhaustPile: [],
                statusEffects: [],
                isStealthed: false
            },
            computer: {
                health: 30,
                maxHealth: 30,
                energy: 1,
                maxEnergy: 10,
                armor: 0,
                hand: [],
                deck: [],
                discardPile: [],
                exhaustPile: [],
                statusEffects: [],
                isStealthed: false
            },
            casting: {
                player: {
                    isCasting: false,
                    cardName: '',
                    remainingTime: 0,
                    totalTime: 0
                },
                computer: {
                    isCasting: false,
                    cardName: '',
                    remainingTime: 0,
                    totalTime: 0
                }
            },
            ui: {
                lastUpdate: 0,
                needsUpdate: false
            }
        };
        
        this.subscribers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
    }

    /**
     * 获取状态
     * @param {string} path - 状态路径，如 'game.isRunning'
     * @returns {any} 状态值
     */
    get(path) {
        return this.getNestedValue(this.state, path);
    }

    /**
     * 设置状态
     * @param {string} path - 状态路径
     * @param {any} value - 新值
     * @param {boolean} silent - 是否静默更新（不触发事件）
     */
    set(path, value, silent = false) {
        const oldValue = this.get(path);
        this.setNestedValue(this.state, path, value);
        
        if (!silent) {
            this.notifySubscribers(path, oldValue, value);
            this.addToHistory(path, oldValue, value);
        }
    }

    /**
     * 批量更新状态
     * @param {Object} updates - 更新对象
     * @param {boolean} silent - 是否静默更新
     */
    batchUpdate(updates, silent = false) {
        const changes = [];
        
        for (const [path, value] of Object.entries(updates)) {
            const oldValue = this.get(path);
            this.setNestedValue(this.state, path, value);
            changes.push({ path, oldValue, newValue: value });
        }
        
        if (!silent) {
            changes.forEach(change => {
                this.notifySubscribers(change.path, change.oldValue, change.newValue);
                this.addToHistory(change.path, change.oldValue, change.newValue);
            });
        }
    }

    /**
     * 订阅状态变更
     * @param {string} path - 状态路径
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消订阅函数
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);
        
        // 返回取消订阅函数
        return () => {
            const callbacks = this.subscribers.get(path);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }

    /**
     * 获取嵌套值
     * @param {Object} obj - 对象
     * @param {string} path - 路径
     * @returns {any} 值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * 设置嵌套值
     * @param {Object} obj - 对象
     * @param {string} path - 路径
     * @param {any} value - 值
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * 通知订阅者
     * @param {string} path - 状态路径
     * @param {any} oldValue - 旧值
     * @param {any} newValue - 新值
     */
    notifySubscribers(path, oldValue, newValue) {
        // 通知精确路径的订阅者
        if (this.subscribers.has(path)) {
            this.subscribers.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('状态订阅者回调错误:', error);
                }
            });
        }

        // 通知父路径的订阅者
        const pathParts = path.split('.');
        while (pathParts.length > 1) {
            pathParts.pop();
            const parentPath = pathParts.join('.');
            if (this.subscribers.has(parentPath)) {
                this.subscribers.get(parentPath).forEach(callback => {
                    try {
                        callback(this.get(parentPath), null, parentPath);
                    } catch (error) {
                        console.error('状态订阅者回调错误:', error);
                    }
                });
            }
        }

        // 触发全局事件
        if (window.EventBus) {
            window.EventBus.emit('state:changed', {
                path,
                oldValue,
                newValue,
                timestamp: Date.now()
            });
        }
    }

    /**
     * 添加到历史记录
     * @param {string} path - 状态路径
     * @param {any} oldValue - 旧值
     * @param {any} newValue - 新值
     */
    addToHistory(path, oldValue, newValue) {
        this.history.push({
            path,
            oldValue,
            newValue,
            timestamp: Date.now()
        });

        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * 获取状态历史
     * @param {string} path - 状态路径（可选）
     * @param {number} limit - 限制数量
     * @returns {Array} 历史记录
     */
    getHistory(path = null, limit = 10) {
        let history = this.history;
        
        if (path) {
            history = history.filter(record => record.path === path);
        }
        
        return history.slice(-limit);
    }

    /**
     * 撤销最后一次状态变更
     * @param {string} path - 状态路径
     * @returns {boolean} 是否成功撤销
     */
    undo(path) {
        const history = this.getHistory(path, 1);
        if (history.length > 0) {
            const lastChange = history[0];
            this.set(lastChange.path, lastChange.oldValue, true);
            return true;
        }
        return false;
    }

    /**
     * 获取完整状态快照
     * @returns {Object} 状态快照
     */
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * 从快照恢复状态
     * @param {Object} snapshot - 状态快照
     * @param {boolean} silent - 是否静默更新
     */
    restoreFromSnapshot(snapshot, silent = false) {
        const oldState = this.getSnapshot();
        this.state = JSON.parse(JSON.stringify(snapshot));
        
        if (!silent) {
            // 触发所有状态变更事件
            this.triggerFullUpdate(oldState);
        }
    }

    /**
     * 触发完整更新
     * @param {Object} oldState - 旧状态
     */
    triggerFullUpdate(oldState) {
        const changes = this.compareStates(oldState, this.state);
        changes.forEach(change => {
            this.notifySubscribers(change.path, change.oldValue, change.newValue);
        });
    }

    /**
     * 比较两个状态
     * @param {Object} oldState - 旧状态
     * @param {Object} newState - 新状态
     * @returns {Array} 变更列表
     */
    compareStates(oldState, newState) {
        const changes = [];
        this.findChanges('', oldState, newState, changes);
        return changes;
    }

    /**
     * 查找状态变更
     * @param {string} path - 当前路径
     * @param {Object} oldObj - 旧对象
     * @param {Object} newObj - 新对象
     * @param {Array} changes - 变更列表
     */
    findChanges(path, oldObj, newObj, changes) {
        const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
        
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            const oldValue = oldObj?.[key];
            const newValue = newObj?.[key];
            
            if (oldValue !== newValue) {
                if (typeof oldValue === 'object' && typeof newValue === 'object' && 
                    oldValue !== null && newValue !== null) {
                    this.findChanges(currentPath, oldValue, newValue, changes);
                } else {
                    changes.push({
                        path: currentPath,
                        oldValue,
                        newValue
                    });
                }
            }
        }
    }

    /**
     * 重置状态
     */
    reset() {
        this.state = {
            game: {
                isRunning: false,
                isPaused: false,
                gameTime: 0,
                gameOver: false,
                winner: null
            },
            player: {
                health: 30,
                maxHealth: 30,
                energy: 1,
                maxEnergy: 10,
                armor: 0,
                hand: [],
                deck: [],
                discardPile: [],
                exhaustPile: [],
                statusEffects: [],
                isStealthed: false
            },
            computer: {
                health: 30,
                maxHealth: 30,
                energy: 1,
                maxEnergy: 10,
                armor: 0,
                hand: [],
                deck: [],
                discardPile: [],
                exhaustPile: [],
                statusEffects: [],
                isStealthed: false
            },
            casting: {
                player: {
                    isCasting: false,
                    cardName: '',
                    remainingTime: 0,
                    totalTime: 0
                },
                computer: {
                    isCasting: false,
                    cardName: '',
                    remainingTime: 0,
                    totalTime: 0
                }
            },
            ui: {
                lastUpdate: 0,
                needsUpdate: false
            }
        };
        
        this.history = [];
        this.triggerFullUpdate({});
    }

    /**
     * 销毁状态管理器
     */
    destroy() {
        this.subscribers.clear();
        this.history = [];
        this.state = null;
    }
}

// 创建全局状态管理器实例
window.StateManager = new StateManager(); 