const proxy = require('http-proxy-middleware')

module.exports = (app) => {
  app.use(proxy('/api', {
    target: "http://localhost:10000",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/"
    },
    timeout: 5000
  }))
}
