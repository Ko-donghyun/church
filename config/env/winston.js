
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
        level: 'warn',
        colorize: true,
        prettyPrint: true
      }),

      // 하루 단위로 파일로 저장
      new (require('winston-daily-rotate-file'))({
        level: 'warn',
        filename: './logs/daily.log',
        datePattern: '.yyyy-MM-dd'
      })
    ]
  });
}

module.exports = logger;
