
var winston = require('winston');
var Sequelize = require('sequelize');

var sequelize = require('./../config/env/sequelize.js');

var Verse = sequelize.define('verse', {
  content: {
    type: Sequelize.STRING,
    allowNull: false
  },
  comment: {
    type: Sequelize.STRING,
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

Verse.sync().then(function () {
  winston.debug('Verse 디비 생성 완료');
});

module.exports = Verse;