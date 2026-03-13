import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const isGitHubPages = process.env.DEPLOY_TARGET === 'gh-pages'

  return {
    plugins: [react()],
    base: isGitHubPages ? '/chatbot/' : '/',
  }
})
