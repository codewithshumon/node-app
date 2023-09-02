// Add this line at the beginning of your script
require('events').EventEmitter.defaultMaxListeners = 15;
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./env');

const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) => {
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg =
        typeof msg === 'string' && (msg.trim().length > 0) & (msg.trim().length <= 1600)
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };
        const stringPlayload = querystring.stringify(payload);

        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
        const req = https.request(requestDetails, (res) => {
            console.log('error for requestDetails ', requestDetails);
            const status = res.statusCode;

            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code is ${status}`);
            }
        });
        req.on('error', (e) => {
            callback(e);
        });
        req.write(stringPlayload);
        req.end;
    } else {
        callback('Fields are missing or invalid');
    }
};

module.exports = notifications;
