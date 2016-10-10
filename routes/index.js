var express = require('express');

var helper = require('./helper/helper.js');
var winston = require('./../config/env/winston.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * 어플리 케이션 버전 체크 컨트롤러
 */
router.get('/application/check', function(req, res, next) {
  var appVersion = req.query.appVersion || 0;

  winston.debug('어플리 케이션 버전 체크 시작');
  helper.appVersionCheck(appVersion).then(function(message) {
    winston.debug('어플리 케이션 최신 버전 확인');

    res.json({
      success: 1,
      message: message
    });
  }).catch(function(err) {
    winston.debug('어플리 케이션 버전 업 필요');

    next(err);
  });
});

module.exports = router;
