module.exports = {
  apps: [
    {
      name: 'data-fiscal-app',
      script: 'npm',
      args: 'start',
      cwd: '/home/k8s/app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: 'seniat-jwt-secret-key-2024',
        JWT_EXPIRES_IN: '24h',
        ORACLE_HOST: '172.16.32.73',
        ORACLE_PORT: '1521',
        ORACLE_DATABASE: 'DWREPO',
        ORACLE_USERNAME: 'CGBRITO',
        ORACLE_PASSWORD: 'cgkbrito',
        ORACLE_SCHEMA: 'CGBRITO',
        NEXT_PUBLIC_API_URL: 'http://172.16.56.23:3001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: 'seniat-jwt-secret-key-2024',
        JWT_EXPIRES_IN: '24h',
        ORACLE_HOST: '172.16.32.73',
        ORACLE_PORT: '1521',
        ORACLE_DATABASE: 'DWREPO',
        ORACLE_USERNAME: 'CGBRITO',
        ORACLE_PASSWORD: 'cgkbrito',
        ORACLE_SCHEMA: 'CGBRITO',
        NEXT_PUBLIC_API_URL: 'http://172.16.56.23:3001'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 