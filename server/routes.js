/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function routes(app) {

    // Insert routes below
    app.use('/api/geo', require('./api/geo'));
    app.use('/api/data', require('./api/data'));
    //app.use('/api/data', require('./api/data'));



    // All undefined asset or api routes should return a 404
    //TODO - clean this up
    app.route('/:url(api|auth|partials|lib|js|imgs|data|css|charts|templates|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
        });

};
