'use strict';

var express = require('express');
var controller = require('./data.controller');
//var auth = require('../../auth/auth.service');

var router = express.Router();


//console.log(controller);
router.get('/', controller.getHealth);
router.post('/lsoa', controller.getLsoa);
router.post('/health', controller.getHealth);
router.post('/travel', controller.getTravel);
router.post('/imd', controller.getImd);
router.post('/pop', controller.getPop);
router.post('/crime', controller.getCrime);


module.exports = router;
