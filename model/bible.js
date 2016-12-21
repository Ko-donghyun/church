var Sequelize = require('sequelize');
var sequelize = require('./../config/env/sequelize.js');

var Bible = sequelize.define('bible', {
  cate: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  book: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  chapter: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  paragraph: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  sentence: {
    type: Sequelize.STRING,
    allowNull: false
  },
  testament: {
    type: Sequelize.STRING,
    allowNull: false
  },
  long_label: {
    type: Sequelize.STRING,
    allowNull: false
  },
  short_label: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  paranoid: false,
  underscored: false,
  collate: 'utf8_unicode_ci',
  engine: 'InnoDB'
});

module.exports = Bible;