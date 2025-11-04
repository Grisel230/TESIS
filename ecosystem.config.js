module.exports = {
  apps: [
    {
      name: 'emotion-detection-api',
      script: 'app.py',
      interpreter: 'python3',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        FLASK_ENV: 'production',
        FLASK_DEBUG: 'False',
        PORT: 5000
      },
      env_production: {
        FLASK_ENV: 'production',
        FLASK_DEBUG: 'False',
        PORT: 5000,
        NODE_ENV: 'production'
      },
      // Configuración de logs
      log_file: 'logs/pm2/combined.log',
      out_file: 'logs/pm2/out.log',
      error_file: 'logs/pm2/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configuración de reinicio
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Configuración de monitoreo
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Configuración de cluster
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Configuración de variables de entorno
      env_file: '.env.production',
      
      // Configuración de health check
      health_check_grace_period: 30000,
      health_check_fatal_exceptions: true,
      
      // Configuración de cron
      cron_restart: '0 2 * * *', // Reiniciar diariamente a las 2 AM
      
      // Configuración de notificaciones
      notify: true,
      notify_mode: 'always'
    },
    {
      name: 'emotion-detection-worker',
      script: 'worker.py',
      interpreter: 'python3',
      instances: 2,
      exec_mode: 'fork',
      env: {
        WORKER_ENV: 'production'
      },
      env_production: {
        WORKER_ENV: 'production'
      },
      // Configuración de logs
      log_file: 'logs/pm2/worker-combined.log',
      out_file: 'logs/pm2/worker-out.log',
      error_file: 'logs/pm2/worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configuración de reinicio
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '512M',
      
      // Configuración de monitoreo
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Configuración de variables de entorno
      env_file: '.env.production'
    },
    {
      name: 'emotion-detection-scheduler',
      script: 'scheduler.py',
      interpreter: 'python3',
      instances: 1,
      exec_mode: 'fork',
      env: {
        SCHEDULER_ENV: 'production'
      },
      env_production: {
        SCHEDULER_ENV: 'production'
      },
      // Configuración de logs
      log_file: 'logs/pm2/scheduler-combined.log',
      out_file: 'logs/pm2/scheduler-out.log',
      error_file: 'logs/pm2/scheduler-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configuración de reinicio
      max_restarts: 3,
      min_uptime: '10s',
      max_memory_restart: '256M',
      
      // Configuración de monitoreo
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Configuración de variables de entorno
      env_file: '.env.production'
    }
  ],
  
  // Configuración de despliegue
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/emotion-detection.git',
      path: '/var/www/emotion-detection',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pip install -r requirements.txt && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/emotion-detection.git',
      path: '/var/www/emotion-detection-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pip install -r requirements.txt && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
};
