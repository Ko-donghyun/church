var path = require('path');

var express = require('express');
var Sequelize = require('sequelize');

var helper = require('./helper/helper.js');
var validation = require('./validation/validation.js');
var winston = require('./../config/env/winston.js');
var imageMagick = require('./../config/lib/imageMagick');
var sequelize = require('./../config/env/sequelize.js');
var Verse = require('./../model/verse');
var Like = require('./../model/like');
var Report = require('./../model/report');
var credentials = require('./../credentials.js');

var router = express.Router();

/**
 * 성경 구절 가져오기 컨트롤러
 */
router.get('/bible', function(req, res, next) {
  winston.debug('성경 구절 가져오기 컨트롤러 시작');

  var version = req.query.version;
  var bibleName = req.query.bibleName;
  var startChapter = req.query.startChapter;
  var endChapter = req.query.endChapter;
  var startVerse = req.query.startVerse;
  var endVerse = req.query.endVerse;

  winston.debug('유효성 검사 시작');
  validation.getBibleVerseValidation(version, bibleName, startChapter, endChapter, startVerse, endVerse).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('성경 구절 가져오기 시작');

    var query =
      "SELECT GROUP_CONCAT(sentence SEPARATOR ' ') AS bibleText " +
      "FROM bibles " +
      "WHERE short_label = :bibleName " +
      "AND chapter = :chapter " +
      "AND paragraph BETWEEN :startParagraph AND :endParagraph " +
      "GROUP BY chapter;";

    return sequelize.query(query, {
      replacements: {
        bibleName: bibleName,
        chapter: startChapter,
        startParagraph: startVerse,
        endParagraph: endVerse
      },
      type: sequelize.QueryTypes.SELECT
    });
  }).then(function(result) {
    if (!result.length) {
      return next(helper.makePredictableError(200, 203, '일치하는 구절이 없습니다'));
    }

    res.json({
      success: 1,
      result: result[0].bibleText
    })
  }).catch(function(err) {
    winston.debug('성경 구절 가져오기 실패');

    err.errorCode = err.errorCode || 206;
    next(err);
  });
});


/**
 * 성경 구절 저장하기 컨트롤러
 */
router.post('/bible', function(req, res, next) {
  winston.debug('성경 구절 저장하기 컨트롤러 시작');

  var imageUrl = credentials.s3EndPoint;

  var bibleName = req.body.bibleName;
  var bibleKoreanName = req.body.bibleKoreanName;
  var startChapter = req.body.startChapter;
  var endChapter = req.body.endChapter;
  var startVerse = req.body.startVerse;
  var endVerse = req.body.endVerse;
  var comment = req.body.comment;
  var backgroundImageName = req.body.backgroundImageName;
  var tag1 = req.body.tag1;
  var tag2 = req.body.tag2;
  var userId = req.body.userId;

  var randomNumber = helper.createRandomNumber();

  winston.debug('유효성 검사 시작');
  validation.saveVerseValidation(bibleName, bibleKoreanName, startChapter, endChapter, startVerse, endVerse, comment, backgroundImageName, tag1, tag2, userId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('성경 구절 저장하기 시작');

    return Verse.create({
      bibleName: bibleName,
      bibleKoreanName: bibleKoreanName,
      startChapter: startChapter,
      endChapter: endChapter,
      startVerse: startVerse,
      endVerse: endVerse,
      comment: comment,
      backgroundImageName: backgroundImageName,
      tag1: tag1,
      tag2: tag2,
      randomNumber: randomNumber,
      userId: userId
    });
  }).then(function(verse) {
    winston.debug('성경 구절 저장하기 완료');

    res.json({
      success: 1,
      result: '저장하기 완료 했습니다.'
    })
  }).catch(function(err) {
    winston.debug('성경 구절 저장하기 실패');
    if (err.message === 'Validation error') {
      return next(new helper.makePredictableError(200, 212, 'Sequelize Validation 에서 에러 체크'));
    }

    err.errorCode = err.errorCode || 213;
    next(err);
  });
});


/**
 * 랜덤으로 성경 리스트 불러오기 컨트롤러
 */
router.get('/randomList', function(req, res, next) {
  winston.debug('랜덤으로 성경 리스트 불러오기 컨트롤러 시작');

  var randomNumber = helper.createRandomNumber();
  var userId = req.query.userId;
  var requestCount = req.query.count || 0;
  winston.debug(requestCount);
  var page = req.query.count || 0;
  var tag = req.query.tag || undefined;
  var query;

  if (tag) {
    query =
      "SELECT verse.*, l.id AS isLike " +
      "FROM (" +
      "(SELECT v.id, v.bibleName, v.bibleKoreanName, v.startChapter, v.startVerse, v.endVerse, GROUP_CONCAT(b.sentence SEPARATOR ' ') AS content, v.comment, v.backgroundImageName, v.tag1, v.tag2, v.likeCount, v.commentCount, v.reportCount " +
      "FROM verses AS v " +
      "JOIN bibles AS b " +
      "ON v.bibleKoreanName = b.long_label " +
      "AND v.startChapter = b.chapter " +
      "AND b.paragraph BETWEEN v.startVerse AND v.endVerse " +
      "WHERE v.deletedAt IS NULL " +
      "AND v.reportCount < 2 " +
      "AND ( v.tag1 = '" + tag + "' OR v.tag2 = '" + tag + "') " +
      "GROUP BY v.id " +
      "ORDER BY v.createdAt DESC " +
      "LIMIT " + page + ", 20) " +
      ") AS verse " +
      "LEFT OUTER JOIN likes AS l " +
      "ON verse.id = l.verseId " +
      "AND l.userId = " + userId + " " +
      "LIMIT 20;";
  } else {
    if (requestCount > 2) {
      query =
        "SELECT verse.*, l.id AS isLike " +
        "FROM (" +
        "(SELECT v.id, v.bibleName, v.bibleKoreanName, v.startChapter, v.startVerse, v.endVerse, GROUP_CONCAT(b.sentence SEPARATOR ' ') AS content, v.comment, v.backgroundImageName, v.tag1, v.tag2, v.likeCount, v.commentCount, v.reportCount " +
        "FROM verses AS v " +
        "JOIN bibles AS b " +
        "ON v.bibleKoreanName = b.long_label " +
        "AND v.startChapter = b.chapter " +
        "AND paragraph BETWEEN v.startVerse AND v.endVerse " +
        "WHERE v.randomNumber >= " + randomNumber + " " +
        "AND v.deletedAt IS NULL " +
        "AND v.reportCount < 2 " +
        "GROUP BY v.id " +
        "ORDER BY v.randomNumber ASC " +
        "LIMIT 20) " +
        "UNION ALL (" +
        "(SELECT v.id, v.bibleName, v.bibleKoreanName, v.startChapter, v.startVerse, v.endVerse, GROUP_CONCAT(b.sentence SEPARATOR ' ') AS content, v.comment, v.backgroundImageName, v.tag1, v.tag2, v.likeCount, v.commentCount, v.reportCount " +
        "FROM verses AS v " +
        "JOIN bibles AS b " +
        "ON v.bibleKoreanName = b.long_label " +
        "AND v.startChapter = b.chapter " +
        "AND paragraph BETWEEN v.startVerse AND v.endVerse " +
        "WHERE v.randomNumber < " + randomNumber + " " +
        "AND v.deletedAt IS NULL " +
        "AND v.reportCount < 2 " +
        "GROUP BY v.id " +
        "ORDER BY v.randomNumber DESC))) AS verse " +
        "LEFT OUTER JOIN likes AS l " +
        "ON verse.id = l.verseId " +
        "AND l.userId = " + userId + " " +
        "ORDER BY RAND() " +
        "LIMIT 20;";
    } else {
      query =
        "SELECT verse.*, l.id AS isLike " +
        "FROM (" +
        "(SELECT v.id, v.bibleName, v.bibleKoreanName, v.startChapter, v.startVerse, v.endVerse, GROUP_CONCAT(b.sentence SEPARATOR ' ') AS content, v.comment, v.backgroundImageName, v.tag1, v.tag2, v.likeCount, v.commentCount, v.reportCount " +
        "FROM verses AS v " +
        "JOIN bibles AS b " +
        "ON v.bibleKoreanName = b.long_label " +
        "AND v.startChapter = b.chapter " +
        "AND b.paragraph BETWEEN v.startVerse AND v.endVerse " +
        "WHERE v.deletedAt IS NULL " +
        "AND v.reportCount < 2 " +
        "GROUP BY v.id " +
        "ORDER BY v.createdAt DESC " +
        "LIMIT " + 40 * requestCount + ", 40) " +
        ") AS verse " +
        "LEFT OUTER JOIN likes AS l " +
        "ON verse.id = l.verseId " +
        "AND l.userId = " + userId + " " +
        "ORDER BY RAND() " +
        "LIMIT 20;";
    }
  }

  winston.debug('유효성 검사 시작');
  validation.getRandomVerseListValidation(userId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('랜덤으로 성경 리스트 불러오기 시작');

    return sequelize.query(query, {type: sequelize.QueryTypes.SELECT}).then(function(result) {
      winston.debug('랜덤으로 성경 리스트 불러오기 완료');

      res.json({
        success: 1,
        result: result
      })
    });
  }).catch(function(err) {
    winston.debug('랜덤으로 성경 리스트 불러오기 실패');

    err.errorCode = err.errorCode || 222;
    next(err);
  });
});


/**
 * 성경 구절 이미지화 다운로드
 */
router.get('/download', function(req, res, next) {
  winston.debug('성경 구절 이미지화 다운로드 시작');

  var verseId = req.query.verseId;
  var workingFolder = './public/working/' + helper.createToken();
  var verseObject;

  winston.debug('유효성 검사 시작');
  validation.downloadValidation(verseId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('이미지화에 필요한 내용 가져오기 시작');

    return Verse.findById(verseId);
  }).then(function(verse) {
    if (!verse) {
      return Promise.reject(new helper.makePredictableError(200, 232, '유효하지 않은 verseId 입니다.'));
    }
    winston.debug('이미지화에 필요한 내용 가져오기 완료');
    winston.debug('임시 폴더 만들기 시작');

    verseObject = verse.get({plain: true});
    return helper.createFolder(workingFolder);
  }).then(function() {
    winston.debug('임시 폴더 만들기 완료');
    winston.debug('가져온 내용을 바탕으로 이미지화 시작');

    return helper.createImageFile(verseObject, workingFolder);
  }).then(function(imageFilePath) {
    winston.debug('가져온 내용을 바탕으로 이미지화 완료');
    winston.debug('다운로드 리스폰 보내기');

    return res.download(imageFilePath, '나눔.jpg', function (err) {
      if (err) {
        return Promise.reject(err);
      }
    });
  }).then(function() {
    winston.debug('리스폰 보내기 완료');
    winston.debug('임시파일 삭제 시작');

    return helper.deleteFolder(workingFolder);
  }).catch(function(err) {
    winston.debug('성경 구절 이미지화 다운로드실패');
    winston.debug('임시파일 삭제 시작');

    helper.deleteFolder(workingFolder);
    err.errorCode = err.errorCode || 233;
    next(err);
  });
});


/**
 * 성경 구절 정사각형 이미지화 다운로드
 */
router.get('/download/rectangle', function(req, res, next) {
  winston.debug('성경 구절 정사각형 이미지화 다운로드 시작');

  var verseId = req.query.verseId;
  var workingFolder = './public/working/' + helper.createToken();
  var verseObject;

  winston.debug('유효성 검사 시작');
  validation.downloadValidation(verseId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('이미지화에 필요한 내용 가져오기 시작');

    return Verse.findById(verseId);
  }).then(function(verse) {
    if (!verse) {
      return Promise.reject(new helper.makePredictableError(200, 232, '유효하지 않은 verseId 입니다.'));
    }
    winston.debug('이미지화에 필요한 내용 가져오기 완료');
    winston.debug('임시 폴더 만들기 시작');

    verseObject = verse.get({plain: true});
    return helper.createFolder(workingFolder);
  }).then(function() {
    winston.debug('임시 폴더 만들기 완료');
    winston.debug('가져온 내용을 바탕으로 이미지화 시작');

    return helper.createRectangleImageFile(verseObject, workingFolder);
  }).then(function(imageFilePath) {
    winston.debug('가져온 내용을 바탕으로 이미지화 완료');
    winston.debug('다운로드 리스폰 보내기');

    return res.download(imageFilePath, '나눔.jpg', function (err) {
      if (err) {
        return Promise.reject(err);
      }
    });
  }).then(function() {
    winston.debug('리스폰 보내기 완료');
    winston.debug('임시파일 삭제 시작');

    return helper.deleteFolder(workingFolder);
  }).catch(function(err) {
    winston.debug('성경 구절 정사각형 이미지화 다운로드실패');
    winston.debug('임시파일 삭제 시작');

    helper.deleteFolder(workingFolder);
    err.errorCode = err.errorCode || 233;
    next(err);
  });
});

/**
 * 좋아요 컨트롤러
 */
router.post('/like/:verseId', function(req, res, next) {
  winston.debug('좋아요 컨트롤러 시작');

  var userId = req.body.userId;
  var verseId = req.params.verseId;
  var LikeId;

  winston.debug('유효성 검사 시작');
  validation.likeValidation(userId, verseId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('verseId를 이용하여 verse 조회 시작');

    return sequelize.transaction().then(function (t) {
      return Verse.findById(verseId, {transaction: t}).then(function (verse) {
        if (verse === null) {
          throw helper.makePredictableError(200, 242, '유효하지 않은 verseId 입니다');
        }

        winston.debug('verseId를 이용하여 verse 조회 완료');
        winston.debug('좋아요 디비에 추가');

        return Like.findOrCreate({
          where: {
            verseId: verseId,
            userId: userId
          },
          transaction: t
        }).spread(function(like, created) {
          LikeId = like.id;

          winston.debug(created);
          if (created) {
            return verse.increment('likeCount', {transaction: t});
          }

        }).then(function () {
          t.commit();
        })
      }).catch(function (err) {
        t.rollback();
        return Promise.reject(err);
      });
    });
  }).then(function() {
    winston.debug('좋아요 완료');

    res.json({
      success: 1,
      result: LikeId
    })
  }).catch(function(err) {
    winston.debug('좋아요 실패');

    err.errorCode = err.errorCode || 243;
    next(err);
  });
});


/**
 * 종아요 취소 컨트롤러
 */
router.post('/dislike/:likeId', function(req, res, next) {
  winston.debug('좋아요 취소 컨트롤러 시작');

  var userId = req.body.userId;
  var likeId = req.params.likeId;

  winston.debug('유효성 검사 시작');
  validation.dislikeValidation(userId, likeId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('likeId를 이용하여 like 조회 시작');

    return sequelize.transaction().then(function (t) {
      return Like.findById(likeId, {transaction: t}).then(function (like) {
        if (like === null) {
          return Promise.reject(helper.makePredictableError(200, 252, '유효하지 않은 likeId 입니다'));
        }

        winston.debug('likeId를 이용하여 like 조회 완료');
        winston.debug('좋아요 완전히 삭제');

        return like.destroy({force: true}, {transaction: t}).then(function () {
          return Verse.findById(like.verseId, {transaction: t}).then(function (verse) {
            return verse.decrement('likeCount', {transaction: t});
          });
        }).then(function () {
          t.commit();
        });
      }).catch(function (err) {
        t.rollback();
        return Promise.reject(err);
      });
    });
  }).then(function() {
    winston.debug('좋아요 삭제 완료');

    res.json({
      success: 1,
      message: '좋아요 삭제 완료.'
    })
  }).catch(function(err) {
    winston.debug('좋아요 삭제 실패');

    err.errorCode = err.errorCode || 253;
    next(err);
  });
});


/**
 * 신고하기 컨트롤러
 */
router.post('/report/:verseId', function(req, res, next) {
  winston.debug('신고하기 컨트롤러 시작');

  var userId = req.body.userId;
  var verseId = req.params.verseId;
  var reportReason = req.body.reason;

  winston.debug('유효성 검사 시작');
  validation.reportValidation(userId, verseId, reportReason).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('verseId를 이용하여 verse 조회 시작');

    return sequelize.transaction().then(function (t) {
      return Verse.findById(verseId, {transaction: t}).then(function (verse) {
        if (verse === null) {
          return Promise.reject(helper.makePredictableError(200, 262, '유효하지 않은 verseId 입니다'));
        }

        winston.debug('verseId를 이용하여 verse 조회 완료');
        winston.debug('신고하기 디비에 추가');

        return Report.findOrCreate({
          where: {
            verseId: verseId,
            userId: userId
          },
          defaults: { reason: reportReason },
          transaction: t
        }).spread(function(report, created) {

          if (created) {
            return verse.increment('reportCount', {transaction: t});
          }

          return Promise.reject(helper.makePredictableError(200, '이미 신고 했습니다'));
        }).then(function () {
          t.commit();
        })
      }).catch(function (err) {
        t.rollback();
        return Promise.reject(err);
      });
    });
  }).then(function() {
    winston.debug('신고 완료');

    res.json({
      success: 1,
      result: '신고 완료 됬습니다.'
    })
  }).catch(function(err) {
    winston.debug('신고 실패');

    err.errorCode = err.errorCode || 263;
    next(err);
  });
});


/**
 * 내 성경 구절 리스트 가져오기 컨트롤러
 */
router.get('/myList', function(req, res, next) {
  winston.debug('내 성경 구절 리스트 가져오기 컨트롤러 시작');

  var userId = req.query.userId;
  var page = req.query.page || 0;
  page = page * 20;

  winston.debug('유효성 검사 시작');
  validation.getMyListValidation(userId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('내 성경 구절 리스트 가져오기 시작');

    // TODO offset 필요, 쿼리 최적화 필요
    var query =
      "SELECT v.*, l.id AS isLike " +
      "FROM verses AS v " +
      "LEFT OUTER JOIN likes AS l " +
      "ON v.id = l.verseId " +
      "AND l.userId = " + userId + " " +
      "WHERE v.userId = " + userId + " " +
      "AND v.deletedAt IS NULL " +
      "ORDER BY v.createdAt DESC " +
      "LIMIT " + page + ", 20;";

    return sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
  }).then(function(result) {
    winston.debug('내 성경 리스트 불러오기 완료');

    res.json({
      success: 1,
      result: result
    });
  }).catch(function(err) {
    winston.debug('내 성경 리스트 불러오기 실패');

    err.errorCode = err.errorCode || 272;
    next(err);
  });
});


/**
 * 내 성경 구절 리스트에서 하나의 아이템 가져오기 컨트롤러
 */
router.get('/myList/item', function(req, res, next) {
  winston.debug('내 성경 구절 리스트에서 하나의 아이템 가져오기 컨트롤러 시작');

  var verseId = req.query.verseId;
  var userId = req.query.userId;

  winston.debug('유효성 검사 시작');
  validation.getMyListItemValidation(userId, verseId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('내 성경 구절 리스트 가져오기 시작');

    // TODO offset 필요, 쿼리 최적화 필요
    var query =
      "SELECT v.*, l.id AS isLike " +
      "FROM verses AS v " +
      "LEFT OUTER JOIN likes AS l " +
      "ON v.id = l.verseId " +
      "AND l.userId = " + userId + " " +
      "WHERE v.id = " + verseId + " " +
      "AND v.userId = " + userId + " " +
      "AND v.deletedAt IS NULL " +
      "LIMIT 1;";

    return sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
  }).then(function(result) {
    if (result === null) {
      return Promise.reject(helper.makePredictableError(200, 282, '유효한 성경 구절이 없습니다'));
    }
    winston.debug('내 성경 구절 리스트에서 하나의 아이템 가져오기 완료');

    res.json({
      success: 1,
      result: result
    });
  }).catch(function(err) {
    winston.debug('내 성경 구절 리스트에서 하나의 아이템 가져오기 실패');

    err.errorCode = err.errorCode || 283;
    next(err);
  });
});


/**
 * 내 성경 구절 지우기 컨트롤러
 */
router.post('/myList/delete', function(req, res, next) {
  winston.debug('내 성경 구절 지우기 컨트롤러 시작');

  var userId = req.body.userId;
  var verseId = req.body.verseId;

  winston.debug('유효성 검사 시작');
  validation.deleteMyVerseValidation(userId, verseId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('verseId를 이용하여 verse 조회 시작');

    return sequelize.transaction().then(function (t) {
      return Verse.findOne({
        where: {
          id: verseId,
          userId: userId
        }
      }, {transaction: t}).then(function (verse) {
        if (verse === null) {
          return Promise.reject(helper.makePredictableError(200, 292, '유효한 성경 구절이 없습니다'));
        }

        winston.debug('verseId를 이용하여 verse 조회 완료');
        winston.debug('내 성경 구절 지우기 시작');

        return verse.destroy({transaction: t});
      }).then(function () {
        t.commit();
      }).catch(function (err) {
        t.rollback();
        return Promise.reject(err);
      });
    });
  }).then(function() {
    res.json({
      success: 1,
      result: '지우기 완료'
    });
  }).catch(function(err) {
    winston.debug('내 성경 구절 지우기 실패');

    err.errorCode = err.errorCode || 293;
    next(err);
  });
});

module.exports = router;
