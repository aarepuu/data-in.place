/**
 *
 * Geo queries controller
 *
 */

'use strict';

const _ = require('lodash');
//var Data =  require('./geo.model');
const db = require('../../db')


const schema = 'geom';

//TODO - integrate this
function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

exports.getArea = function (req, res, next) {
    const areas = [];
    const features = {
        "type": "FeatureCollection",
        "features": []
    };
    var boundary = JSON.parse(req.body.boundary);
    var zoom = parseInt(req.body.zoom);
    var table_name = zoomLevel(zoom);

    //insert query boundary
    //client.query('INSERT INTO stats.boundary(gjson) values($1)',[JSON.stringify(boundary.geometry)]);
    const query = {
        text: "SELECT area_code, name, ST_AsGeoJSON(geom) as geometry FROM " + schema + "." + table_name + " WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326))",
        values: [JSON.stringify(boundary.geometry)]
    };

    db.query(query).then(result => {
        result.rows.forEach(function (row) {
            var feature = {
                //"id":
                "type": "Feature",
                "geometry": JSON.parse(row.geometry),
                "properties": {
                    "code": row.area_code,
                    "name": row.name
                }
            };
            features.features.push(feature);
            areas.push({"code": row.area_code, "name": row.name});
        });

        return res.json({"features": features, "areas": areas});
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
}

exports.getLoc = function (req, res, next) {
    const query = {
        text: "SELECT latitude, longitude from lookups.postcode_query WHERE pcd=$1;",
        values: [req.params.postcode.replace(' ', '').toUpperCase()]
    };
    db.query(query).then(result => {
        return res.send(result.rows[0]);
    }).catch(e => {
        console.error(e.stack)
        return res.status(500).json({success: false, data: e})
    });
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
            break;
        default:
            level = 'rgn16';
    }
    return level;
}


