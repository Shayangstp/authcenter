export default () => ({
  auth: {
    privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH ?? './keys/jwt-private.pem',
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH ?? './keys/jwt-public.pem',
    accessTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
    refreshTtl: Number(process.env.JWT_REFRESH_TTL ?? 604800),
    issuer: process.env.JWT_ISSUER ?? 'auth-center',
    audience: process.env.JWT_AUDIENCE ?? 'auth-clients',
  },
});
