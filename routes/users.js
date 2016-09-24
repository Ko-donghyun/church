var express = require('express');

var User = require('./../model/user');
var validation = require('./validation/validation.js');
var helper = require('./helper/helper.js');
var winston = require('./../config/env/winston.js');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
  var userUuid = req.body.uuid;
  var userAge = req.body.age;
  var userGender = req.body.gender;
  var userChurchName = req.body.churchName;

  winston.debug('유저의 validation 체크 시작');
  validation.userInfoValidation(userUuid, userAge, userGender, userChurchName).then(function() {
    winston.debug('유저의 validation 체크 완료');
    winston.debug('유저의 정보 저장 시작');

    return User.create({
      uuid: userUuid,
      age: userAge,
      gender: userGender,
      churchName: userChurchName
    });
  }).then(function(user) {
    winston.debug('유저의 정보 저장 완료');
    winston.debug('리스폰 보내기');

    res.json({
      success: 1,
      result: user.id
    });
  }).catch(function(err) {
    winston.debug('유저 정보 저장 실패');

    next(err);
  });
});

module.exports = router;
