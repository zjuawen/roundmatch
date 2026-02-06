/**
 * PM2 Ecosystem Configuration - 管理台（生产模式）
 * RoundMatch Admin Dashboard - Production
 * 
 * 注意：使用 .cjs 扩展名是因为 package.json 中设置了 "type": "module"
 * 使用此配置前需要先运行 npm run build
 * 
 * 使用方法：
 * cd admin
 * npm run build
 * pm2 start ecosystem.prod.config.cjs    # 启动管理台（生产模式）
 * pm2 stop ecosystem.prod.config.cjs       # 停止管理台
 * pm2 restart ecosystem.prod.config.cjs   # 重启管理台
 * pm2 logs roundmatch-admin               # 查看日志
 */

module.exports = {
  apps: [
    {
      name: 'roundmatch-admin',
      script: 'npm',
      args: 'run preview',
      cwd: __dirname,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
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
      watch: false,
      max_memory_restart: '200M',
      // 其他配置
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000
    }
  ]
}
