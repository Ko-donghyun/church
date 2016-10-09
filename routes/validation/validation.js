
var winston = require('winston');

var helper = require('./../helper/helper.js');

/**
 * 유저 정보 저장할 때 필요한 유효성 체크 메서드
 *
 * @param uuid
 * @param birthYear
 * @param gender
 * @param churchName
 */
exports.userInfoValidation = function(uuid, birthYear, gender, churchName) {
  return new Promise(function(resolve, reject) {
    if (uuid === undefined || birthYear === undefined || gender === undefined || churchName === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 유저 확인하기 유효성 체크 메서드
 *
 * @param uuid
 */
exports.userCheckValidation = function(uuid) {
  return new Promise(function(resolve, reject) {
    if (uuid === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

/**
 * 성경 구절 가져오기 유효성 체크 메서드
 *
 * @param version
 * @param bibleName
 * @param startChapter
 * @param endChapter
 * @param startVerse
 * @param endVerse
 */
exports.getBibleVerseValidation = function(version, bibleName, startChapter, endChapter, startVerse, endVerse) {
  return new Promise(function(resolve, reject) {
    if (version === undefined || bibleName === undefined || startChapter === undefined || endChapter === undefined ||
      startVerse === undefined || endVerse === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

/**
 * 성경 구절 저장하기 유효성 체크 메서드
 *
 * @param bibleName
 * @param startChapter
 * @param endChapter
 * @param startVerse
 * @param endVerse
 * @param content
 * @param comment
 * @param backgroundImageName
 * @param userId
 */
exports.saveVerseValidation = function(bibleName, startChapter, endChapter, startVerse, endVerse, content, comment, backgroundImageName, userId) {
  return new Promise(function(resolve, reject) {
    if (bibleName === undefined || startChapter === undefined || endChapter === undefined ||
      startVerse === undefined || endVerse === undefined || content === undefined || comment === undefined ||
      backgroundImageName === undefined || userId === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

/**
 * 내 성경 구절 리스트 가져오기 유효성 체크 메서드
 *
 * @param userId
 */
exports.getMyListValidation = function(userId) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

