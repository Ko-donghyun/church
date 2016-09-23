
var winston = require('winston');
var Sequelize = require('sequelize');

var sequelize = require('./../config/env/sequelize.js');

var Like = sequelize.define('like', {
  verseId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true,
  underscored: false,
  collate: 'utf8_unicode_ci',
  engine: 'InnoDB'
});

Like.sync().then(function () {
  winston.debug('Like 디비 생성 완료');
});

module.exports = Like;