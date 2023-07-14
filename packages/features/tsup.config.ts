import svgJsx from '@svgr/plugin-jsx'
import svgr from 'esbuild-plugin-svgr'
import { defineConfig } from 'tsup'

export default defineConfig([
  {
    name: 'pallad/features',
    entry: ['./src/index.ts'],
    outDir: './dist',
    format: 'esm',
    sourcemap: true,
    clean: true,
    bundle: true,
    dts: true,
    esbuildPlugins: [svgr({ plugins: [svgJsx] })],
    external: ['react-native', 'react-native-web']
  }
])
