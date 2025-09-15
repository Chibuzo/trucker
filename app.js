const createError = require('http-errors');
const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const formatView = require('./middlewares/formatView');

const indexRouter = require('./routes/index');
const warehouseRouter = require('./routes/warehouseRouter');
const regionRouter = require('./routes/regionRouter');

var app = express();

const process = require('node:process');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('SIGINT', function () {
    console.log('Server is shutting down...');
    process.kill(process.pid, 'SIGTERM');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // one fucking day
    resave: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(formatView);
app.use('/', indexRouter);
app.use('/warehouse', warehouseRouter);
app.use('/region', regionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.url_referrer = req.get('referrer');
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
