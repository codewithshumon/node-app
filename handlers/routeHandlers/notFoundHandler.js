const handle = {};

handle.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: 'Page not found',
  });
};

module.exports = handle;
