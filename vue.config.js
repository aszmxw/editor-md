// vue.config.js
module.exports = {
  // 选项...
  publicPath: './',
  outputDir: 'editor-md',
  chainWebpack: config => {
    config.module
      .rule('md')
      .test(/.md$/)
      .use('markdown-loader')
      .loader('markdown-loader')
      .loader('html-loader')
  }
}