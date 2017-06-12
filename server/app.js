/**
 * Main application file
 */

'use strict';

const express = require('express');
const config = require('./config/environment');
const http = require('http');

// Setup server
const app = express();
const server = http.createServer(app);
require('./config/express')(app);
require('./routes')(app);

//move to config and separate files
var port = process.env.PORT || 3000; // set our port
//var router = express.Router();
//app.use(express.static(__dirname + '/client'));

/*app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});*/

//require('./config/express').default(app);
//require('./routes').default(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function() {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
