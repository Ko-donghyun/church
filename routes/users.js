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

/**
 * 유저 정보 저장하기 컨트롤러
 */
router.post('/register', function(req, res, next) {
  winston.debug('유저 정보 저장하기 컨트롤러 시작');

  var userUuid = req.body.uuid;
  var userBirthYear = req.body.birthYear;
  var userGender = req.body.gender;
  var userChurchName = req.body.churchName;

  winston.debug('유저의 validation 체크 시작');
  validation.userInfoValidation(userUuid, userBirthYear, userGender, userChurchName).then(function() {
    winston.debug('유저의 validation 체크 완료');
    winston.debug('유저의 정보 저장 시작');

    return User.create({
      uuid: userUuid,
      birthYear: userBirthYear,
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


/**
 * 유저 확인하기 컨트롤러
 */
router.post('/check', function(req, res, next) {
  winston.debug('유저 확인하기 컨트롤러 시작');

  var userUuid = req.body.uuid;

  winston.debug('유저의 validation 체크 시작');
  validation.userCheckValidation(userUuid).then(function() {
    winston.debug('유저의 validation 체크 완료');
    winston.debug('유저 확인 시작');

    // 1. 신규 유저
    // 2. 정상적인 기존 유저
    // 3. 제제당한 기존 유저

    return User.findOne({
      where: {
        uuid: userUuid
      }
    });
  }).then(function(user) {
    winston.debug('유저 확인 저장 완료');
    winston.debug('리스폰 보내기');
    if (user === null) {
      return Promise.reject(new helper.makePredictableError(200, '신규 유저입니다.'));
    }

    if (user.isExpel === true) {
      return Promise.reject(new helper.makePredictableError(200, '사용이 제한된 유저입니다.'));
    }

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
