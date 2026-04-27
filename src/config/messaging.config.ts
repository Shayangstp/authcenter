export default () => ({
  messaging: {
    rabbitmqHost: process.env.RABBITMQ_HOST ?? 'localhost',
    rabbitmqPort: Number(process.env.RABBITMQ_PORT ?? 55672),
    rabbitmqUsername: process.env.RABBITMQ_USERNAME ?? 'auth_center',
    rabbitmqPassword: process.env.RABBITMQ_PASSWORD ?? 'auth_center',
    rabbitmqVhost: process.env.RABBITMQ_VHOST ?? '/',
  },
});
