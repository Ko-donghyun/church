var express = require('express');

var helper = require('./helper/helper.js');
var validation = require('./validation/validation.js');
var Verse = require('./../model/verse');
var winston = require('./../config/env/winston.js');

var router = express.Router();

/* GET home page. */
router.get('/bible', function(req, res, next) {
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

module.exports = router;
