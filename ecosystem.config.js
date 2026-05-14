module.exports = {
  apps: [
    {
      name: 'liulian-web-app', // 你的应用名称，在 PM2 列表中显示
      // script: 'node_modules/next/dist/bin/next', // Next.js 的启动脚本路径
      script: 'node_modules/.bin/next',
      args: 'start -p 3000', // 传递给脚本的参数，即 `next start`
      exec_mode: 'fork',
      instances: 1,
      // instances: 'max', // 使用所有可用的 CPU 核心（集群模式）
      // exec_mode: 'cluster', // 启用集群模式，充分利用多核CPU
      autorestart: true, // 应用崩溃时自动重启
      watch: false, // 通常情况下，生产环境不启用监听文件变化
      max_memory_restart: '2G', // 如果应用内存超过 1G，自动重启
      node_args: [
        '--max-old-space-size=4096',  // 2GB内存限制
        '--optimize-for-size',
        '--max-semi-space-size=256'
      ],
      env: {
        // 生产环境的环境变量
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_test_dG9wLWZlcnJldC0xNS5jbGVyay5hY2NvdW50cy5kZXYk',
        CLERK_SECRET_KEY:'sk_test_Np7aS9VFKsuuWJAW2JYGxxt6BuKNH2owID22EsuUrL',
        NODE_ENV: 'production',
        PORT: 3000, // 你的应用运行的端口
        HOST: '0.0.0.0',
        UV_THREADPOOL_SIZE: 8,  // 增加线程池大小
        NEXT_TELEMETRY_DISABLED: '1', // 禁用遥测
        NODE_OPTIONS: '--max-http-header-size=16384'
      },
      env_production: {
        // 可以专门为 `pm2 start ecosystem.config.js --env production` 设置变量
        NODE_ENV: 'production',
      },
    },
  ],
};