import config from '@plone/volto/registry';
import express from 'express';
import proxy from 'express-http-proxy';

const getHost = (req) => {
  if (config.settings.internalApiPath && __SERVER__) {
    return config.settings.internalApiPath;
  } else if (__DEVELOPMENT__ && config.settings.devProxyToApiPath) {
    return config.settings.devProxyToApiPath;
  } else {
    return config.settings.apiPath;
  }
};

const proxyMiddlewareFn = proxy(getHost, {
  memoizeHost: !__DEVELOPMENT__,
  proxyReqPathResolver: function (req) {
    const backend_path = new URL(getHost()).pathname.trimEnd('/');
    return backend_path === '/' ? req.url : `${backend_path}${req.url}`;
  },
  proxyReqOptDecorator: function (proxyReqOpts, req) {
    const authToken = req.universalCookies.get('auth_token');
    if (authToken) {
      proxyReqOpts.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return proxyReqOpts;
  },
  skipToNextHandlerFilter: function (proxyRes) {
    return proxyRes.statusCode === 404;
  },
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const x_forwarded_host = headers['x-forwarded-host'] || userReq.hostname;
    const x_forwarded_for = headers['x-forwarded-for'];
    const remote_host = userReq.connection.remoteAddress;
    if (x_forwarded_for && remote_host) {
      headers['x-forwarded-for'] = x_forwarded_for + ', ' + remote_host;
    } else if (remote_host) {
      headers['x-forwarded-for'] = remote_host;
    } else if (x_forwarded_for) {
      headers['x-forwarded-for'] = x_forwarded_for;
    }
    if (x_forwarded_host) {
      headers['x-forwarded-host'] = x_forwarded_host;
    }
    return headers;
  },
});

export default function proxyMiddleware() {
  const middleware = express.Router();

  // TODO: review route patterns with express 5
  middleware.all(
    [
      '**/@@download/*',
      '**/@@display-file/*',
      '**/@@images/*',
      '**/@@portrait/*',
      '**/@@site-logo/*',
    ],
    proxyMiddlewareFn,
  );
  middleware.id = 'proxyBinaryResourcesProcessor';
  return middleware;
}
