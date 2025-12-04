import { resolve } from 'path'
import { defineConfig } from 'vite'
import { codecovVitePlugin } from '@codecov/vite-plugin'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			formats: ['es'],
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ['@projectwallace/css-parser'],
		},
	},
	plugins: [
		codecovVitePlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: 'cssLayerTree',
			uploadToken: process.env.CODECOV_TOKEN,
		}),
	],
})
