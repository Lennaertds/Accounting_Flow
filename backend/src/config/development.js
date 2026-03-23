// backend/src/config/development.js 
module.exports = () => ({
    auth: {
        jwt: {
            secret: 'local_development_secret_key',
            expirationInterval: '1d', 
        },
    },
});