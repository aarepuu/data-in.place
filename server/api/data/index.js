'use strict';

var express = require('express');
var controller = require('./data.controller');
//var auth = require('../../auth/auth.service');

var router = express.Router();


//console.log(controller);
router.post('/', controller.lsoa);


module.exports = router;
