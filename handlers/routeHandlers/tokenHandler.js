const lib = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { perseJSON } = require('../../helpers/utilities');

const handle = {};

handle.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: 'Request failed, try  post, get, put or delete',
        });
    }
};

handle._token = {};

handle._token.post = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : null;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : null;
    if (phone && password) {
        lib.read('users', phone, (err, userData) => {
            const hasPassword = hash(password);
            if (hasPassword === userData.password) {
                a;
            } else {
                callback(400, {
                    error: 'Invalid user and password',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handle._token.get = (requestProperties, callback) => {};

handle._token.put = (requestProperties, callback) => {};

handle._token.delete = (requestProperties, callback) => {};

module.exports = handle;
