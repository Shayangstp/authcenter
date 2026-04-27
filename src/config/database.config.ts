export default () => ({
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 55432),
    username: process.env.DB_USERNAME ?? 'auth_center',
    password: process.env.DB_PASSWORD ?? 'auth_center',
    name: process.env.DB_NAME ?? 'auth_center',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    redisHost: process.env.REDIS_HOST ?? 'localhost',
    redisPort: Number(process.env.REDIS_PORT ?? 56379),
    redisPassword: process.env.REDIS_PASSWORD ?? '',
  },
});
