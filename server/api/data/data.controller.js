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
//TODO - add pg-promise?, pools for connecting Update node-pg

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

exports.getArea = function (req, res, next) {
    const lsoas = [];
    const features = {
        "type": "FeatureCollection",
        "features": []
    };
    var boundary = JSON.parse(req.body.boundary);
    var zoom = parseInt(req.body.zoom);
    console.log(zoom);
    var table_name = 'geom.oa11';
    switch (true)
    {
        case zoom >= 16:
            table_name = 'geom.oa11';
            console.log('oa11');
            break;
        case (zoom <= 16 && zoom >= 14):
            console.log('lsoa11');
            table_name = 'geom.lsoa11';
            break;
        case (zoom <= 14 && zoom >= 12):
            table_name = 'geom.wd16';
            console.log('wd16');
            break;
        case (zoom <= 12 && zoom >= 10):
            table_name = 'geom.lad16';
            console.log('lad16');
            break;
        default:
            table_name ='geom.oa11';
    }
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query("SELECT area_code, name, ST_AsGeoJSON(geom) as geometry FROM "+table_name+" WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(boundary.geometry) + "'),4326))");
        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {
            var feature = {
                "type": "Feature",
                "geometry": JSON.parse(row.geometry),
                "properties": {
                    "code": row.area_code,
                    "name": row.name
                }
            };
            features.features.push(feature);
            lsoas.push(row.area_code);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.json({"features": features, "lsoas": lsoas,});
        });
    });
}


exports.getHealth = function (req, res, next) {
    //var results = 'Area Code,Type,Year,Reports\n\r';
    //console.log(req.body);
    var items = req.body.boundary;
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    var results = []
    const header = 'Area Code,Very Good,Good,Fair,Bad,Very Bad\r\n';
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        const query = client.query("SELECT area_code, very_good, good, fair, bad, very_bad FROM stats.census_2011_health WHERE area_code IN (" + lsoas.slice(0, -1) + ")");
        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {
            //console.log(row.lsoa_code, ',', row.type, ',', row.year,',',  row.count, '\n\r');
            //results += row.area_code + ',' + row.very_good + ',' + row.good + ',' + row.fair + ',' + row.bad + ',' + row.very_bad + '\n\r';
            //console.log(results)
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.send(ConvertToCSV(header, JSON.stringify(results)));

        });
    });
}


exports.getTravel = function (req, res, next) {
    //var results = 'Area Code,Type,Year,Reports\n\r';
    //console.log(req.body);
    var items = req.body;
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    var results = []
    var header = 'Area Code,Work Home,Metro,Train,Bus,Taxi,Motocycle,Car or Van,Car Share,Bicycle,By Foot,Other,Not in Employment\r\n';
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        const query = client.query("SELECT area_code, work_home, metro, train, bus, taxi, motocycle, car_or_van, car_share, bicycle, foot, other, unemployed FROM stats.census_2011_towork WHERE area_code IN (" + lsoas.slice(0, -1) + ")");
        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {

            //console.log(row.lsoa_code, ',', row.type, ',', row.year,',',  row.count, '\n\r');
            //results += row.area_code + ',' + row.work_home + ',' + row.metro + ',' + row.train + ',' + row.bus + ',' + row.taxi + ',' + row.motocycle + ','
            //  + row.car_or_van + ',' + row.car_share + ',' + row.bicycle + ',' + row.foot + ',' + row.other + ',' + row.unemployed + '\n\r';
            //console.log(results)
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.send(ConvertToCSV(header, JSON.stringify(results)));
        });
    });
}

exports.getImd = function (req, res, next) {
    //var results = 'Area Code,Type,Year,Reports\n\r';
    //console.log(req.body);
    var items = req.body;
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    var results = []
    var header = 'Area Code,Rank,Decile\r\n';
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        const query = client.query("SELECT lsoa_code_2011, imd_rank, imd_decile FROM stats.imd_2015 WHERE lsoa_code_2011 IN (" + lsoas.slice(0, -1) + ")");
        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {

            //console.log(row.lsoa_code, ',', row.type, ',', row.year,',',  row.count, '\n\r');
            //results += row.area_code + ',' + row.work_home + ',' + row.metro + ',' + row.train + ',' + row.bus + ',' + row.taxi + ',' + row.motocycle + ','
            //  + row.car_or_van + ',' + row.car_share + ',' + row.bicycle + ',' + row.foot + ',' + row.other + ',' + row.unemployed + '\n\r';
            //console.log(results)
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.send(ConvertToCSV(header, JSON.stringify(results)));
        });
    });
}


exports.getPop = function (req, res, next) {
    //var results = 'Area Code,Type,Year,Reports\n\r';
    //console.log(req.body);
    var items = req.body;
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    var results = []
    var header = 'Area Code,16 and under,aged 16-24,aged 25-64,aged 65-84,aged 85 and over\r\n';
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        const query = client.query('SELECT area_code, (0 + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 + 13 + 14 + 15) AS "16 and under",(16 + 17 + 18 + 19 + 20 + 21 + 22 + 23 + 24) AS "aged 16-24", (25 + 26 + 27 + 28 + 29 + 30 + 31 + 32 + 33 + 34 + 35 + 36 + 37 + 38 + 39 + 40 + 41 + 42 + 43 + 44 + 45 + 46 + 47 + 48 + 49 + 50 + 51 + 52 + 53 + 54 + 55 + 56 + 57 + 58 + 59 + 60 + 61 + 62 + 63 + 64) AS "aged 25-64", (65 + 66 + 67 + 68 + 69 + 70 + 71 + 72 + 73 + 74 + 75 + 76 + 77 + 78 + 79 + 80 + 81 + 82 + 83 + 84) AS "aged 65-84", (85+86+87+88+89+90) AS "aged 85 and over" FROM stats.mid_2015_lsoa_pop WHERE area_code IN (' + lsoas.slice(0, -1) + ')');

        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {
            //console.log(row.lsoa_code, ',', row.type, ',', row.year,',',  row.count, '\n\r');
            //results += row.area_code + ',' + row.work_home + ',' + row.metro + ',' + row.train + ',' + row.bus + ',' + row.taxi + ',' + row.motocycle + ','
            //  + row.car_or_van + ',' + row.car_share + ',' + row.bicycle + ',' + row.foot + ',' + row.other + ',' + row.unemployed + '\n\r';
            //console.log(results)
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.send(ConvertToCSV(header, JSON.stringify(results)));
        });
    });
}

exports.getCrime = function (req, res, next) {
    //var results = 'Area Code,Type,Year,Reports\n\r';
    //console.log(req.body);
    var items = req.body;
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    var results = []
    var header = 'Area Code,Year,Type,Number of Reports\r\n';
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        const query = client.query('SELECT lsoa_code,year,type, COUNT(*) FROM stats.police_years WHERE lsoa_code IN (' + lsoas.slice(0, -1) + ') GROUP by lsoa_code, year,type');

        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {
            //console.log(row.lsoa_code, ',', row.type, ',', row.year,',',  row.count, '\n\r');
            //results += row.area_code + ',' + row.work_home + ',' + row.metro + ',' + row.train + ',' + row.bus + ',' + row.taxi + ',' + row.motocycle + ','
            //  + row.car_or_van + ',' + row.car_share + ',' + row.bicycle + ',' + row.foot + ',' + row.other + ',' + row.unemployed + '\n\r';
            //console.log(results)
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.send(ConvertToCSV(header, JSON.stringify(results)));
        });
    });
}


exports.getLoc = function (req,res,next) {
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query("SELECT latitude, longitude from lookups.postcodes WHERE pcd7='"+req.params.postcode.toUpperCase()+"' OR pcd7='"+req.params.postcode.toUpperCase()+"';",function (err,result) {
            console.log("SELECT latitude, longitude from lookups.postcodes WHERE pcd7='"+req.params.postcode.toUpperCase()+"' OR pcd7='"+req.params.postcode.toUpperCase()+"';");
            done();
            //console.log(res.rows[0]);
            return res.json(result.rows[0]);

        });
    });
}


exports.getCc = function (req,res,next) {
    var items = req.body;
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    var results = []
    var header = 'Session, start, end, oa11cd, lsoa11cd, wd16cd, lad16cd, lat, lng\r\n';
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        const query = client.query('SELECT sessionid, starts, ends, oa11cd, lsoa11cd, wd16cd, lad16cd, lat, lng from stats.cc_simple WHERE oa11cd IN (' + lsoas.slice(0, -1) + ') OR lsoa11cd IN (' + lsoas.slice(0, -1) + ') OR wd16cd IN (' + lsoas.slice(0, -1) + ') OR lad16cd IN (' + lsoas.slice(0, -1) + ')');
       // console.log('SELECT sessionid, start, end, oa11cd, lsoa11cd, wd16cd, lad16cd, ST_Y(loc), ST_X(loc) from stats.cc_simple WHERE oa11cd IN (' + lsoas.slice(0, -1) + ') OR lsoa11cd IN (' + lsoas.slice(0, -1) + ') OR wd16cd IN (' + lsoas.slice(0, -1) + ') OR lad16cd IN (' + lsoas.slice(0, -1) + ')');
        //const query = client.query('SELECT lsoa11cd FROM geom.england_and_wales_lsoa_2011 limit 10');
        // Stream results back one row at a time
        query.on('row', (row) => {
            //console.log(row.lsoa_code, ',', row.type, ',', row.year,',',  row.count, '\n\r');
            //results += row.area_code + ',' + row.work_home + ',' + row.metro + ',' + row.train + ',' + row.bus + ',' + row.taxi + ',' + row.motocycle + ','
            //  + row.car_or_van + ',' + row.car_share + ',' + row.bicycle + ',' + row.foot + ',' + row.other + ',' + row.unemployed + '\n\r';
            //console.log(results)
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.send(ConvertToCSV(header, JSON.stringify(results)));
        });
    });
}

/**
 *
 * Function for converting objectArrays to CSV format
 *
 * @param header - header for the csv
 * @param objArray - result rows
 * @returns {*} - csv string of rows
 * @constructor
 */
function ConvertToCSV(header, objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = header;

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

/**
 *
 * @param geomArray - geometry rows
 * @constructor
 */
function ConvertToGeoJSON(geomArray) {
    const features = {
        "type": "FeatureCollection",
        "features": []
    };
}
/**
 * Function
 *
 * @param items
 * @returns {string}
 */
function queryParams(items) {
    var lsoas = '';
    items.forEach(function (item) {
        lsoas += "'" + item + "',"
    });
    return lsoas;
}


