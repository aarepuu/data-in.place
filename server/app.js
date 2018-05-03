/**
 * Main application file
 */

'use strict';

const express = require('express');
const config = require('./config/environment');
const http = require('http');
//const ngrok = require('ngrok');

// Setup server
const app = express();
const server = http.createServer(app);
require('./config/express')(app);
require('./routes')(app);
//require('./db')

// Populate databases with sample data
//if (config.seedDB) { require('./config/seed'); }


// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function() {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
    /*ngrok.connect(config.port).then(url =>{
        console.log(url);
    });*/
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
