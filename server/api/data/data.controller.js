/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 * GET     /api/data/minmax       ->  getMinMax
 * POST    /api/data              ->  create
 * GET     /api/data/:id          ->  show
 * PUT     /api/data/:id          ->  update
 * DELETE  /api/data/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
//var Data =  require('./data.model');


function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

exports.lsoa = function(req, res) {
    console.log(req.body);
}


