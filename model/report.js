
var Sequelize = require('sequelize');

var sequelize = require('./../config/env/sequelize.js');

var Report = sequelize.define('report', {
  reason: {
    type: Sequelize.STRING,
    allowNull: false
  },
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

module.exports = Report;