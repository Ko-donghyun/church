
var Sequelize = require('sequelize');
var credentials = require('./../../credentials.js');

/**
 * 테이블 연결 설정, 비밀번호라던가 다 보이므로 주의!
 */

var sequelize = new Sequelize(credentials.mysqlDateBaseName, credentials.mysqlUserName, credentials.mysqlPassword, {
  host: credentials.host,
  port: credentials.port,
  dialect: credentials.dialect,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  define: { engine: 'InnoDB' }  // 전역으로 설정
});

module.exports = sequelize;