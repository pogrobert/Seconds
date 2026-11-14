import { defineConfig } from 'vitest/config'

// Real-browser checks: every block, variant and test case in Chromium at three widths.
export default defineConfig({
  test: { include: ['test/browser/*.test.ts'], testTimeout: 120_000, hookTimeout: 60_000 },
})
