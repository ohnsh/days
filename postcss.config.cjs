const postcssJitProps = require('postcss-jit-props')
const OpenProps = require('open-props')
const cssnano = require('cssnano')

module.exports = {
  plugins: [
    postcssJitProps(OpenProps),
    cssnano(),
  ]
}
