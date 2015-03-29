var express = require('express');
var auth = require("basic-auth");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var user = require('./user');
var site = require('./site');

var config = require('config');

//var routes = require('./routes/index');
//var users = require('./routes/users');
//var client = require('./routes/client');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser());


app.use(function(req, res, next) {
  var username = config.get('auth.user');
  var password = config.get('auth.password');
  var user;
  user = auth(req);
  if (user === undefined || user["name"] !== username || user["pass"] !== password) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", "Basic realm=\"Wivem\"");
    res.end("Unauthorized");
  } else {
    next();
  }
});


var debug = require('debug')('server');

app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

var socketio = require('./libs/socket')(server);
app.set('socketio', socketio);

app.get('/', site.index);
app.post('/eval', site.eval);
app.post('/disable_on', site.disable_on);
app.post('/disable_off', site.disable_off);
app.get('/users', user.list);

//app.use('/', routes);
//app.use('/users', users);
//app.use('client', client);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
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
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

