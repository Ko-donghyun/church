
var Sequelize = require('sequelize');
var credentials = require('./../../credentials.js');

/**
 * 테이블 연결 설정, 비밀번호라던가 다 보이므로 주의!
 */

var sequelize = new Sequelize(credentials.mysqlDateBaseName, credentials.mysqlUserName, credentials.mysqlPassword, {
  host: 'church.c2kvxt2glrlu.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  define: { engine: 'InnoDB' }  // 전역으로 설정
});

module.exports = sequelize;