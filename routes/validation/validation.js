
var winston = require('winston');

var helper = require('./../helper/helper.js');

exports.userInfoValidation = function(uuid, age, gender, churchName) {
  return new Promise(function(resolve, reject) {
    if (uuid === undefined || age === undefined || gender === undefined || churchName === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};