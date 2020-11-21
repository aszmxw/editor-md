// vue.config.js
module.exports = {
  // 选项...
  publicPath: './',
  outputDir: 'docs',
  chainWebpack: config => {
    config.module
      .rule('md')
      .test(/.md$/)
      .use('markdown-loader')
      .loader('markdown-loader')
      .loader('html-loader')
  }
}