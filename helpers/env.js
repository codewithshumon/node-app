const env = {};

env.staging = {
    port: 5000,
    name: 'staging',
    secretKey: 'js$$%&nhsij45djk45o$kd&j%i4',
    maxChecks: 5,
};

env.production = {
    port: 4000,
    name: 'production',
    secretKey: 'jk45o$kd&j%i$%&nhsijs$dj454',
    maxChecks: 5,
};
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const envExport = typeof env[currentEnv] === 'object' ? env[currentEnv] : env.staging;

module.exports = envExport;
