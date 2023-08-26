const lib = require('../../lib/data');
const { hash } = require('../../helpers/utilities');

const handle = {};

handle.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handle._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: 'Request failed, try get, post, put or delete',
    });
  }
};

handle._users = {};

handle._users.get = (requestProperties, callback) => {
  callback(405, {
    message: 'Get page loaded',
  });
};
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
    typeof requestProperties.body.tosAgree === 'boolean' && requestProperties.body.tosAgree === true
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
          console.log(err2);
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
      error: 'There is a probelm with your request',
    });
  }
};
handle._users.put = (requestProperties, callback) => {};
handle._users.delete = (requestProperties, callback) => {};
module.exports = handle;
