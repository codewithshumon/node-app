const env = {};

env.staging = {
  port: 5000,
  name: 'staging',
};

env.production = {
  port: 4000,
  name: 'production',
};
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const envExport = typeof env[currentEnv] === 'object' ? env[currentEnv] : env.staging;

module.exports = envExport;
