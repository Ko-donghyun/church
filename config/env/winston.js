
var winston = require('winston');

var logger;

if (process.env.NODE_ENV === 'development') {
  // Development 환경 일 때의 설정
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug' })
    ]
  });
} else if (process.env.NODE_ENV === 'production') {
  // Production 환경 일 때의 설정
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'info',
        colorize: true,
        prettyPrint: true
      })
    ]
  });
}

module.exports = logger;
