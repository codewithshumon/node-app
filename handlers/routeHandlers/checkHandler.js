const lib = require('../../lib/data');
const { hash, randomString } = require('../../helpers/utilities');
const { perseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const envExport = require('../../helpers/env');

const handle = {};

handle.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: 'Request failed, try  post, get, put or delete',
        });
    }
};

handle._check = {};

handle._check.post = (requestProperties, callback) => {
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;
    const method =
        typeof requestProperties.body.method === 'string' &&
        ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;
    const successCode =
        typeof requestProperties.body.successCode === 'object' &&
        requestProperties.body.successCode instanceof Array
            ? requestProperties.body.successCode
            : false;
    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (protocol && url && method && successCode && timeoutSeconds) {
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;
        lib.read('tokens', token, (err, tData) => {
            const tokenData = { ...perseJSON(tData) };
            if (!err && tokenData) {
                const phone = tokenData.phone;
                lib.read('users', phone, (err, uData) => {
                    const userData = { ...perseJSON(uData) };
                    if (!err && userData) {
                        tokenHandler._token.verify(token, phone, (tokenId) => {
                            if (tokenId) {
                                const userChecks =
                                    typeof userData.checks === 'object' &&
                                    userData.checks instanceof Array
                                        ? userData.checks
                                        : [];

                                if (userChecks.length < envExport.maxChecks) {
                                    const checkId = randomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone: phone,
                                        protocol: protocol,
                                        url: url,
                                        method: method,
                                        successCode: successCode,
                                        timeoutSeconds: timeoutSeconds,
                                    };
                                } else {
                                    callback(401, {
                                        error: 'Max checks reached',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication failed',
                                });
                            }
                        });
                    } else {
                        callback(404, {
                            error: 'User not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authontication failed',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid request',
        });
    }
};

handle._check.get = (requestProperties, callback) => {};

handle._check.put = (requestProperties, callback) => {};

handle._check.delete = (requestProperties, callback) => {};

module.exports = handle;
