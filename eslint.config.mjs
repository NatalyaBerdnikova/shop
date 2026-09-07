// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Pug-шаблоны не парсятся vue-eslint-parser / eslint-plugin-vue@10,
  // поэтому переменные из <script setup>, используемые только в template lang="pug",
  // ложно помечаются как unused. Отключаем проверку для .vue — иначе ложные срабатывания.
  {
    files: ['**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off'
    }
  }
)
