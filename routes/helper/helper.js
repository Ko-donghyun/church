
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

var request = require('request');
var cheerio = require('cheerio');
var biguint = require('biguint-format');
var im = require('imagemagick');

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
 * 임시 정수값 만들기 (랜덤)
 */
exports.createRandomNumber = function() {
  return biguint(crypto.randomBytes(2), 'dec');
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
    var fontFilePath = './public/fonts/KoPubBatang_Pro_Light.otf';
    var resultFilePath = workingFolderPath + '/' + exports.createToken() + '.jpg';
    var imagesPaths;

    var contentImagePromise = makeTextImageFileCommand(fontFilePath, '25', 'center', '660x',
      verse.content, workingFolderPath + '/content.png');
    var contentInfoImagePromise = makeTextImageFileCommand(fontFilePath, '24', 'east', '660x51',
      verse.bibleKoreanName + '  ' + verse.startChapter + ':' + verse.startVerse + '~' + verse.endVerse, workingFolderPath + '/contentInfo.png');
    var commentImagePromise = makeTextImageFileCommand(fontFilePath, '25', 'center', '560x435',
      verse.comment, workingFolderPath + '/comment.png');

    Promise.all([contentImagePromise, contentInfoImagePromise, commentImagePromise]).then(function(result) {
      imagesPaths = result;
      return getImageHeight(imagesPaths[0]);
    }).then(function(height) {
      var verseImagePosition = 126 + ((435 - height) / 2);
      winston.debug(height);
      winston.debug(verseImagePosition);
      imageMagick.command('convert', ['-page', '+0+0', imageFolderPath + '/' + verse.backgroundImageName,
        '-page', '+30+' + verseImagePosition , imagesPaths[0],
        '-page', '+30+' + (verseImagePosition + height + 10), imagesPaths[1],
        '-page', '+80+561', imagesPaths[2],
        '-page', '+310+1150', imageFolderPath + '/logo.png',
        '-layers', 'flatten', resultFilePath], function (err) {
        if (err) {
          return reject(err);
        }

        resolve(resultFilePath);
      });
    });
  });
};


/**
 * 정사각형 이미지 파일 생성
 *
 * @param verse - verse 정보
 * @param workingFolderPath - 작업 폴더 경로
 */
exports.createRectangleImageFile = function(verse, workingFolderPath) {
  return new Promise(function(resolve, reject) {
    var imageFolderPath = './public/images';
    var fontFilePath = './public/fonts/KoPubBatang_Pro_Light.otf';
    var tempResultFilePath = workingFolderPath + '/tempResult.jpg';
    var cropFilePath = workingFolderPath + '/' + exports.createToken() + '.jpg';
    var imagesPaths;

    var contentImagePromise = makeTextImageFileCommand(fontFilePath, '25', 'center', '660x',
      verse.content, workingFolderPath + '/content.png');
    var contentInfoImagePromise = makeTextImageFileCommand(fontFilePath, '24', 'east', '660x51',
      verse.bibleKoreanName + '  ' + verse.startChapter + ':' + verse.startVerse + '~' + verse.endVerse, workingFolderPath + '/contentInfo.png');
    var commentImagePromise = makeTextImageFileCommand(fontFilePath, '25', 'center', '560x435',
      verse.comment, workingFolderPath + '/comment.png');

    Promise.all([contentImagePromise, contentInfoImagePromise, commentImagePromise]).then(function(result) {
      imagesPaths = result;
      return getImageHeight(imagesPaths[0]);
    }).then(function(height) {
      var verseImagePosition = 126 + ((435 - height) / 2);
      winston.debug(height);
      winston.debug(verseImagePosition);
      imageMagick.command('convert', ['-page', '+0+0', imageFolderPath + '/' + verse.backgroundImageName,
        '-page', '+30+' + verseImagePosition , imagesPaths[0],
        '-page', '+30+' + (verseImagePosition + height + 10), imagesPaths[1],
        '-page', '+80+450', imagesPaths[2],
        '-page', '+310+800', imageFolderPath + '/logo.png',
        '-layers', 'flatten', tempResultFilePath], function (err) {
        if (err) {
          return reject(err);
        }

        imageMagick.command('convert', [tempResultFilePath, '-crop', '720x720+0+180', '+repage', cropFilePath], function (err) {
          if (err) {
            return reject(err);
          }

          resolve(cropFilePath);
        });
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
      '-pointsize', pointSize, '-gravity', gravity, '-size', size, '-interword-spacing', '7',
      '-interline-spacing', '10', 'caption:' + captionContent, imageFilePath], function (err) {
      if (err) {
        winston.debug(err);
        reject(err);
      }

      resolve(imageFilePath);
    });
  });
}


/**
 * 이미지 파일의 높이를 가져오는 헬퍼 메서드
 *
 * @param imageFilePath
 */
function getImageHeight(imageFilePath) {
  return new Promise(function(resolve, reject) {
    im.identify(imageFilePath, function(err, features) {
      if (err) {
        return reject(err);
      }

      resolve(features.height);
      // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
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

      winston.debug(files);
      if (files) {
        files.forEach(function (file) {
          var filePath = path + '/' + file;
          removeFilePromise.push(exports.deleteFile(filePath));
        });

        winston.debug('폴더 내의 모든 파일 제거 시작');
        Promise.all(removeFilePromise).then(function () {
          winston.debug('폴더 내의 모든 파일 제거 완료');
          winston.debug('폴더 제거 시작');

          fs.rmdir(path, function (err) {
            if (err) {
              return reject(err);
            }

            winston.debug('폴더 제거 완료');
            return resolve();
          });
        }).catch(function (err) {
          reject(err);
        });
      } else {
        fs.rmdir(path, function (err) {
          if (err) {
            return reject(err);
          }

          winston.debug('폴더 제거 완료');
          return resolve();
        });
      }
    });
  });
};