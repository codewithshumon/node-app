const url = require('url');
const http = require('http');
const https = require('https');
const lib = require('./data');
const { perseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notification');

const worker = {};

//lookup all the checks from data base
worker.gatherAllChecks = () => {
    lib.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                lib.read('checks', check, (err, checksData) => {
                    if (!err && checksData) {
                        worker.validateChecksData({ ...perseJSON(checksData) });
                    } else {
                        console.log('checks data not found');
                    }
                });
            });
        } else {
            console.log('checks not found');
        }
    });
};

worker.validateChecksData = (perseChecksData) => {
    const checksData = perseChecksData;
    if (checksData && checksData.id) {
        checksData.state =
            typeof checksData.state === 'string' && ['up', 'down'].indexOf(checksData.state) > -1
                ? checksData.state
                : 'down';

        checksData.lastChecked =
            typeof checksData.lastChecked === 'number' && checksData.lastChecked > 0
                ? checksData.lastChecked
                : false;
        worker.performChecks(checksData);
    } else {
        console.log('checks id not found');
    }
};

worker.performChecks = (checksData) => {
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    let outComeSent = false;

    const perseUrl = url.parse(`${checksData.protocol}://${checksData.url}`, true);
    const hostName = perseUrl.hostname;
    const { path } = perseUrl;
    const requestDetails = {
        protocol: `${checksData.protocol}:`,
        hostName: hostName,
        method: checksData.method.toUpperCase(),
        path: path,
        timeout: checksData.timeoutSeconds * 1000,
    };
    const protocol = checksData.protocol === 'http' ? http : https;

    const req = protocol.request(requestDetails, (res) => {
        console.log('error for requestDetails', requestDetails);

        const status = res.statusCode;
        console.log('error for req status', status);

        checkOutCome.responseCode = status;
        if (!outComeSent) {
            worker.processCheckOutCome(checksData, checkOutCome);
            outComeSent = true;
        }
    });
    req.on('error', (err) => {
        console.log('error for on error', err);
        checkOutCome = {
            error: true,
            value: err,
        };
        if (!outComeSent) {
            worker.processCheckOutCome(checksData, checkOutCome);
            outComeSent = true;
        }
    });
    req.on('timeout', (err) => {
        console.log('error for timeout error', err);
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        if (!outComeSent) {
            worker.processCheckOutCome(checksData, checkOutCome);
            outComeSent = true;
        }
    });
    req.end();
};

worker.processCheckOutCome = (checksData, checkOutCome) => {
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        checksData.successCode.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    const alertWanted = checksData.lastChecked && checksData.state !== state ? true : false;
    // short way      = !!(checksData.lastChecked && checksData.state !== state)

    const newCheckData = checksData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    lib.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                worker.alertUserTostatusChange(newCheckData);
            } else {
                console.log('alert is not needed state not change yet');
            }
        } else {
            console.log('error: can not update checks data');
        }
    });
};

worker.alertUserTostatusChange = (newCheckData) => {
    const msg = `Alert: Your checks for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`Checks alert send to user with ${msg}`);
        } else {
            console.log(err);
        }
    });
};

//timer to loop the worker process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 9000);
};

worker.init = () => {
    //exceute all the checks
    worker.gatherAllChecks();

    //call the loop so checks continue
    worker.loop();
};

module.exports = worker;
