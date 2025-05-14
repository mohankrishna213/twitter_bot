#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Spawn the Bun process with the correct path
const bun = spawn('C:\\Users\\mohan\\AppData\\Roaming\\npm\\bun', ['run', join(__dirname, 'index.ts')], {
  stdio: 'inherit',
  shell: true
});

bun.on('error', (error) => {
  console.error('Failed to start Bun:', error);
  process.exit(1);
});

bun.on('exit', (code) => {
  process.exit(code);
}); 