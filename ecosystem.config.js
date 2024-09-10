module.exports = [{
  script: 'dist/main.js',
  name: 'whatsapp-api',
  exec_mode: 'cluster',
  instances: 4,
  max_memory_restart: '512M',
  watch: false,
  autorestart: true,
}]
