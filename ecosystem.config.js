module.exports = {
  apps: [
    {
      name: 'sarkari-global-result-api',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      kill_timeout: 10000,
      listen_timeout: 10000,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
