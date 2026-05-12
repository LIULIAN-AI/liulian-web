
// import { auth } from '@clerk/nextjs/server';
import { cacheManager } from '@/utils/cacheManager';
import { config } from '@/config/environment';
import { message } from 'antd';

let globalAbortController: AbortController | null = null;
// 定义全局变量用于跟踪超时状态
let abortReasons = new Map<string, string>();
// 正在进行中的请求缓存
let pendingRequests = new Map<string, Promise<any>>();

// 新增：并发请求队列控制
let MAX_CONCURRENT_REQUESTS  = 4; // 最大并发请求数，可根据需要调整
let activeRequestCount = 0; // 当前活跃请求数
let requestQueue: Array<{resolve: Function, reject: Function, request: () => Promise<any>}> = [] // 并发请求队列

// 处理队列中的请求
async function processQueue(){
    // 如果队列为空或已达到最大并发数，直接返回
    if (requestQueue.length === 0 || activeRequestCount >= MAX_CONCURRENT_REQUESTS) {
        return;
    }
    // 从队列中取出下一个请求
    const nextRequest = requestQueue.shift();
    if (!nextRequest) return;
    const {resolve, reject, request} = nextRequest;
    // 增加活跃请求数
    activeRequestCount++;
    try{
        const result = await request();
        resolve(result);
    }catch(error){
        // 调用 reject 函数，将错误传递给调用者
        reject(error);
    }finally{
        // 请求完成后，减少活跃请求数
        activeRequestCount--;
        // 递归调用 processQueue 处理下一个请求
        processQueue().catch(console.error);
    }
}

// 新增：添加请求到队列
function addToQueue(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, request });
        processQueue().catch(console.error);
    });
}

// 清空请求队列（可选，用于紧急情况）
export function clearRequestQueue(): void {
  requestQueue.length = 0;
  activeRequestCount = 0;
}

export function setupGlobalAbortController() {
    if(globalAbortController){
        globalAbortController.abort();
    }
    globalAbortController = new AbortController();
    return globalAbortController.signal;
}

export function abortAllRequests() {
    if (globalAbortController) {
        globalAbortController.abort();
        globalAbortController = null;
    }
    // 清空正在进行中的请求缓存
    pendingRequests.clear();
      // ✅ 新增：清空请求队列
    requestQueue.length = 0;
    activeRequestCount = 0;
    // ✅ 新增：中止所有超时计时器
    abortReasons.clear();
}

// 生成请求唯一key
function getRequestKey(url: string, options: RequestInit): string {
    return `${url}_${JSON.stringify(options)}`;
}

export async function apiClient ({
    url,
    options = {},
    token,
    requireAuth = false,
    useCache = false,
    signal
}:{
    url: string, 
    options: RequestInit, 
    token?: string | null,
    requireAuth?: boolean,
    useCache?: boolean,
    signal?: AbortSignal
}) {
    const BACKEND_API_URL = config.backendApiUrl;
    const fullUrl = BACKEND_API_URL + url;
    // 检查缓存
    if (useCache) {
        const cacheKey = getRequestKey(url, options);
        const cached = cacheManager.get(cacheKey);
        if (cached) {
            console.log(`使用缓存数据: ${url}`);
            return Promise.resolve(cached);
        }
    }
    // 生成请求key
    const requestKey = getRequestKey(url, options);
    
    // 检查是否有正在进行中的相同请求
    if (pendingRequests.has(requestKey)) {
        const existingRequest = pendingRequests.get(requestKey);
        // ✅ 靠谱优化：移除复杂的状态检查，直接复用进行中的请求
        if (existingRequest) {
            console.log(`复用正在进行中的请求: ${url}`);
            return existingRequest;
        }
    }
    const createRequest = async () => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        // 只有在需要认证且提供了 token 时才添加 Authorization header
        if (requireAuth && (token || localStorage.getItem('token'))) {
            headers['Authorization'] = `Bearer ${token || localStorage.getItem('token')}`;
        }
        const newOptions = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };
        console.log("apiClient 请求参数:", { method: newOptions.method, headers: newOptions.headers, body: newOptions.body, url: BACKEND_API_URL + url});
        // 创建请求Promise
        const requestPromise = (async () => {
            try {
                console.log(`发送API请求: ${BACKEND_API_URL}${url}`);
                // 添加超时控制
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {abortReasons.set(fullUrl, 'timeout');controller.abort()}, config.apiTimeout);
                // 如果外部有signal，监听外部signal的中止事件
                if (signal) {
                    signal.addEventListener('abort', () => {
                        abortReasons.set(fullUrl, 'external_abort');
                        controller.abort();
                        clearTimeout(timeoutId);
                    });
                }
                // 如果全局有signal，监听全局signal的中止事件
                if (globalAbortController?.signal) {
                    globalAbortController.signal.addEventListener('abort', () => {
                        abortReasons.set(fullUrl, 'global_abort');
                        controller.abort();
                        clearTimeout(timeoutId);
                    });
                }
                // 添加详细的性能监控
                const startTime = performance.now();
                console.log(`API请求开始: ${url}`, { timestamp: startTime });

                const response = await fetch(BACKEND_API_URL + url, {
                    mode: 'cors',
                    ...newOptions,
                    signal: controller.signal
                });
                const endTime = performance.now();
                console.log(`API请求完成: ${url}`, {
                    duration: endTime - startTime,
                    stalled: endTime - startTime > 2000 ? '可能Stalled' : '正常'
                });
                clearTimeout(timeoutId);
                abortReasons.delete(fullUrl); // 请求成功，清除中止原因
                // 检查响应状态
                if (!response.ok) {
                    console.error(`API请求失败: ${response.status} ${response.statusText}`);
                    if(response.status == 401){
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        message.error('登录过期，请重新登录');
                        // 处理401错误，例如跳转到登录页
                        window.location.href = '/login';
                        return null;
                    }
                    let messageError = `${JSON.stringify(await response.text())}`
                    if(messageError && messageError.indexOf('JWT expired') !== -1){
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        // 触发组件重新渲染而不刷新页面
                        if (typeof window !== 'undefined') {
                            // 触发自定义事件通知组件更新
                            window.dispatchEvent(new CustomEvent('auth-status-changed', {
                                detail: { isLoggedIn: false }
                            }));
                        }
                    }else{
                        if(messageError && messageError.indexOf('News cards not found') !== -1){
                        } else if(response.status == 404) {
                        }else{
                            message.error(`${messageError && messageError !== '""' ? messageError : '接口发生未知错误，请联系管理员'}`);
                        }
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // 获取响应内容类型
                const contentType = response.headers.get('content-type') || '';
                const contentLength = response.headers.get('content-length');

                // 处理空响应
                if (contentLength === '0' || (contentLength === null && !contentType)) {
                    return null;
                }

                // 根据内容类型处理响应
                let result: any;
                if (contentType.includes('application/json')) {
                    // JSON 响应
                    const text = await response.text();
                    if (!text || text.trim() === '') {
                        return null;
                    }
                    try {
                        result = JSON.parse(text);
                    } catch (parseError) {
                        console.warn('JSON解析失败，返回原始文本:', text);
                        result = text;
                    }
                } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
                    // 文本响应
                    result = await response.text();
                    // 处理常见的文本响应
                    if (result === '已发送验证码' || result === 'success' || result === 'ok') {
                        result = { success: true, message: result };
                    }
                } else if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf')) {
                    // 二进制数据
                    result = await response.blob();
                } else {
                    // 未知类型，尝试作为文本处理
                    const text = await response.text();
                    if (text) {
                        // 尝试解析为JSON，如果失败则返回文本
                        try {
                            result = JSON.parse(text);
                        } catch {
                            result = text;
                        }
                    } else {
                        result = null;
                    }
                }

                // 处理空数组和null
                if (result === null || result === undefined) {
                    result = null;
                } else if (Array.isArray(result) && result.length === 0) {
                    // 空数组保持原样，这是有效的数据
                    result = [];
                }

                // 缓存结果
                if (useCache && result !== null && result !== undefined) {
                    const cacheKey = `${url}_${JSON.stringify(options)}`;
                    cacheManager.set(cacheKey, result);
                }

                return result;
            } catch (error: any) {
                console.error('API request failed AbortError:', error);
                if (error.name === 'AbortError') {
                    const reason = abortReasons.get(fullUrl);
                    abortReasons.delete(fullUrl);
                    if (reason === 'timeout') {
                        console.error('API请求超时:', fullUrl);
                        throw new Error('Request timeout');
                    } else {
                        console.error(`API请求被中止 (${reason}):`, fullUrl);
                        return null; // 请求被中止时返回null，避免页面组件崩溃
                    }
                }
                console.error('API request failed:', error);
                throw error;
            }
        })();
        // 将请求Promise添加到pendingRequests
        return requestPromise;
    }
    // 新增：使用并发控制队列
    // return addToQueue(createRequest);
    // 将新请求加入队列，并将返回的Promise缓存到pendingRequests
    const newRequestPromise = addToQueue(createRequest);
    pendingRequests.set(requestKey, newRequestPromise);
    
    // ✅ 简化：只需要finally，不需要catch
    newRequestPromise.finally(() => {
        // 无论成功失败都会执行清理
        if (pendingRequests.get(requestKey) === newRequestPromise) {
            pendingRequests.delete(requestKey);
        }
    });
    
    return newRequestPromise;
};
