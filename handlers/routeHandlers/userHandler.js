const lib = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { perseJSON } = require('../../helpers/utilities');

const handle = {};

handle.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: 'Request failed, try  post, get, put or delete',
        });
    }
};

handle._users = {};

handle._users.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : null;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : null;

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

    const tosAgree =
        typeof requestProperties.body.tosAgree === 'boolean' && requestProperties.body.tosAgree
            ? requestProperties.body.tosAgree
            : null;

    if (firstName && lastName && phone && password && tosAgree) {
        lib.read('users', phone, (err) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgree,
                };
                lib.create('users', phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            Success: 'User created',
                        });
                    } else {
                        callback(500, {
                            Error: 'Could not create user',
                        });
                    }
                });
            } else {
                callback(500, {
                    Error: 'There was a problem, may user already exist',
                });
            }
        });
    } else {
        callback(400, {
            Error: 'There is a probelm with your request',
        });
    }
};

handle._users.get = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        lib.read('users', phone, (err, useData) => {
            const user = { ...perseJSON(useData) };
            if (!err && user) {
                delete user.password;
                callback(200, user);
            } else {
                callback(404, {
                    error: 'User not found! Create new user',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Invalid rquest',
        });
    }
};

handle._users.put = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : null;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : null;

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

    const tosAgree =
        typeof requestProperties.body.tosAgree === 'boolean' && requestProperties.body.tosAgree
            ? requestProperties.body.tosAgree
            : null;
    if (phone) {
        if (firstName || lastName || password) {
            lib.read('users', phone, (err, uData) => {
                const userData = { ...perseJSON(uData) };
                if (!err && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = hash(password);
                    }

                    lib.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200, {
                                Error: 'Data updated successfully!',
                            });
                        } else {
                            callback(400, {
                                Error: 'There was a error updating data!',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: 'Invalid phone number, please try again!',
                    });
                }
            });
        } else {
            callback(400, {
                Error: 'Please provide update data',
            });
        }
    } else {
        callback(400, {
            Error: 'Invalid phone number, please try again!',
        });
    }
};

handle._users.delete = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        lib.delete('users', phone, (err, userData) => {
            if (!err && userData) {
                lib.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'User successfully deleted',
                        });
                    } else {
                        callback(500, {
                            Error: 'User not found',
                        });
                    }
                });
            } else {
                callback(500, {
                    Error: 'There was a server error',
                });
            }
        });
    } else {
        callback(400, {
            Error: 'There was a problem in your request',
        });
    }
};

module.exports = handle;
