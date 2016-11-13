
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

var request = require('request');
var cheerio = require('cheerio');

var global = require('./../../config/env/global.js');
var winston = require('./../../config/env/winston.js');
var imageMagick = require('./../../config/lib/imageMagick.js');

/**
 * 예측 가능한 에러를 리턴하는 메서드
 *
 * @param statusCode
 * @param errorCode
 * @param message
 */
exports.makePredictableError = function(statusCode, errorCode, message) {
  winston.warn(message);
  var err = new Error(message);
  err.statusCode = statusCode;
  err.errorCode = errorCode;
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

      error.errorCode = 202;
      reject(error);
    })
  });
};


/**
 * 어플리케이션 버전 체크 헬퍼 메서드
 *
 * @param appVersion
 */
exports.appVersionCheck = function(appVersion) {
  return new Promise(function(resolve, reject) {
    var currentAppVersion = global.currentAppVersion;

    if (appVersion < currentAppVersion) {
      return resolve('버전이 낮습니다.');
    }

    resolve('최신 버전 입니다');
  });


/**
 * 임시 값 만들기 (타임스탬프 + 랜덤)
 */
exports.createToken = function() {
  return new Date().getTime().toString().substr(-5) + crypto.randomBytes(10).toString('hex');
};


/**
 * 임시 폴더를 생성하는 메서드
 *
 * @param path - 생성할 폴더 경로
 */
exports.createFolder = function(path) {
  return new Promise(function(resolve, reject) {
    fs.mkdir(path, function(err) {
      if (err) {
        return reject(err);
      }

      resolve(path);
    });
  });
};

/**
 * 하나의 파일을 삭제하는 메소드
 *
 * @param path - 삭제할 파일 경로
 */
exports.deleteFile = function(path) {
  return new Promise(function(resolve, reject) {
    fs.access(path, fs.F_OK, function(err) {
      if (err) {
        return reject(err);
      }

      fs.unlink(path, function(err) {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
  });
};
};