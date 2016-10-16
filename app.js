var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var configure = require('./config/env/configure.js');
var routes = require('./routes/index');
var users = require('./routes/users');
var verse = require('./routes/verse');
var winston = require('./config/env/winston.js');
var helper = require('./routes/helper/helper.js');

var Relation = require('./model/relation');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/verse', verse);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new helper.makePredictableError(404, 'Not Found');
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    if (err.statusCode === 200) {
      winston.error('에러 발생 : %s', err.message);

      return res.json({
        success: 0,
        message: err.message
      })
    }

    if (err.statusCode === 404) {
      winston.error('에러 발생 : %s', err.message);

      return res.json({
        success: 0,
        message: err.message
      })
    }

    winston.error('에러 발생 : %s', err.stack);

    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  if (err.statusCode === 200) {
    winston.error('에러 발생 : %s', err.message);

    return res.json({
      success: 0,
      message: err.message
    })
  }

  if (err.statusCode === 404) {
    winston.error('에러 발생 : %s', err.message);

    return res.json({
      success: 0,
      message: err.message
    })
  }

  winston.error('에러 발생 : %s', err.stack);

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
