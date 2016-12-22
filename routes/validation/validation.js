
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
      return reject(new helper.makePredictableError(200, 101, '필요한 파라미터를 다 받지 못했습니다.'));
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
      return reject(new helper.makePredictableError(200, 111, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

/**
 * 성경 구절 가져오기 유효성 체크 메서드
 *
 * @param version
 * @param bibleName
 * @param chapter
 * @param startVerse
 * @param endVerse
 */
exports.getBibleVerseValidation = function(version, bibleName, chapter, startVerse, endVerse) {
  return new Promise(function(resolve, reject) {
    if (version === undefined || bibleName === undefined || chapter === undefined ||
      startVerse === undefined || endVerse === undefined) {
      return reject(new helper.makePredictableError(200, 201, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

/**
 * 성경 구절 저장하기 유효성 체크 메서드
 *
 * @param bibleName
 * @param bibleKoreanName
 * @param chapter
 * @param startVerse
 * @param endVerse
 * @param comment
 * @param backgroundImageName
 * @param tag1
 * @param tag2
 * @param userId
 */
exports.saveVerseValidation = function(bibleName, bibleKoreanName, chapter, startVerse, endVerse,
                                       comment, backgroundImageName, tag1, tag2, userId) {
  return new Promise(function(resolve, reject) {
    if (bibleName === undefined || bibleKoreanName === undefined || chapter === undefined ||
      startVerse === undefined || endVerse === undefined || comment === undefined ||
      backgroundImageName === undefined || tag1 === undefined || tag2 === undefined || userId === undefined) {
      return reject(new helper.makePredictableError(200, 211, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 랜덤으로 성경 구절 리스트 가져오기 유효성 체크 메서드
 *
 * @param userId
 */
exports.getRandomVerseListValidation = function(userId) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined) {
      return reject(new helper.makePredictableError(200, 221, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

/**
 * 태그 기반 성경 구절 리스트 가져오기 유효성 체크 메서드
 *
 * @param userId
 * @param tag
 */
exports.getTagVerseListValidation = function(userId, tag) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined || tag === undefined) {
      return reject(new helper.makePredictableError(200, 221, '필요한 파라미터를 다 받지 못했습니다.'));
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
      return reject(new helper.makePredictableError(200, 271, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 내 성경 구절 리스트에서 하나의 아이템 가져오기 유효성 체크 메서드
 *
 * @param userId
 * @param verseId
 */
exports.getMyListItemValidation = function(userId, verseId) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined || verseId === undefined) {
      return reject(new helper.makePredictableError(200, 281, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 내 성경 구절 지우기 유효성 체크 메서드
 *
 * @param userId
 * @param verseId
 */
exports.deleteMyVerseValidation = function(userId, verseId) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined || verseId === undefined) {
      return reject(new helper.makePredictableError(200, 291, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 좋아요 하기 유효성 체크 메서드
 *
 * @param userId
 * @param verseId
 */
exports.likeValidation = function(userId, verseId) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined || verseId === undefined) {
      return reject(new helper.makePredictableError(200, 241, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 좋아요 취소하기 유효성 체크 메서드
 *
 * @param userId
 * @param likeId
 */
exports.dislikeValidation = function(userId, likeId) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined || likeId === undefined) {
      return reject(new helper.makePredictableError(200, 251, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 신고하기 유효성 체크 메서드
 *
 * @param userId
 * @param verseId
 * @param reportReason
 */
exports.reportValidation = function(userId, verseId, reportReason) {
  return new Promise(function(resolve, reject) {
    if (userId === undefined || verseId === undefined || reportReason === undefined) {
      return reject(new helper.makePredictableError(200, 261, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};


/**
 * 다운로드 유효성 체크 메서드
 *
 * @param verseId
 */
exports.downloadValidation = function(verseId) {
  return new Promise(function(resolve, reject) {
    if (verseId === undefined) {
      return reject(new helper.makePredictableError(200, 231, '필요한 파라미터를 다 받지 못했습니다.'));
    }

    resolve();
  });
};

