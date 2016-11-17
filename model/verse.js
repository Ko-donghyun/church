
var Sequelize = require('sequelize');

var sequelize = require('./../config/env/sequelize.js');

var Verse = sequelize.define('verse', {
  bibleName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bibleKoreanName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startChapter: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  endChapter: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  startVerse: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  endVerse: {
    type: Sequelize.INTEGER,
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
  tag1: {
    type: Sequelize.STRING
  },
  tag2: {
    type: Sequelize.STRING
  },
  randomNumber: {
    type: Sequelize.INTEGER,
    allowNull: false
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


module.exports = Verse;