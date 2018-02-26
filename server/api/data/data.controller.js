/**
 *
 * Data queries controller
 *
 */

'use strict';

const _ = require('lodash');
//var Data =  require('./data.model');
const db = require('../../db')

const request = require('request');

const schema = 'stats';

//TODO - integrate this
function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}


exports.getDatasets = function (req, res, next) {
    const query = {
        text: "SELECT * from stats.datasets where active = true;",
    };
    db.query(query).then(result => {
        return res.json(result.rows);
    }).catch(e => {
        console.error(e.stack);
        return res.status(500).json({success: false, data: e})
    });
}
exports.getHealth = function (req, res, next) {
    var items = req.body.codes;
    var zoom = req.body.zoom;
    var areas = queryParams(items);
    const header = 'Area Code,Very Good,Good,Fair,Bad,Very Bad\r\n';
    const query = {
        text: 'SELECT area_code, very_good, good, fair, bad, very_bad FROM stats.census_2011_health WHERE area_code IN (' + areas + ')',
        rowMode: 'array'
    };
    //TODO - make into a function
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}


exports.getTravel = function (req, res, next) {
    var items = req.body.codes;
    var areas = queryParams(items);
    var header = 'Area Code,Work Home,Metro,Train,Bus,Taxi,Motocycle,Car or Van,Car Share,Bicycle,By Foot,Other,Not in Employment\r\n';
    const query = {
        text: 'SELECT area_code, work_home, metro, train, bus, taxi, motocycle, car_or_van, car_share, bicycle, foot, other, unemployed FROM stats.census_2011_towork WHERE area_code IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}

exports.getImd = function (req, res, next) {
    var items = req.body.codes;
    var areas = queryParams(items);
    var header = 'Area Code,Score,Rank,Decile\r\n';
    const query = {
        text: 'SELECT lsoa_code_2011, index_of_multiple_deprivation_imd_score, index_of_multiple_deprivation_imd_rank, index_of_multiple_deprivation_imd_decile FROM stats.all_ranks_imd_2015 WHERE lsoa_code_2011 IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        console.log(result)
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}


exports.getPop = function (req, res, next) {
    var items = req.body.codes;
    var areas = queryParams(items);
    var header = 'Area code,All ages,16 and under,aged 16-24,aged 25-64,aged 65-84,aged 85 and over\r\n';
    const query = {
        text: 'SELECT area_code, all_ages, ("0" + "1" + "2" + "3" + "4" + "5" + "6" + "7" + "8" + "9" + "10" + "11" + "12" + "13" + "14" + "15") AS "16 and under",("16" + "17" + "18" + "19" + "20" + "21" + "22" + "23" + "24") AS "aged 16-24", ("25" + "26" + "27" + "28" + "29" + "30" + "31" + "32" + "33" + "34" + "35" + "36" + "37" + "38" + "39" + "40" + "41" + "42" + "43" + "44" + "45" + "46" + "47" + "48" + "49" + "50" + "51" + "52" + "53" + "54" + "55" + "56" + "57" + "58" + "59" + "60" + "61" + "62" + "63" + "64") AS "aged 25-64", ("65" + "66" + "67" + "68" + "69" + "70" + "71" + "72" + "73" + "74" + "75" + "76" + "77" + "78" + "79" + "80" + "81" + "82" + "83" + "84") AS "aged 65-84", ("85"+"86"+"87"+"88"+"89"+"90+") AS "aged 85 and over" FROM stats.mid16_est_lsoa_pop WHERE area_code IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}

exports.getCrime = function (req, res, next) {
    var items = req.body.codes;
    var areas = queryParams(items);
    var header = 'Area Code,Year,Type,Number of Reports\r\n';
    const query = {
        text: 'SELECT lsoa_code,year,type, COUNT(*) FROM stats.police_years WHERE lsoa_code IN (' + areas + ') GROUP by lsoa_code, year,type',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}


exports.getTenure = function (req, res, next) {
    var items = req.body.codes;
    var areas = queryParams(items);
    var header = 'Area Code,Number of social houses,Number of other houses\r\n';
    const query = {
        text: 'SELECT area_code,social_total, sum-social_total AS other from stats.census_2011_lsoa_tenure WHERE area_code IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}

exports.getEco = function (req, res, next) {
    var items = req.body.codes;
    var areas = queryParams(items);
    var header = 'Area Code,In Employment,Unemployed,Students,Unable to work\r\n';
    const query = {
        text: 'SELECT area_code,(active_full_time+active_part_time+active_self_employed) as working,(active_unemployed) as unemployed,(active_student+inactive_student) as students,(inactive_retired+inactive_stayhome+inactive_disabled+inactive_other) as unable from stats.census_2011_economic_activity WHERE area_code IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}


exports.getCc = function (req, res, next) {
    var items = req.body.codes;
    var zoom = req.body.zoom;
    var areas = queryParams(items);
    var area_level = zoomLevel(zoom);
    var header = 'Session,Start,End,Area Code,Latitude,Longitude\r\n';
    const query = {
        text: 'SELECT sessionid, starts, ends, ' + area_level + 'cd, lat, lng from stats.cc_t1simple WHERE oa11cd IN (' + areas + ') OR lsoa11cd IN (' + areas + ') OR wd16cd IN (' + areas + ') OR lad16cd IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}

exports.getObes = function (req, res, next) {
    var items = req.body.codes;
    var zoom = req.body.zoom;
    var areas = queryParams(items);
    var area_level = zoomLevel(zoom);
    var header = 'Area Code,Area Name,Year,Classification,Metric,Value\r\n';
    const query = {
        text: 'SELECT area_code, org_name, year, classification, metric, value from stats.obes where area_code IN (' + areas + ')',
        rowMode: 'array'
    };
    db.query(query).then(result => {
        return res.send(ConvertToCSV(header, JSON.stringify(result.rows)));
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}


exports.getPublicHealth = function (req, res, next) {
    var resbond = res;
    request('http://fingertips.phe.org.uk/api/profiles', { json: true }, (err, res, body) => {
        if (err) {
            console.log(err);
            return resbond.status(500).json({success: false, data: err})
        }
        return resbond.send(body);
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

//TODO - try if toString() works
/**
 * Function for converting array to sql comma separated list
 *
 * @param items
 * @returns {string}
 */
function queryParams(items) {
    var areas = '';
    items.forEach(function (item) {
        areas += "'" + item + "',"
    });
    return areas.slice(0, -1);
}


/**
 * Function for getting admin level table based on zoom
 *
 * @param zoom
 * @returns level - admin table name
 */
function zoomLevel(zoom) {
    var level = '';
    switch (true) {
        case zoom >= 16:
            level = 'oa11';
            console.log('oa11');
            break;
        case (zoom <= 16 && zoom >= 14):
            level = 'lsoa11';
            console.log('lsoa11');
            break;
        case (zoom <= 14 && zoom >= 12):
            console.log('wd16');
            level = 'wd16';
            break;
        case (zoom <= 12 && zoom >= 10):
            console.log('lad16');
            level = 'lad16';
            break;
        default:
            level = 'lad16';
    }
    return level;
}


