var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//require('leaflet.heightgraph');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();
var router = express.Router();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.use('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, './views/index.html'));
  });

module.exports = app;
