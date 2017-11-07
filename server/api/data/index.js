'use strict';

var express = require('express');
var controller = require('./data.controller.js');
//var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/health', controller.getHealth);
router.post('/travel', controller.getTravel);
router.post('/imd', controller.getImd);
router.post('/pop', controller.getPop);
router.post('/crime', controller.getCrime);
router.post('/tenure',controller.getTenure);
router.post('/eco', controller.getEco);
router.post('/cc', controller.getCc);


module.exports = router;
