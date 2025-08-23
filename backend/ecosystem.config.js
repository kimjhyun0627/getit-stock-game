module.exports = {
  apps: [
    {
      name: 'stock-it-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Memory management
      max_memory_restart: '300M',
      
      // Watch mode (development)
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Auto restart
      autorestart: true,
      
      // Environment variables
      env_file: '.env',
      
      // PM2 specific
      pmx: true,
      merge_logs: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Cron restart (optional - restart every 24 hours)
      cron_restart: '0 0 * * *',
    },
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/username/stock-it-game.git',
      path: '/var/www/stock-it-game',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
