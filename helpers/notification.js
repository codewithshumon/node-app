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
            Body: userMsg,
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
        };

        const stringPayload = querystring.stringify(payload);

        // Set up the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload),
            },
        };

        // Create the HTTP request
        const req = https.request(requestDetails, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    callback(
                        `Message sent successfully. Response: ${responseData} and ${res.statusCode}`,
                    );
                } else {
                    callback(
                        `Failed to send message. Status code: ${res.statusCode}, Response: ${responseData}`,
                    );
                }
            });
        });

        req.on('error', (error) => {
            callback(`Error sending message: ${error}`);
        });

        // Write the payload data and end the request
        req.write(stringPayload);
        req.end();
    } else {
        callback('Fields are missing or invalid');
    }
};

module.exports = notifications;
