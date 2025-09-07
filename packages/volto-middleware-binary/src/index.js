const applyConfig = (config) => {
  // replace defaults files/image middleware
  if (__SERVER__) {
    const proxyMiddleware = require('./expresss-middleware/proxy-binary').default;
    const middleware = proxyMiddleware();
    middleware.id = 'proxy-middleware';
    config.settings.expressMiddleware = [
      ...config.settings.expressMiddleware.filter(
        (m) =>
          !['filesResourcesProcessor', 'imageResourcesProcessor'].includes(m.id),
      ),
      middleware,
    ];
  }

  return config;
};

export default applyConfig;
