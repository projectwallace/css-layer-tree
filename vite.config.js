import { resolve } from "path"
import { defineConfig } from "vite"
import { codecovVitePlugin } from "@codecov/vite-plugin"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "cssLayerTree",
      fileName: "css-layer-tree",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['css-tree'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          'css-tree': 'csstree',
        },
      },
    },
  },
  plugins: [
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "cssLayerTree",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
})
