// backend/src/config/production.js 

module.exports = () => ({
    database: {
    },

    auth: {
        maxDelay: 300,
        jwt: {
            expirationInterval: '7d',
        },
    },
    log: {
        level: 'warn',
        enabled: true
    },
});