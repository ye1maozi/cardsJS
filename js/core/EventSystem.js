/**
 * 事件系统 - 用于模块间解耦通信
 */
class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
    }

    /**
     * 注册事件监听器
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} context - 执行上下文
     */
    on(eventName, callback, context = null) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push({ callback, context });
    }

    /**
     * 注册一次性事件监听器
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} context - 执行上下文
     */
    once(eventName, callback, context = null) {
        if (!this.onceListeners.has(eventName)) {
            this.onceListeners.set(eventName, []);
        }
        this.onceListeners.get(eventName).push({ callback, context });
    }

    /**
     * 移除事件监听器
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(eventName, callback) {
        // 移除普通监听器
        if (this.listeners.has(eventName)) {
            const listeners = this.listeners.get(eventName);
            const index = listeners.findIndex(listener => listener.callback === callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }

        // 移除一次性监听器
        if (this.onceListeners.has(eventName)) {
            const listeners = this.onceListeners.get(eventName);
            const index = listeners.findIndex(listener => listener.callback === callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param {string} eventName - 事件名称
     * @param {...any} args - 事件参数
     */
    emit(eventName, ...args) {
        // 触发普通监听器
        if (this.listeners.has(eventName)) {
            const listeners = this.listeners.get(eventName);
            listeners.forEach(listener => {
                try {
                    if (listener.context) {
                        listener.callback.apply(listener.context, args);
                    } else {
                        listener.callback(...args);
                    }
                } catch (error) {
                    console.error(`事件监听器执行错误 [${eventName}]:`, error);
                }
            });
        }

        // 触发一次性监听器
        if (this.onceListeners.has(eventName)) {
            const listeners = this.onceListeners.get(eventName);
            listeners.forEach(listener => {
                try {
                    if (listener.context) {
                        listener.callback.apply(listener.context, args);
                    } else {
                        listener.callback(...args);
                    }
                } catch (error) {
                    console.error(`一次性事件监听器执行错误 [${eventName}]:`, error);
                }
            });
            // 清空一次性监听器
            this.onceListeners.delete(eventName);
        }
    }

    /**
     * 清空所有事件监听器
     */
    clear() {
        this.listeners.clear();
        this.onceListeners.clear();
    }

    /**
     * 获取事件监听器数量
     * @param {string} eventName - 事件名称
     * @returns {number} 监听器数量
     */
    getListenerCount(eventName) {
        let count = 0;
        if (this.listeners.has(eventName)) {
            count += this.listeners.get(eventName).length;
        }
        if (this.onceListeners.has(eventName)) {
            count += this.onceListeners.get(eventName).length;
        }
        return count;
    }
}

// 创建全局事件系统实例
window.EventBus = new EventSystem();

// 预定义事件类型
window.GameEvents = {
    // 游戏状态事件
    GAME_START: 'game:start',
    GAME_END: 'game:end',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_RESET: 'game:reset',
    
    // 角色事件
    CHARACTER_DAMAGE: 'character:damage',
    CHARACTER_HEAL: 'character:heal',
    CHARACTER_DEATH: 'character:death',
    CHARACTER_ENERGY_CHANGE: 'character:energy_change',
    
    // 卡牌事件
    CARD_PLAYED: 'card:played',
    CARD_DRAWN: 'card:drawn',
    CARD_DISCARDED: 'card:discarded',
    
    // 状态效果事件
    STATUS_EFFECT_APPLIED: 'status:applied',
    STATUS_EFFECT_REMOVED: 'status:removed',
    STATUS_EFFECT_EXPIRED: 'status:expired',
    
    // 吟唱事件
    CASTING_START: 'casting:start',
    CASTING_END: 'casting:end',
    CASTING_INTERRUPT: 'casting:interrupt',
    
    // 潜行事件
    STEALTH_ENTER: 'stealth:enter',
    STEALTH_EXIT: 'stealth:exit',
    
    // UI事件
    UI_UPDATE: 'ui:update',
    UI_ERROR: 'ui:error',
    UI_SUCCESS: 'ui:success',
    
    // 配置事件
    CONFIG_LOADED: 'config:loaded',
    CONFIG_ERROR: 'config:error'
}; 