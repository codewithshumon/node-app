const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  callback(200, {
    message: 'This is a sample page',
  });
};

module.exports = handler;
