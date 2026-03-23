// backend/src/config/testing.js 
module.exports = () => ({
    auth: {
        jwt: {
            secret: 'test_secret_for_e2e',
            expirationInterval: '1h',
        },
        maxDelay: 100,
    },
    log: {
        level: 'silent',
        enabled: false
    }
});