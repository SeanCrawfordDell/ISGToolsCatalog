import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Publishes the authoritative catalog as docs/tools.json beside the site, so other pages on the same host
// (the ProSupportTSA Tool Portfolio) read the same tool list the catalog shows, without their own copy.
const publishCatalog = () => ({
  name: 'publish-catalog-json',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'tools.json', source: readFileSync('src/data/tools.json', 'utf8') })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), publishCatalog()],
  base: process.env.VITE_PUBLIC_BASE || '/ISGToolsCatalog/',
  build: {
    outDir: 'docs',
    sourcemap: false,
  },
})
