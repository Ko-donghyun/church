var express = require('express');

var currentAppVersion = 1.0;

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/application/check', function(req, res, next) {
  var appVersion = req.query.appVersion || 0;

  if (appVersion < currentAppVersion) {
    return res.json({
      success: 0,
      message: '버전이 낮습니다.'
    });
  }

  res.json({
    success: 1,
    message: '최신 버전 입니다.'
  });
});

module.exports = router;
