var express = require('express');
var Sequelize = require('sequelize');

var helper = require('./helper/helper.js');
var validation = require('./validation/validation.js');
var winston = require('./../config/env/winston.js');
var sequelize = require('./../config/env/sequelize.js');
var Verse = require('./../model/verse');
var Like = require('./../model/like');
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
        return next(helper.makePredictableError(200, '일치하는 구절이 없습니다'));
      }

      res.json({
        success: 1,
        result: bibleText
      })
    });
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

    next(err);
  });
});


/**
 * 랜덤으로 성경 리스트 불러오기 컨트롤러
 */
router.get('/randomList', function(req, res, next) {
  winston.debug('랜덤으로 성경 리스트 불러오기 컨트롤러 시작');

  var userId = req.query.userId;
  var query = "SELECT v.*, l.id AS isLike FROM verses AS v LEFT OUTER JOIN likes AS l ON v.id = l.verseId AND l.userId = " + userId + " ORDER BY RAND() LIMIT 20;";

  sequelize.query(query, {type: sequelize.QueryTypes.SELECT}).then(function(result) {
    winston.debug('랜덤으로 성경 리스트 불러오기 완료');
    
    res.json({
      success: 1,
      result: result
    })
  }).catch(function(err) {
    winston.debug('랜덤으로 성경 리스트 불러오기 실패');

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

  winston.debug('유효성 검사 시작');
  validation.likeValidation(userId, verseId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('versId를 이용하여 verse 조회 시작');

    return Verse.findById(verseId);
  }).then(function(verse) {
    if (verse === null) {
      return Promise.reject(helper.makePredictableError(200, '유효하지 않은 verseId 입니다'));
    }

    winston.debug('versId를 이용하여 verse 조회 완료');
    winston.debug('좋아요 디비에 추가');
    winston.debug(verse.id);

    return sequelize.transaction().then(function (t) {
      return Like.create({
        userId: userId,
        verseId: verseId
      }, { transaction: t }).then(function (like) {
        return verse.increment('likeCount', {transaction: t});
      }).then(function(verse) {
        t.commit();
      }).catch(function(err) {
        t.rollback();
      })
    });
  }).then(function() {
    winston.debug('좋아요 완료');

    res.json({
      success: 1,
      message: '좋아요 처리 완료.'
    })
  }).catch(function(err) {
    winston.debug('좋아요 실패');

    next(err);
  });
});

/**
 * 내 성경 구절 리스트 가져오기 컨트롤러
 */
router.get('/myList', function(req, res, next) {
  winston.debug('내 성경 구절 리스트 가져오기 컨트롤러 시작');

  var userId = req.query.userId;
  var limit = 20;

  winston.debug('유효성 검사 시작');
  validation.getMyListValidation(userId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('내 성경 구절 리스트 가져오기 시작');

    return Verse.findAll({
      where: {
        userId: userId
      },
      limit: limit
    });
  }).then(function(result) {
    res.json({
      success: 1,
      result: result
    });
  }).catch(function(err) {
    winston.debug('내 성경 리스트 불러오기 실패');

    next(err);
  });
});


module.exports = router;
