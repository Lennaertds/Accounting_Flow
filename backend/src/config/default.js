// backend/src/config/default.js

module.exports = () => ({
    port: 9000,
    auth: {
        maxDelay: 300,
        jwt: {
            secret: process.env.AUTH_JWT_SECRET,
            expirationInterval: process.env.AUTH_JWT_EXPIRES_IN || '1h',
        },
    },
    log: {
        level: 'info',
        enabled: true
    }
});