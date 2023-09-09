/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Shumon Khan
 */

const server = require('./lib/server');
const workers = require('./lib/worker');

const app = {};

app.init = () => {
    server.init();

    workers.init();
};

app.init();

module.exports = app;
