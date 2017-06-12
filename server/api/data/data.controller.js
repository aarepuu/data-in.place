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

const _ = require('lodash');
//var Data =  require('./data.model');
//require('./db');

const pg = require('pg');
//TODO - add pg-promise?, pools for connecting

//Setup Postgres (database)
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/uk';

//const client = new pg.Client(connectionString);
//client.connect();


function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

exports.lsoa = function (req, res, next) {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query("SELECT lsoa11cd FROM geom.lsoa11_geom WHERE ST_Intersects(ST_Transform(geom,4326), ST_SetSRID(ST_GeomFromGeoJSON('"+JSON.stringify(req.body.geometry)+"'),4326))");
        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.json(results);
        });
    });
}


