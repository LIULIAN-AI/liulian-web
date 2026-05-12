/**
 * 环境变量配置管理
 * 统一管理所有环境变量，提供类型安全的配置访问
 */

interface EnvironmentConfig {
  // 后端API配置
  backendApiUrl: string;
  
  // 认证配置
  clerkPublishableKey: string;
  clerkSecretKey: string;
  
  // 缓存配置
  cacheDuration: number;
  cacheCleanupInterval: number;
  
  // 性能配置
  apiTimeout: number;
  prefetchDelay: number;
  
  // 开发配置
  nodeEnv: string;
  debugMode: boolean;
  
  // 日志配置
  logLevel: string;
  enablePerformanceMonitoring: boolean;
}

/**
 * 获取环境变量配置
 */
function getEnvironmentConfig(): EnvironmentConfig {
  return {
    // 后端API配置
    backendApiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080',
    
    // 认证配置
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
    
    // 缓存配置
    cacheDuration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000', 10), // 5分钟
    cacheCleanupInterval: parseInt(process.env.NEXT_PUBLIC_CACHE_CLEANUP_INTERVAL || '60000', 10), // 1分钟
    
    // 性能配置
    apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10), // 10秒
    prefetchDelay: parseInt(process.env.NEXT_PUBLIC_PREFETCH_DELAY || '30', 10), // 30毫秒
    
    // 开发配置
    nodeEnv: process.env.NODE_ENV || 'development',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    
    // 日志配置
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  };
}

/**
 * 验证环境变量配置
 */
function validateConfig(config: EnvironmentConfig): void {
  const errors: string[] = [];
  // 验证必需的配置
  if (!config.backendApiUrl) {
    errors.push('NEXT_PUBLIC_BACKEND_API_URL is required');
  }
  
  if (!config.clerkPublishableKey) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required');
  }
  
  if (!config.clerkSecretKey) {
    errors.push('CLERK_SECRET_KEY is required');
  }
  
  // 验证数值配置
  if (config.cacheDuration <= 0) {
    errors.push('NEXT_PUBLIC_CACHE_DURATION must be a positive number');
  }
  
  if (config.apiTimeout <= 0) {
    errors.push('NEXT_PUBLIC_API_TIMEOUT must be a positive number');
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
  }
}

// 获取并验证配置
const config = getEnvironmentConfig();

// 在开发环境下验证配置
if (config.nodeEnv === 'development') {
  try {
    console.log("???????????????????//", config)
    // validateConfig(config);
  } catch (error) {
    console.warn('Environment configuration validation failed:', error);
  }
}

export { config };
export type { EnvironmentConfig };
