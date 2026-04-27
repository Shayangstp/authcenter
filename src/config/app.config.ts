export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'auth-center',
    port: Number(process.env.PORT ?? 4100),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    throttleTtl: Number(process.env.THROTTLE_TTL ?? 60),
    throttleLimit: Number(process.env.THROTTLE_LIMIT ?? 30),
    cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
  },
});
