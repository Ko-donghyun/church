
var User = require('./user');
var Verse = require('./verse');
var Like = require('./like');
var Report = require('./report');
var Bible = require('./bible');

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

Report.sync().then(function () {});

Verse.sync().then(function () {});

Bible.sync().then(function() {});