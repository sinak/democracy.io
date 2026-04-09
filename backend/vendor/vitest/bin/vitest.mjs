#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

function collectTestFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTestFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      files.push(entryPath);
    }
  }

  return files;
}

const cwd = process.cwd();
const testFiles = collectTestFiles(path.join(cwd, 'test'));
const setupFile = path.join(cwd, 'test', 'setup.ts');

if (testFiles.length === 0) {
  process.exit(0);
}

const args = ['--import', 'tsx'];

if (fs.existsSync(setupFile)) {
  args.push('--import', setupFile);
}

args.push('--test', ...testFiles);

const child = spawn(process.execPath, args, {
  cwd,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
