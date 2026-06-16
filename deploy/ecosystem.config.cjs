const path = require('path')

module.exports = {
  apps: [
    {
      name: 'farmlink-web',
      cwd: path.resolve(__dirname, '../apps/web'),
      script: 'pnpm',
      args: 'exec next start -p 3010',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3010',
        NEXT_PUBLIC_API_URL: 'https://api.yourdomain.com',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3010',
        NEXT_PUBLIC_API_URL: 'https://api.yourdomain.com',
      },
    },
  ],
}
