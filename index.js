/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Shumon Khan
 */

const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const envExport = require('./helpers/env');
const lib = require('./lib/data');

const app = {};

//modify
lib.create('test', 'newFile', { name: 'shumon' }, (err) => {
  console.log(err);
});

app.createServer = () => {
  console.log(envExport.name);
  const server = http.createServer(app.handleReqRes);
  server.listen(envExport.port, () => {
    console.log(`listening to port ${envExport.port}`);
  });
};

app.handleReqRes = handleReqRes;
app.createServer();
