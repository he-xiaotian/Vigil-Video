const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: true,
  configureWebpack: {
    devtool: 'source-map',
  },
})
