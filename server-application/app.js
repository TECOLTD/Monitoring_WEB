var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var passport = require('passport');
var AuthLocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var users = require('./routes/users');
var flash = require('connect-flash');
var user_base = require('./userBase');
user_base.initialize();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession( {
                        secret: "vinipuh",
             saveUninitialized: true,
                        resave: true,
                        cookie: {maxAge: 60000}
               }
));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);

passport.use('local', new AuthLocalStrategy(
    function (username, password, done) {
        user_base.get(username, function(cred) {
            if (cred && cred.password == password) {
                return done(null, {username: username,permissions: cred.permissions});
            }
            return done(null, false, {message: ' wrong login or user name'});
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function(data, done) {
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(e)
    }
    console.log('deserialize');
});

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
