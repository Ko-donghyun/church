
var User = require('./user');
var Verse = require('./verse');
var Like = require('./like');

User.hasMany(Like, {
  foreignKey: {
    allowNull: false
  },
  constraints: false
});
Verse.hasMany(Like, {
  foreignKey: {
    allowNull: false
  },
  constraints: false
});

User.sync().then(function () {});

Like.sync().then(function () {});

Verse.sync().then(function () {});