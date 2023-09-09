const env = {};

env.staging = {
    port: 5000,
    name: 'staging',
    secretKey: 'js$$%&nhsij45djk45o$kd&j%i4',
    maxChecks: 5,
    twilio: {
        fromPhone: '+18642728453',
        accountSid: 'AC2d616d4eea215c745b50bd9e85b9e6af',
        authToken: 'e464f4d9c051976d2f2db4e8b7a6c9ec',
    },
};

env.production = {
    port: 4000,
    name: 'production',
    secretKey: 'jk45o$kd&j%i$%&nhsijs$dj454',
    maxChecks: 5,
    twilio: {
        fromPhone: '+18642728453',
        accountSid: 'AC2d616d4eea215c745b50bd9e85b9e6af',
        authToken: 'e464f4d9c051976d2f2db4e8b7a6c9ec',
    },
};
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const envExport = typeof env[currentEnv] === 'object' ? env[currentEnv] : env.staging;

module.exports = envExport;
