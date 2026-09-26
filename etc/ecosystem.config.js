module.exports = {
  apps: [{
    name: 'flask_app',
    script: 'run.py',
    interpreter: 'D:/appInventory/env/Scripts/python.exe',
    cwd: 'D:/appInventory',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: 'D:/appInventory/combined.log',
    out_file: 'D:/appInventory/out.log',
    error_file: 'D:/appInventory/err.log',
    pid_file: 'D:/appInventory/pm2.pid'
  }]
};
