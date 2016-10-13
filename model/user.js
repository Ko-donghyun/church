
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

module.exports = User;