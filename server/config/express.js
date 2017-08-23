/**
 * Express configuration
 */

'use strict';

var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    lusca = require('lusca');

var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var errorHandler = require('errorhandler');
var path = require('path');

var config = require('./environment');
//var passport= require('passport');


var cors = require('cors');

module.exports = function (app) {
    var env = app.get('env');


    if (env === 'development' || env === 'test') {
        app.use(express.static(path.join(config.root, '.tmp')));
    }

    if (env === 'production') {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    }

    app.set('appPath', path.join(config.root, 'client'));
    app.use(express.static(app.get('appPath')));
    app.use(morgan('dev'));

    app.set('views', config.root + '/server/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(compression());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    //app.use(passport.initialize());
    app.use(cors());
    app.options('*', cors());


    // Persist sessions with MongoStore / sequelizeStore
    // We need to enable sessions for passport-twitter because it's an
    // oauth 1.0 strategy, and Lusca depends on sessions

    app.use(session({
        secret: config.secrets.session,
        resave: true,
        saveUninitialized: true
    }));


    //TODO - look at this racing contition
    /**
     * Lusca - express server security
     * https://github.com/krakenjs/lusca
     */
    if (env !== 'test') {
        app.use(lusca({
            csrf: { angular: true },
            xframe: 'SAMEORIGIN',
            p3p: 'ABCDEF',
            hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
            xssProtection: true,
            nosniff: true,
            referrerPolicy: 'same-origin'
        }));
    }

    if ('development' === env) {
        app.use(require('connect-livereload')({
            ignore: [
                /^\/api\/(.*)/,
                /\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/, /\.woff(\?.*)?$/,
                /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/
            ]
        }));
    }

    if ('development' === env || 'test' === env) {
        app.use(errorHandler()); // Error handler - has to be last
    }
}
