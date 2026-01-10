import { defineConfig } from 'vite';

// GitHub Pages用: リポジトリ名に合わせてbaseを設定
// 例: https://username.github.io/sprite-sheet-template-generator/ の場合
// base: '/sprite-sheet-template-generator/'
export default defineConfig({
  base: '/sprite-sheet-template-generator/',
  build: {
    outDir: 'dist',
  },
});
