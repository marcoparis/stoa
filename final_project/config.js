const crypto = require('crypto');

// Without env secrets a random one is generated: tokens and sessions then last until the process restarts.
const secret = (name) => process.env[name] || crypto.randomBytes(32).toString('hex');

module.exports = {
    port: process.env.PORT || 5000,
    isProduction: process.env.NODE_ENV === 'production',
    jwtSecret: secret('JWT_SECRET'),
    sessionSecret: secret('SESSION_SECRET'),
    jwtExpiresIn: '1h',
};
