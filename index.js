/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Shumon Khan
 */

const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const envExport = require('./helpers/env');
const notification = require('./helpers/notification');

const app = {};

notification.sendTwilioSms('01312184141', 'Hi Shumon Khan', (err) => {
    console.log('The error was', err);
});
//modify
// lib.create('test', 'newFile', { name: 'shumon' }, (err) => {
//   console.log(err);
// });

app.createServer = () => {
    console.log(envExport.name);
    const server = http.createServer(app.handleReqRes);
    server.listen(envExport.port, () => {
        console.log(`listening to port ${envExport.port}`);
    });
};

app.handleReqRes = handleReqRes;
app.createServer();
