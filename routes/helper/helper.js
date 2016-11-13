
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
};


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
 * 이미지 파일 생성
 *
 * @param verse - verse 정보
 * @param workingFolderPath - 작업 폴더 경로
 */
exports.createImageFile = function(verse, workingFolderPath) {
  return new Promise(function(resolve, reject) {
    var imageFolderPath = './public/images';
    var fontFilePath = './public/fonts/tvN_light.otf';
    var resultFilePath = workingFolderPath + '/' + exports.createToken() + '.jpg';

    var contentImagePromise = makeTextImageFileCommand(fontFilePath, '80', 'center', '1080x850',
      verse.content, workingFolderPath + '/content.png');
    var contentInfoImagePromise = makeTextImageFileCommand(fontFilePath, '60', 'east', '1080x110',
      '- ' + verse.bibleKoreanName + ' ' + verse.startChapter + '장  ', workingFolderPath + '/contentInfo.png');
    var commentImagePromise = makeTextImageFileCommand(fontFilePath, '80', 'center', '1080x960',
      verse.comment, workingFolderPath + '/comment.png');

    Promise.all([contentImagePromise, contentInfoImagePromise, commentImagePromise]).then(function(result) {
      imageMagick.command('convert', ['-page', '+0+0', imageFolderPath + '/' + verse.backgroundImageName,
        '-page', '+0+0', result[0], '-page', '+0+850', result[1], '-page', '+0+960', result[2],
        '-background', 'none', '-layers', 'flatten', resultFilePath], function (err) {
        if (err) {
          return reject(err);
        }

        resolve(resultFilePath);
      });
    });
  });
};


/**
 * 텍스트 이미지 파일 생성 메서드
 *
 * @param fontFilePath - 폰트 파일 경로
 * @param pointSize - 글자 크기
 * @param gravity - 글자 위치
 * @param size - 전체 파일 사이즈
 * @param captionContent - 내용
 * @param imageFilePath - 생성될 이미지 파일 경로
 */
function makeTextImageFileCommand(fontFilePath, pointSize, gravity, size, captionContent, imageFilePath) {
  return new Promise(function(resolve, reject) {
    imageMagick.command('convert', ['-background', 'none', '-fill', 'white', '-font', fontFilePath,
      '-pointsize', pointSize, '-gravity', gravity, '-size', size,
      'caption:' + captionContent, imageFilePath], function (err) {
      if (err) {
        winston.debug(err);
        reject(err);
      }

      resolve(imageFilePath);
    });
  });
}

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


/**
 * 폴더 전체를 삭제하는 메소드
 *
 * @param path - 삭제할 폴더 경로
 */
exports.deleteFolder = function(path) {
  return new Promise(function(resolve, reject) {
    fs.readdir(path, function (err, files) {
      var removeFilePromise = [];

      files.forEach(function(file) {
        var filePath = path + '/' + file;
        removeFilePromise.push(exports.deleteFile(filePath));
      });

      winston.debug('폴더 내의 모든 파일 제거 시작');
      Promise.all(removeFilePromise).then(function() {
        winston.debug('폴더 내의 모든 파일 제거 완료');
        winston.debug('폴더 제거 시작');

        fs.rmdir(path, function (err) {
          if (err) {
            return reject(err);
          }

          winston.debug('폴더 제거 완료');
          return resolve();
        });
      }).catch(function(err) {
        reject(err);
      });
    });
  });
};