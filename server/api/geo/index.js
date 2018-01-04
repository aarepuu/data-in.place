'use strict';

var express = require('express');
var controller = require('./geo.controller.js');
//var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/loc/:postcode', controller.getLoc);
router.post('/area', controller.getArea);
router.post('/lint', controller.validateGeoJson);
router.post('/parse', controller.parseGeoJson);
router.post('/code', controller.geoCode);


module.exports = router;
