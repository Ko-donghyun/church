var express = require('express');
var Sequelize = require('sequelize');

var helper = require('./helper/helper.js');
var validation = require('./validation/validation.js');
var winston = require('./../config/env/winston.js');
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

    helper.getBibleVerse(version, bibleName, startChapter, endChapter, startVerse, endVerse).then(function(bibleText) {
      winston.debug('성경 구절 가져오기 완료');

      if (bibleText === '\nBible verse not found.\n') {
        return next(helper.makePredictableError(200, 203, '일치하는 구절이 없습니다'));
      }

      if (bibleText === '\nBible version not found.\n') {
        return next(helper.makePredictableError(200, 204, '일치하는 성경 버전이 없습니다'));
      }

      if (bibleText === '\nBible book not found.\n') {
        return next(helper.makePredictableError(200, 205, '일치하는 성경 책이 없습니'));
      }

      res.json({
        success: 1,
        result: bibleText
      })
    });
  }).catch(function(err) {
    winston.debug('성경 구절 가져오기 실패');

    err.errorCode = 206;
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
  var startChapter = req.body.startChapter;
  var endChapter = req.body.endChapter;
  var startVerse = req.body.startVerse;
  var endVerse = req.body.endVerse;
  var content = req.body.content;
  var comment = req.body.comment;
  var backgroundImageName = req.body.backgroundImageName;
  var userId = req.body.userId;

  winston.debug('유효성 검사 시작');
  validation.saveVerseValidation(bibleName, startChapter, endChapter, startVerse, endVerse, content, comment, backgroundImageName, userId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('성경 구절 저장하기 시작');

    return Verse.create({
      bibleName: bibleName,
      startChapter: startChapter,
      endChapter: endChapter,
      startVerse: startVerse,
      endVerse: endVerse,
      content: content,
      comment: comment,
      backgroundImageName: backgroundImageName,
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

    err.errorCode = 213;
    next(err);
  });
});


/**
 * 랜덤으로 성경 리스트 불러오기 컨트롤러
 */
router.get('/randomList', function(req, res, next) {
  winston.debug('랜덤으로 성경 리스트 불러오기 컨트롤러 시작');

  var userId = req.query.userId;
  var query =
    "SELECT v.*, l.id AS isLike " +
    "FROM verses AS v " +
    "LEFT OUTER JOIN likes AS l " +
    "ON v.id = l.verseId " +
    "AND l.userId = " + userId + " " +
    "WHERE v.reportCount < 2 " +
    "AND v.deletedAt IS NULL " +
    "ORDER BY RAND() " +
    "LIMIT 20;";

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

    err.errorCode = 222;
    next(err);
  });
});

/**
 * 종아요 컨트롤러
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

    err.errorCode = 243;
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
          return Promise.reject(helper.makePredictableError(200, '유효하지 않은 likeId 입니다'));
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
          return Promise.reject(helper.makePredictableError(200, '유효하지 않은 verseId 입니다'));
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

    next(err);
  });
});


/**
 * 내 성경 구절 리스트 가져오기 컨트롤러
 */
router.get('/myList', function(req, res, next) {
  winston.debug('내 성경 구절 리스트 가져오기 컨트롤러 시작');

  var userId = req.query.userId;

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
      "LIMIT 20;";

    return sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
  }).then(function(result) {
    winston.debug('내 성경 리스트 불러오기 완료');

    res.json({
      success: 1,
      result: result
    });
  }).catch(function(err) {
    winston.debug('내 성경 리스트 불러오기 실패');

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
    winston.debug('내 성경 구절 리스트에서 하나의 아이템 가져오기 완료');

    res.json({
      success: 1,
      result: result
    });
  }).catch(function(err) {
    winston.debug('내 성경 구절 리스트에서 하나의 아이템 가져오기 실패');

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
          return Promise.reject(helper.makePredictableError(200, '유효한 성경 구절이 없습니다'));
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

    next(err);
  });
});

module.exports = router;
