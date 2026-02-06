/**
 * PM2 Ecosystem Configuration - 服务端
 * RoundMatch Server
 * 
 * 使用方法：
 * pm2 start ecosystem.config.js          # 启动服务端
 * pm2 stop ecosystem.config.js           # 停止服务端
 * pm2 restart ecosystem.config.js       # 重启服务端
 * pm2 delete ecosystem.config.js        # 删除服务端
 * pm2 logs roundmatch-server             # 查看日志
 */

module.exports = {
  apps: [
    {
      name: 'roundmatch-server',
      script: './src/index.js',
      cwd: __dirname,
      interpreter: 'node',
      node_args: '--max-http-header-size=64000',
      instances: 1, // 单实例，如需多实例可改为 'max' 或数字
      exec_mode: 'fork', // fork 模式（单实例）或 cluster 模式（多实例）
      env: {
        NODE_ENV: 'production',
        PORT: 8300
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8300
      },
      // 日志配置
      error_file: '../logs/server-error.log',
      out_file: '../logs/server-out.log',
      log_file: '../logs/server-combined.log',
      time: true, // 日志添加时间戳
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true, // 合并多实例日志
      // 自动重启配置
      autorestart: true,
      watch: false, // 生产环境关闭文件监听
      max_memory_restart: '500M', // 内存超过 500M 自动重启
      // 其他配置
      min_uptime: '10s', // 最小运行时间，小于此时间重启不算启动失败
      max_restarts: 10, // 最大重启次数
      restart_delay: 4000, // 重启延迟（毫秒）
      // 进程管理
      kill_timeout: 5000, // 优雅关闭超时时间
      wait_ready: false, // 是否等待应用就绪信号
      listen_timeout: 10000, // 监听超时时间
      // 忽略文件变化（生产环境）
      ignore_watch: [
        'node_modules',
        'logs',
        '*.log',
        '.git',
        'migrations',
        'scripts'
      ]
    }
  ]
}
