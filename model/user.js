
var winston = require('winston');
var Sequelize = require('sequelize');

var sequelize = require('./../config/env/sequelize.js');

var User = sequelize.define('user', {
  uuid: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false
  },
  birthYear: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  churchName:  {
    type: Sequelize.STRING,
    allowNull: false
  },
  isExpel:  {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  paranoid: true,
  underscored: false,
  collate: 'utf8_unicode_ci',
  engine: 'InnoDB'
});

User.sync().then(function () {
  winston.debug('User 디비 생성 완료');
});

module.exports = User;