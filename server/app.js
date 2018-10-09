/**
 * Main application file
 */

'use strict';

const config = require('./config/environment');

const express = require('express');
const http = require('http');

// Setup server
const app = express();


const server = http.createServer(app);

require('./config/express')(app);
require('./routes')(app);
//const socket = require('./socket.js');
// Hook Socket.io into Express
const io = require('socket.io').listen(server);
//require('./db')

// Populate databases with sample data
//if (config.seedDB) { require('./config/seed'); }

// Socket.io Communication
//io.sockets.on('connection', socket);

// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function () {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
