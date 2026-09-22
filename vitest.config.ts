import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

const root = fileURLToPath(new URL('.', import.meta.url))
const app = fileURLToPath(new URL('./app', import.meta.url))
const shared = fileURLToPath(new URL('./shared', import.meta.url))

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '~~': root,
            '@@': root,
            '~': app,
            '@': app,
            '#shared': shared
          }
        },
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node'
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              rootDir: root,
              domEnvironment: 'happy-dom'
            }
          }
        }
      })
    ],
    coverage: {
      enabled: true,
      provider: 'v8'
    }
  }
})
