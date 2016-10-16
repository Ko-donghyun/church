
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

module.exports = Like;