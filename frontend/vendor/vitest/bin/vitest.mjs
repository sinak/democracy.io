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

    if (entry.isFile() && /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

const cwd = process.cwd();
const testFiles = collectTestFiles(path.join(cwd, 'test'));
const setupFile = path.join(cwd, 'test', 'setup.ts');
const localTsxLoader = path.join(cwd, 'node_modules', 'tsx', 'dist', 'loader.mjs');
const siblingTsxLoader = path.join(cwd, '..', 'backend', 'node_modules', 'tsx', 'dist', 'loader.mjs');
const tsconfigPath = path.join(cwd, 'tsconfig.app.json');

if (testFiles.length === 0) {
  process.exit(0);
}

const args = [];

if (fs.existsSync(localTsxLoader)) {
  args.push('--import', localTsxLoader);
} else if (fs.existsSync(siblingTsxLoader)) {
  args.push('--import', siblingTsxLoader);
} else {
  args.push('--experimental-strip-types');
}

if (fs.existsSync(setupFile)) {
  args.push('--import', setupFile);
}

args.push('--test', ...testFiles);

const child = spawn(process.execPath, args, {
  cwd,
  env: {
    ...process.env,
    ...(fs.existsSync(tsconfigPath) ? { TSX_TSCONFIG_PATH: tsconfigPath } : {}),
  },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
