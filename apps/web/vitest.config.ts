// Plain config so Vitest does not load the Cloudflare plugin from vite.config.ts.
// Worker integration tests (@cloudflare/vitest-pool-workers) come with M1.
import { defineConfig } from 'vitest/config'

export default defineConfig({ test: {} })
