import { defineConfig } from 'vitest/config'

// Tasks that produce files (sample sites, reports). Vitest is used only because it compiles TSX.
export default defineConfig({ test: { include: ['tasks/*.task.ts'], testTimeout: 120_000 } })
