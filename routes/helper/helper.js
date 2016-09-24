
var winston = require('winston');

exports.makePredictableError = function(statusCode, message) {
  winston.warn(message);
  var err = new Error(message);
  err.statusCode = statusCode;
  return err;
};