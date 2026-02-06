/**
 * PM2 Ecosystem Configuration - 管理台（开发模式）
 * RoundMatch Admin Dashboard
 * 
 * 注意：使用 .cjs 扩展名是因为 package.json 中设置了 "type": "module"
 * 
 * 使用方法：
 * pm2 start ecosystem.config.cjs          # 启动管理台（开发模式）
 * pm2 stop ecosystem.config.cjs           # 停止管理台
 * pm2 restart ecosystem.config.cjs       # 重启管理台
 * pm2 delete ecosystem.config.cjs        # 删除管理台
 * pm2 logs roundmatch-admin              # 查看日志
 */

module.exports = {
  apps: [
    {
      name: 'roundmatch-admin',
      script: 'npm',
      args: 'run dev',
      cwd: __dirname,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      // 日志配置
      error_file: '../logs/admin-error.log',
      out_file: '../logs/admin-out.log',
      log_file: '../logs/admin-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 自动重启配置
      autorestart: true,
      watch: false, // 生产环境建议关闭，Vite 自带 HMR
      max_memory_restart: '300M',
      // 其他配置
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      // 忽略文件变化
      ignore_watch: [
        'node_modules',
        'dist',
        'logs',
        '*.log',
        '.git'
      ]
    }
  ]
}
