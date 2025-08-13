#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🌾 Starting Adonai Farm Management System...');

// Change to backend directory and start the server
process.chdir(path.join(__dirname, 'backend'));

console.log('📦 Installing backend dependencies...');
const install = spawn('npm', ['install'], { stdio: 'inherit' });

install.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
  
  console.log('🗄️  Setting up database...');
  const migrate = spawn('npm', ['run', 'migrate'], { stdio: 'inherit' });
  
  migrate.on('close', (migrateCode) => {
    if (migrateCode !== 0) {
      console.error('❌ Failed to setup database');
      process.exit(1);
    }
    
    console.log('🚀 Starting server...');
    const server = spawn('npm', ['start'], { stdio: 'inherit' });
    
    server.on('close', (serverCode) => {
      console.log(`Server exited with code ${serverCode}`);
    });
  });
});