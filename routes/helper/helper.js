
var request = require('request');
var cheerio = require('cheerio');

var winston = require('./../../config/env/winston.js');

/**
 * 예측 가능한 에러를 리턴하는 메서드
 *
 * @param statusCode
 * @param message
 * @returns {error.BaseError|Error}
 */
exports.makePredictableError = function(statusCode, message) {
  winston.warn(message);
  var err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * 성경 구절 가져오는 헬퍼 메서드
 *
 * @param version
 * @param name
 * @param startChapter
 * @param endChapter
 * @param startParagraph
 * @param endParagraph
 */
exports.getBibleVerse = function(version, name, startChapter, endChapter, startParagraph, endParagraph) {
  return new Promise(function(resolve, reject) {
    var requestUrl = 'http://ibibles.net/quote.php?' +
      version + '-' + name + '/' +
      startChapter + ':' + startParagraph + '-' + endChapter + ':' + endParagraph;

    request(requestUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);

        return resolve(cheerio.text($('body')));
      }

      reject(error);
    })
  });
};