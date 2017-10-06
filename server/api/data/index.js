'use strict';

var express = require('express');
var controller = require('./data.controller');
//var auth = require('../../auth/auth.service');

var router = express.Router();


//console.log(controller);
router.get('/', controller.getHealth);
router.get('/loc/:postcode', controller.getLoc);
router.post('/area', controller.getArea);
router.post('/health', controller.getHealth);
router.post('/travel', controller.getTravel);
router.post('/imd', controller.getImd);
router.post('/pop', controller.getPop);
router.post('/crime', controller.getCrime);
router.post('/tenure',controller.getTenure);
router.post('/eco', controller.getEco);
router.post('/cc', controller.getCc);


module.exports = router;