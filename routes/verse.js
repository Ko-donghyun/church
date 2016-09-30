var express = require('express');
var Sequelize = require('sequelize');

var helper = require('./helper/helper.js');
var validation = require('./validation/validation.js');
var Verse = require('./../model/verse');
var winston = require('./../config/env/winston.js');

var router = express.Router();

/**
 * 성경 구절 가져오기 컨트롤러
 */
router.get('/bible', function(req, res, next) {
  winston.debug('성경 구절 가져오기 컨트롤러 시작');

  var version = req.query.version;
  var name = req.query.name;
  var startChapter = req.query.startChapter;
  var endChapter = req.query.endChapter;
  var startParagraph = req.query.startParagraph;
  var endParagraph = req.query.endParagraph;

  winston.debug('유효성 검사 시작');
  validation.getBibleVerseValidation(version, name, startChapter, endChapter, startParagraph, endParagraph).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('성경 구절 가져오기 시작');

    helper.getBibleVerse(version, name, startChapter, endChapter, startParagraph, endParagraph).then(function(bibleText) {
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

  var imageUrl = '';

  var content = req.body.content;
  var comment = req.body.comment;
  var backgroundImageName = req.body.backgroundImageName;
  var userId = req.body.userId;

  winston.debug('유효성 검사 시작');
  validation.saveVerseValidation(content, comment, backgroundImageName, userId).then(function() {
    winston.debug('유효성 검사 완료');
    winston.debug('성경 구절 저장하기 시작');

    return Verse.create({
      content: content,
      comment: comment,
      backgroundImageUrl: imageUrl + backgroundImageName,
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

  var limit = 20;
  var today = new Date().getTime();
  var yesterday = new Date(today - 86400000);

  Verse.findAll({
    where: {
      createdAt: {
        gt: yesterday
      }
    },
    order: [
      Sequelize.fn( 'RAND' )
    ],
    limit: limit
  }).then(function(result) {
    res.json({
      success: 1,
      result: result
    })
  }).catch(function(err) {
    winston.debug('랜덤으로 성경 리스트 불러오기 실패');

    next(err);
  });
});

module.exports = router;
