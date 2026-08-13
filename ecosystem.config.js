module.exports = {
  apps: [
    {
      name: "personal-finance-app",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4030",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      min_uptime: "30s",
      max_restarts: 10,
      max_memory_restart: "800M",
      watch: false,
      time: true,

      env: {
        NODE_ENV: "production",
        PORT: 4030,
      },
    },
  ],
};
