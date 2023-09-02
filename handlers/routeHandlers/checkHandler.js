const lib = require('../../lib/data');
const { randomString } = require('../../helpers/utilities');
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
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
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
                    if (!err && uData) {
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

                                    lib.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            userData.checks = userChecks;
                                            userData.checks.push(checkId);
                                            lib.update('users', phone, userData, (err) => {
                                                if (!err) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'Can not update user data',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'Can not create check',
                                            });
                                        }
                                    });
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
                    error: 'Authontication token not found',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid request',
        });
    }
};

handle._check.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        lib.read('checks', id, (err, ckData) => {
            const checkData = { ...perseJSON(ckData) };
            const phone = checkData.userPhone;
            if (!err && ckData) {
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, phone, (tValid) => {
                    if (tValid) {
                        callback(200, checkData);
                    } else {
                        callback(500, {
                            error: 'Athentication failed',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a error in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid user',
        });
    }
};

handle._check.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

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
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
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

    if (id) {
        if (protocol || url || method || successCode || timeoutSeconds) {
            lib.read('checks', id, (err, ckDate) => {
                if (!err && ckDate) {
                    const checkData = { ...perseJSON(ckDate) };
                    const phone = checkData.userPhone;
                    const token =
                        typeof requestProperties.headersObject.token === 'string'
                            ? requestProperties.headersObject.token
                            : false;
                    tokenHandler._token.verify(token, phone, (tValid) => {
                        if (tValid) {
                            if (protocol) {
                                checkData.protocol = protocol;
                            }
                            if (url) {
                                checkData.url = url;
                            }
                            if (method) {
                                checkData.method = method;
                            }
                            if (successCode) {
                                checkData.successCode = successCode;
                            }
                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            lib.update('checks', id, checkData, (err) => {
                                if (!err) {
                                    callback(200, {
                                        error: 'User info updated',
                                    });
                                } else {
                                    callback(500, {
                                        error: 'Can not update at this time',
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                error: 'Athentication failed',
                            });
                        }
                    });
                } else {
                    callback(500, {
                        error: 'Can not get the user data',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You did not provide anything for update',
            });
        }
    } else {
        callback(500, {
            error: 'Invalid user',
        });
    }
};

handle._check.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        lib.read('checks', id, (err, ckData) => {
            const checkData = { ...perseJSON(ckData) };
            const phone = checkData.userPhone;
            if (!err && ckData) {
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, phone, (tValid) => {
                    if (tValid) {
                        lib.delete('checks', id, (err) => {
                            if (!err) {
                                lib.read('users', phone, (err, uData) => {
                                    if (!err && uData) {
                                        const userData = { ...perseJSON(uData) };
                                        const userChecks =
                                            typeof userData.checks === 'object' &&
                                            userData.checks instanceof Array
                                                ? userData.checks
                                                : [];

                                        const checksPosition = userChecks.indexOf(id);
                                        if (checksPosition > -1) {
                                            userChecks.splice(checksPosition, 1);
                                            userData.checks = userChecks;

                                            lib.update('users', phone, userData, (err) => {
                                                if (!err) {
                                                    callback(200, {
                                                        error: 'Checks data updated',
                                                    });
                                                } else {
                                                    callback(500, {
                                                        error: 'Can not update checks data',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'Can not find checks data',
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'Can not find user data',
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: 'Can not find checks data',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'Athentication failed',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'You have a error in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid user',
        });
    }
};

module.exports = handle;
