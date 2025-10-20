#!/usr/bin/env node

// Converted to CommonJS to match package-level CJS config
const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const here = __dirname;

console.log('🚀 Starting RJB TRANZ Desktop Development Environment...\n');

// Check if Electron is installed (best-effort; spawn('electron') will still work if globally available)
const electronBin = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
if (!existsSync(electronBin)) {
  console.warn('⚠️  Electron binary not found in local node_modules. Continuing, assuming it is available on PATH.');
}

// Verify CommonJS main entry exists
const mainPath = path.join(here, '..', 'electron', 'main.cjs');
if (!existsSync(mainPath)) {
  console.error('❌ Electron main.cjs not found at:', mainPath);
  console.error('   Ensure you have created electron/main.cjs and package.json \"main\" points to it.');
  process.exit(1);
}

// Start Vite dev server
console.log('📦 Starting Vite development server...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  cwd: path.join(here, '..')
});

let viteReady = false;

viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  // Mirror Vite logs to console
  process.stdout.write(`📦 Vite: ${output}`);

  // Heuristic: Vite prints a "Local:" URL with port (default 5173) when ready
  if (!viteReady && output.includes('Local:') && (output.includes('5173') || output.match(/http:\/\/localhost:\d+/))) {
    viteReady = true;
    console.log('\n⚡ Vite ready! Starting Electron...\n');

    // Start Electron after a short delay
    setTimeout(() => {
      const electronProcess = spawn('electron', ['.'], {
        stdio: 'inherit',
        cwd: path.join(here, '..')
      });

      electronProcess.on('close', (code) => {
        console.log('\n🔚 Electron closed with code:', code);
        try {
          viteProcess.kill();
        } catch {}
        process.exit(code ?? 0);
      });
    }, 1000);
  }
});

viteProcess.stderr.on('data', (data) => {
  process.stderr.write(`📦 Vite Error: ${data.toString()}`);
});

viteProcess.on('close', (code) => {
  console.log('\n📦 Vite process closed with code:', code);
  process.exit(code ?? 0);
});

// Handle cleanup
const shutdown = () => {
  console.log('\n🛑 Shutting down development environment...');
  try {
    viteProcess.kill();
  } catch {}
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);