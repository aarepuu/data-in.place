/**
 *
 * Geo queries controller
 *
 */

'use strict';

const _ = require('lodash');
//var Data =  require('./geo.model');
const db = require('../../db');
const axios = require('axios');
const response = require('../../utils/response');


//Geojson validator
const GJV = require("geojson-validation");

//GeoJson converter
//TODO - use this for making features from Postgres
const GeoJSON = require('geojson');

// const schema = 'geom';

//TODO - integrate this
function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

exports.getArea = async function (req, res, next) {
    // const areas = [];
    // const features = {
    //     "type": "FeatureCollection",
    //     "features": []
    // };
    // let boundary = JSON.parse(req.body.boundary);
    // let zoom = parseInt(req.body.zoom);
    // let table_name = zoomLevel(zoom);
    // const bbox = req.body.bbox.split(',');
    // let lat = req.cookies.lat;
    // let lng = req.cookies.lng;

    // //insert query boundary
    // if (process.env.NODE_ENV == "production") {
    //     if (lat) {
    //         db.query("INSERT INTO boundary(gjson,loc,sessionid) values('" + JSON.stringify(boundary.geometry) + "',ST_SetSRID(ST_Point(" + lng + "," + lat + "),4326),'"+req.sessionID+"')").then(res => {
    //         }).catch(e => console.error(e.stack));
    //     } else {
    //         db.query("INSERT INTO boundary(gjson,sessionid) values('" + JSON.stringify(boundary.geometry) + "','"+req.sessionID+"')").then(res => {
    //         }).catch(e => console.error(e.stack));
    //     }
    // }
    // const query = {
    //     text: "SELECT area_code, name, ST_AsGeoJSON(geom) as geometry FROM " + table_name + " WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326)) AND geom && ST_MakeEnvelope(" + bbox[0] + "::double precision," + bbox[1] + "::double precision," + bbox[2] + "::double precision," + bbox[3] + "::double precision,4326)",
    //     values: [JSON.stringify(boundary.geometry)]
    // };

    // db.query(query).then(result => {
    //     result.rows.forEach(function (row) {
    //         var feature = {
    //             //"id":
    //             "type": "Feature",
    //             "geometry": JSON.parse(row.geometry),
    //             "properties": {
    //                 "code": row.area_code,
    //                 "name": row.name
    //             }
    //         };
    //         features.features.push(feature);
    //         areas.push({"code": row.area_code, "name": row.name});
    //     });

    //     return res.json({"features": features, "areas": areas});
    // }).catch(e => {
    //     console.error(e.stack)
    //     return res.status(500).json({success: false, data: e})
    // });
    try {
        const queryDefaults = {
          where: '1=1',
          geometryType: 'esriGeometryEnvelope',
          inSR: '4326',
          /* outFields: 'objectid,ctry17cd,ctry17nm,ctry17nmw,shape', */
          spatialRel: 'esriSpatialRelIntersects',
          outSR: '4326',
          f: 'geojson'
        };
        const zooms = {
          country: {
            url: 'Administrative_Boundaries/Countries_December_2017_Boundaries_UK_WGS84',
            layer: '4',
            fields: ['objectid', 'shape', 'ctry17cd', 'ctry17nm'], /* no 2018 boundary data available */
            field: 'ctry17'
          },
          region: {
            url: 'Administrative_Boundaries/Regions_December_2017_Boundaries',
            layer: '4',
            fields: ['objectid', 'shape', 'rgn17cd', 'rgn17nm'], /* no 2018 boundary data available */
            field: 'rgn17'
          },
          county: {
            url: 'Administrative_Boundaries/WGS84_UK_Counties_and_Unitary_Authorities_December_2017_Boundaries',
            layer: '4',
            fields: ['objectid', 'shape', 'ctyua17cd', 'ctyua17nm'], /* no 2018 boundary data available */
            field: 'ctyua17'
          },
          lad: {
            url: 'Administrative_Boundaries/Local_Authority_Districts_May_2018_Boundaries',
            layer: '4',
            fields: ['objectid', 'shape', 'lad18cd', 'lad18nm'],
            field: 'lad18'
          },
          // ward: {
          //   url: 'Administrative_Boundaries/Wards_December_2018_Boundaries',
          //   layer: '2',
          //   fields: ['objectid', 'shape', 'wd18cd', 'wd18nm'],
          //   field: 'wd18'
          // },
          ward: {
            url: 'Administrative_Boundaries/Wards_December_2015_Boundaries',
            layer: '2',
            fields: ['objectid', 'shape', 'wd15cd', 'wd15nm'],
            field: 'wd15'
          },
          msoa: {
            url: 'Census_Boundaries/Middle_Super_Output_Areas_December_2011_Boundaries',
            layer: '3',
            fields: ['objectid', 'shape', 'msoa11cd', 'msoa11nm'],
            field: 'msoa11'
          },
          lsoa: {
            url: 'Census_Boundaries/Lower_Super_Output_Areas_December_2011_Boundaries',
            layer: '2',
            fields: ['objectid', 'shape', 'lsoa11cd', 'lsoa11nm'],
            field: 'lsoa11'
          },
          oa: {
            url: 'Census_Boundaries/Output_Area_December_2011_Boundaries',
            layer: '1',
            fields: ['objectid', 'shape', 'oa11cd', 'lad11cd'],
            field: 'oa11'
          }
        };
    
        let zoomlevel = {};
        // check we have zoom
        switch (true) {
          // case req.query.zoom >= 14:
          //   zoomlevel = zooms.oa;
          //   break;
          // case (req.query.zoom < 14 && req.query.zoom >= 12):
          //   zoomlevel = zooms.lsoa;
          //   break;
          // case (req.query.zoom < 12 && req.query.zoom >= 10):
          //   zoomlevel = zooms.msoa;
          //   break;
          // case (req.query.zoom < 10 && req.query.zoom >= 8):
          //   zoomlevel = zooms.ward;
          //   break;
          // case (req.query.zoom < 8 && req.query.zoom >= 6):
          //   zoomlevel = zooms.lad;
          //   break;
          // case (req.query.zoom < 6 && req.query.zoom >= 4):
          //   zoomlevel = zooms.county;
          //   break;
          // case (req.query.zoom < 4 && req.query.zoom >= 2):
          //   zoomlevel = zooms.region;
          //   break;
          case req.body.zoom >= 15:
            zoomlevel = zooms.oa;
            break;
          case (req.body.zoom < 15 && req.body.zoom >= 13):
            zoomlevel = zooms.lsoa;
            break;
          case (req.body.zoom < 13 && req.body.zoom >= 11):
            zoomlevel = zooms.msoa;
            break;
          // case (req.query.zoom < 13 && req.query.zoom >= 11):
          //   zoomlevel = zooms.ward;
          //   break;
          case (req.body.zoom < 11 && req.body.zoom >= 10):
            zoomlevel = zooms.lad;
            break;
          case (req.body.zoom < 10 && req.body.zoom >= 9):
            zoomlevel = zooms.county;
            break;
          case (req.body.zoom < 9 && req.body.zoom >= 4):
            zoomlevel = zooms.region;
            break;
          default:
            zoomlevel = zooms.country;
        }
    
        // const bboxstring = `${req.query.sw_lng},${req.query.sw_lat},${req.query.ne_lng},${req.query.ne_lat}`;
        const bboxstring = req.body.bbox;
        const queryParams = Object.assign({}, queryDefaults, {
          geometry: bboxstring,
          outFields: zoomlevel.fields.toString()
        });
    
        const result = await axios.get(`https://ons-inspire.esriuk.com/arcgis/rest/services/${zoomlevel.url}/MapServer/${zoomlevel.layer}/query`, {
          params: queryParams
        });
        if (!result.data.error) {
          response.success(res, Object.assign({}, result.data, {
            field: zoomlevel.field
          }));
        }
        else {
          console.log(result.data.error);
          response.failed(res, [result.data.message]);
        }
      }
      catch (error) {
        console.log(error);
        response.failed(res, [error.message]);
      }
};

exports.getLoc = function (req, res, next) {
    const query = {
        text: "SELECT latitude as lat, longitude as lng from postcode_query WHERE pcd=$1;",
        values: [req.params.postcode.replace(' ', '').toUpperCase()]
    };
    db.query(query).then(result => {
        return res.send(result.rows[0]);
    }).catch(e => {
        console.error(e.stack);
        return res.status(500).json({success: false, data: e})
    });
}

exports.validateGeoJson = function (req, res, next) {
    var json = JSON.parse(req.params.rawJson);
    GJV.valid(json, function (isValid, errs) {
        if (isValid) {
            console.log('valid!');
        } else {
            errs.forEach(function (err) {
                console.log(err);
            });
        }
    });
    return;
};

exports.parseGeoJson = function (req, res, next) {
    var geoJson = GeoJSON.parse(req.body.rawdata, {Point: [req.body.lat, req.body.lng]})
    return res.json(geoJson);
}

exports.geoCode = function (req, res, next) {
    var pcodes = queryParams(req.body);
    const query = {
        text: "SELECT * from postcode_query WHERE pcd IN (" + pcodes + ");",
    };
    db.query(query).then(result => {
        return res.json(result.rows);
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
    console.log(zoom);
    switch (true) {
        case zoom >= 16:
            level = 'oa11';
            console.log('oa11');
            break;
        case (zoom < 16 && zoom >= 14):
            level = 'lsoa11';
            console.log('lsoa11');
            break;
        case (zoom < 14 && zoom >= 12):
            console.log('wd16');
            level = 'wd16';
            break;
        case (zoom < 12 && zoom >= 10):
            console.log('lad16');
            level = 'lad16';
            break;
        case (zoom < 10 && zoom >= 8):
            console.log('rgn16');
            level = 'rgn16';
            break;
        default:
            level = 'ctry16';
    }
    return level;
}


