/**
 * Express configuration
 */

'use strict';

const express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    lusca = require('lusca');

const favicon = require('serve-favicon');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const errorHandler = require('errorhandler');
const path = require('path');

const config = require('./environment');
//const passport= require('passport');


const cors = require('cors');

module.exports = function (app) {
    const env = app.get('env');


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


    //TODO - look at this racing condition
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
