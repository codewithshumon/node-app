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
        worker.performCheck(checksData);
    } else {
        console.log('checks id not found');
    }
};

worker.performCheck = (checksData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse the hostname & full url from original data
    const parsedUrl = url.parse(`${checksData.protocol}://${checksData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // construct the request
    const requestDetails = {
        protocol: `${checksData.protocol}:`,
        hostname: hostName,
        method: checksData.method.toUpperCase(),
        path,
        timeout: checksData.timeoutSeconds * 1000,
    };

    const protocolToUse = checksData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            checkOutCome.responseCode = status;
            worker.processCheckOutcome(checksData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(checksData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(checksData, checkOutCome);
            outcomeSent = true;
        }
    });

    // req send
    req.end();
};

worker.processCheckOutcome = (checksData, checkOutCome) => {
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
