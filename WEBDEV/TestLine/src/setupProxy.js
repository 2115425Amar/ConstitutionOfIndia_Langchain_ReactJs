const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/quiz',
    createProxyMiddleware({
      target: 'https://api.jsonserve.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/quiz': '/Uw5CrX'
      },
      secure: false,
      logLevel: 'debug',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      onProxyRes: function (proxyRes) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
      onError: function (err, req, res) {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
      }
    })
  );
}; 