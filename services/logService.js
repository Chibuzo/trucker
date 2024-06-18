const winston = require('winston');
const { combine, timestamp, json, errors } = winston.format;

const errorFilter = winston.format((info, opts) => {
    return info.level === 'error' ? info : false;
});

const infoFilter = winston.format((info, opts) => {
    return info.level === 'info' ? info : false;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'info.log',
            level: 'info',
            format: combine(infoFilter(), json())
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            format: combine(errorFilter(), json())
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exception.log' }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'rejections.log' }),
    ]
});

module.exports = logger;