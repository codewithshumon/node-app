const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const envExport = require('../helpers/env');
// const notification = require('../helpers/notification');

const server = {};

// notification.sendTwilioSms('01312184141', 'Hi Shumon Khan', (err) => {
//     console.log(err);
// });

server.createServer = () => {
    console.log(envExport.name);
    const createServer = http.createServer(server.handleReqRes);
    createServer.listen(envExport.port, () => {
        console.log(`listening to port ${envExport.port}`);
    });
};

server.handleReqRes = handleReqRes;
server.init = () => {
    server.createServer();
};

module.exports = server;
