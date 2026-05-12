const { withContentlayer } = require('next-contentlayer')
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 解决HMR错误问题
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 在开发模式下，添加一些配置来解决HMR问题
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
      // 修复HMR相关的DOM操作问题
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    
    // 生产环境优化
    if (!dev && !isServer) {
      // 启用代码分割优化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
      
      // 减少bundle大小
      config.optimization.minimize = true
    }
    
    return config
  },
  
  // 实验性功能配置
  experimental: {
    // 启用新的CSS处理方式
    optimizeCss: true,
    // 修复HMR问题
    esmExternals: false,
  },
  
  // 开发模式配置
  ...(process.env.NODE_ENV === 'development' && {
    // 禁用严格模式以避免HMR问题
    reactStrictMode: false,
  }),
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    unoptimized: true,
    domains: ['localhost', 'http://47.83.183.119:8080'], // 确保包含你的域名
    path: '/_next/image',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 允许所有https域名，生产环境应限制为具体域名
      },
    ],
  },
  
  // 压缩配置
  compress: true,
  // 输出配置
  // output: 'standalone',
  // ESLint 9.x removed `useEslintrc` and `extensions` options that Next.js 14
  // still passes internally — skip ESLint during `next build` to avoid the crash.
  // Linting is handled separately in CI via the dedicated lint step.
  eslint: {
    ignoreDuringBuilds: true,
  },
}
module.exports = withNextIntl(withContentlayer(nextConfig))