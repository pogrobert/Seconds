import { defineConfig } from 'vitest/config'

// Fast checks only. The real-browser checks run with `pnpm test:browser` (vitest.browser.config.ts).
export default defineConfig({ test: { include: ['test/*.test.ts'] } })
