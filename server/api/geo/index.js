'use strict';

var express = require('express');
var controller = require('./geo.controller.js');
//var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/loc/:postcode', controller.getLoc);
router.post('/area', controller.getArea);


module.exports = router;
