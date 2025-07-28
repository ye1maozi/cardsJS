/**
 * 统一错误处理系统
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxErrorLogSize = 100;
        this.errorCallbacks = new Map();
        this.isInitialized = false;
    }

    /**
     * 初始化错误处理器
     */
    init() {
        if (this.isInitialized) return;

        // 捕获全局错误
        window.addEventListener('error', (event) => {
            this.handleError(event.error || new Error(event.message), {
                type: 'uncaught',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(new Error(event.reason), {
                type: 'unhandledrejection',
                reason: event.reason
            });
        });

        // 捕获控制台错误
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError(new Error(args.join(' ')), {
                type: 'console',
                args: args
            });
            originalConsoleError.apply(console, args);
        };

        this.isInitialized = true;
        console.log('错误处理器已初始化');
    }

    /**
     * 处理错误
     * @param {Error} error - 错误对象
     * @param {Object} context - 错误上下文
     */
    handleError(error, context = {}) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: Date.now(),
            context: context
        };

        // 添加到错误日志
        this.errorLog.push(errorInfo);
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }

        // 触发错误事件
        if (window.EventBus) {
            window.EventBus.emit('error:occurred', errorInfo);
        }

        // 调用注册的错误回调
        this.errorCallbacks.forEach((callback, type) => {
            if (type === 'all' || type === context.type) {
                try {
                    callback(errorInfo);
                } catch (callbackError) {
                    console.error('错误回调执行失败:', callbackError);
                }
            }
        });

        // 输出错误信息
        this.logError(errorInfo);
    }

    /**
     * 注册错误回调
     * @param {string} type - 错误类型
     * @param {Function} callback - 回调函数
     */
    onError(type, callback) {
        this.errorCallbacks.set(type, callback);
    }

    /**
     * 移除错误回调
     * @param {string} type - 错误类型
     */
    offError(type) {
        this.errorCallbacks.delete(type);
    }

    /**
     * 记录错误
     * @param {Object} errorInfo - 错误信息
     */
    logError(errorInfo) {
        const timestamp = new Date(errorInfo.timestamp).toISOString();
        console.group(`错误 [${timestamp}]`);
        console.error('消息:', errorInfo.message);
        console.error('类型:', errorInfo.name);
        console.error('上下文:', errorInfo.context);
        if (errorInfo.stack) {
            console.error('堆栈:', errorInfo.stack);
        }
        console.groupEnd();
    }

    /**
     * 获取错误日志
     * @param {number} limit - 限制数量
     * @returns {Array} 错误日志
     */
    getErrorLog(limit = 10) {
        return this.errorLog.slice(-limit);
    }

    /**
     * 清空错误日志
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * 创建自定义错误
     * @param {string} message - 错误消息
     * @param {string} type - 错误类型
     * @param {Object} context - 错误上下文
     * @returns {Error} 错误对象
     */
    createError(message, type = 'custom', context = {}) {
        const error = new Error(message);
        error.type = type;
        error.context = context;
        return error;
    }

    /**
     * 安全执行函数
     * @param {Function} fn - 要执行的函数
     * @param {Array} args - 函数参数
     * @param {Object} context - 执行上下文
     * @returns {any} 执行结果
     */
    safeExecute(fn, args = [], context = null) {
        try {
            if (context) {
                return fn.apply(context, args);
            } else {
                return fn(...args);
            }
        } catch (error) {
            this.handleError(error, {
                type: 'safeExecute',
                function: fn.name || 'anonymous',
                args: args,
                context: context
            });
            return null;
        }
    }

    /**
     * 异步安全执行函数
     * @param {Function} fn - 要执行的异步函数
     * @param {Array} args - 函数参数
     * @param {Object} context - 执行上下文
     * @returns {Promise} 执行结果
     */
    async safeExecuteAsync(fn, args = [], context = null) {
        try {
            if (context) {
                return await fn.apply(context, args);
            } else {
                return await fn(...args);
            }
        } catch (error) {
            this.handleError(error, {
                type: 'safeExecuteAsync',
                function: fn.name || 'anonymous',
                args: args,
                context: context
            });
            return null;
        }
    }

    /**
     * 验证对象属性
     * @param {Object} obj - 要验证的对象
     * @param {Array} requiredProps - 必需的属性
     * @returns {boolean} 是否有效
     */
    validateObject(obj, requiredProps = []) {
        if (!obj || typeof obj !== 'object') {
            this.handleError(new Error('对象无效'), {
                type: 'validation',
                object: obj,
                requiredProps: requiredProps
            });
            return false;
        }

        for (const prop of requiredProps) {
            if (!(prop in obj)) {
                this.handleError(new Error(`缺少必需属性: ${prop}`), {
                    type: 'validation',
                    object: obj,
                    missingProp: prop,
                    requiredProps: requiredProps
                });
                return false;
            }
        }

        return true;
    }

    /**
     * 验证函数参数
     * @param {Array} args - 函数参数
     * @param {Array} expectedTypes - 期望的类型
     * @returns {boolean} 是否有效
     */
    validateArguments(args, expectedTypes = []) {
        if (args.length !== expectedTypes.length) {
            this.handleError(new Error(`参数数量不匹配: 期望 ${expectedTypes.length}, 实际 ${args.length}`), {
                type: 'validation',
                args: args,
                expectedTypes: expectedTypes
            });
            return false;
        }

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const expectedType = expectedTypes[i];
            
            if (typeof arg !== expectedType) {
                this.handleError(new Error(`参数类型不匹配: 参数 ${i} 期望 ${expectedType}, 实际 ${typeof arg}`), {
                    type: 'validation',
                    args: args,
                    expectedTypes: expectedTypes,
                    invalidIndex: i
                });
                return false;
            }
        }

        return true;
    }

    /**
     * 性能监控
     * @param {string} name - 操作名称
     * @param {Function} fn - 要监控的函数
     * @param {Array} args - 函数参数
     * @param {Object} context - 执行上下文
     * @returns {any} 执行结果
     */
    monitorPerformance(name, fn, args = [], context = null) {
        const startTime = performance.now();
        
        try {
            let result;
            if (context) {
                result = fn.apply(context, args);
            } else {
                result = fn(...args);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // 如果执行时间超过阈值，记录警告
            if (duration > 100) { // 100ms阈值
                this.handleError(new Error(`性能警告: ${name} 执行时间 ${duration.toFixed(2)}ms`), {
                    type: 'performance',
                    operation: name,
                    duration: duration,
                    threshold: 100
                });
            }

            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.handleError(error, {
                type: 'performance',
                operation: name,
                duration: duration,
                failed: true
            });
            
            throw error;
        }
    }

    /**
     * 销毁错误处理器
     */
    destroy() {
        this.errorCallbacks.clear();
        this.errorLog = [];
        this.isInitialized = false;
    }
}

// 创建全局错误处理器实例
window.ErrorHandler = new ErrorHandler();

// 预定义错误类型
window.ErrorTypes = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    CONFIG: 'config',
    GAME_LOGIC: 'gameLogic',
    UI: 'ui',
    PERFORMANCE: 'performance',
    UNCAUGHT: 'uncaught',
    UNHANDLED_REJECTION: 'unhandledrejection',
    CONSOLE: 'console',
    CUSTOM: 'custom'
}; 