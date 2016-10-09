
var winston = require('winston');
var Sequelize = require('sequelize');

var sequelize = require('./../config/env/sequelize.js');

var Verse = sequelize.define('verse', {
  bibleName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startChapter: {
    type: Sequelize.STRING,
    allowNull: false
  },
  endChapter: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startVerse: {
    type: Sequelize.STRING,
    allowNull: false
  },
  endVerse: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: false
  },
  backgroundImageName: {
    type: Sequelize.STRING
  },
  likeCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  commentCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  reportCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
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