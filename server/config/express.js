var config = require('./config');
var path = require('path');
var express = require('express');
var morgan = require('morgan');  // Logger
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

module.exports = function() {
  var app = express();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    // app.use(compress());
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  // app.use(methodOverride());

  app.set('views', path.join(__dirname, '../../client'));
  app.set('view engine', 'ejs');

  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret
  }));

  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  // TODO: Find out how to link all view to one absolute static path
  app.use(express.static(path.join(__dirname, '/../../client')));
  app.use('/api/reset', express.static(path.join(__dirname, '/../../client')));

  // Routes
  var api = express.Router();  // eslint-disable-line new-cap

  api.use('/', require('../app/routes/auth'));
  api.use('/places', require('../app/routes/places'));
  api.use('/users', require('../app/routes/users'));
  api.use('/tracks', require('../app/routes/tracks'));
  api.use('/blogs', require('../app/routes/blogs'));
  api.use('/search', require('../app/routes/search'));
  api.use('/events', require('../app/routes/events'));

  app.use('/api', api);

  app.get('/', function(req, res) {
    res.render('index', {
      messages: {
        danger: req.flash('error'),
        warning: req.flash('warning'),
        info: req.flash('info'),
        success: req.flash('success')
      },
      user: JSON.stringify(req.user)
    });
  });

  return app;
};
