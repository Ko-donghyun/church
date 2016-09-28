
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
 * 성경 구절 가져오기 유효성 체크 메서드
 *
 * @param version
 * @param name
 * @param startChapter
 * @param endChapter
 * @param startParagraph
 * @param endParagraph
 */
exports.getBibleVerseValidation = function(version, name, startChapter, endChapter, startParagraph, endParagraph) {
  return new Promise(function(resolve, reject) {
    if (version === undefined || name === undefined || startChapter === undefined || endChapter === undefined ||
      startParagraph === undefined || endParagraph === undefined) {
      return reject(new helper.makePredictableError(200, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};