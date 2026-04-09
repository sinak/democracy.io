import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const repoEnvPaths = [
  path.join(repoRoot, '.env'),
  path.join(repoRoot, 'backend/.env'),
]

function readEnvFileValue(filePath: string, key: string) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const match = fileContents.match(new RegExp(`^${key}=(.*)$`, 'm'))

    return match?.[1]?.trim() || null
  } catch {
    return null
  }
}

function readBackendPort() {
  for (const envPath of repoEnvPaths) {
    const portValue = readEnvFileValue(envPath, 'PORT')

    if (portValue) {
      return portValue
    }
  }

  return '3001'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, 'VITE_')
  const backendPort = readBackendPort()
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || `http://localhost:${backendPort}`

  return {
    envDir: repoRoot,
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
