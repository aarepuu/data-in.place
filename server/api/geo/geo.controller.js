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
const Terraformer = require('@terraformer/arcgis');



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
    // https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA1/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=144.95915707200768%2C-37.840444382242225%2C144.96406283229592%2C-37.8357834008135&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=%5B%27objectid%2Cshape%2Csa1_code_2021%27%5D&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson
    try {
        const queryDefaults = {
          where: '1=1',
          geometryType: 'esriGeometryEnvelope',
          inSR: '4326',        
          spatialRel: 'esriSpatialRelIntersects',
          outSR: '4326',
          geometryPrecision: '4',
          returnTrueCurves: false,
          returnExtentsOnly: true,
          f: 'pjson'
        };
        const zooms = {
          aus: {
            url: 'ASGS2021/AUS',
            layer: '1',
            fields: ['objectid', 'shape', 'aus_code_2021', 'aus_name_2021'],
            field: 'aus'
          },
          ste: {
            url: 'ASGS2021/STE',
            layer: '1',
            fields: ['objectid', 'shape', 'state_code_2021', 'state_name_2021'],
            field: 'state'
          },
          gccsa: {
            url: 'ASGS2021/GCCSA',
            layer: '1',
            fields: ['objectid', 'shape', 'gccsa_code_2021', 'gccsa_name_2021'],
            field: 'gccsa'
          },
          sa4: {
            url: 'ASGS2021/SA4',
            layer: '1',
            fields: ['objectid', 'shape', 'sa4_code_2021', 'sa4_name_2021'],
            field: 'sa4'
          },
          // ward: {
          //   url: 'Administrative_Boundaries/Wards_December_2018_Boundaries',
          //   layer: '2',
          //   fields: ['objectid', 'shape', 'wd18cd', 'wd18nm'],
          //   field: 'wd18'
          // },
          sa3: {
            url: 'ASGS2021/SA3',
            layer: '1',
            fields: ['objectid', 'shape', 'sa3_code_2021', 'sa3_name_2021'],
            field: 'sa3'
          },
          sa2: {
            url: 'ASGS2021/SA2',
            layer: '1',
            fields: ['objectid', 'shape', 'sa2_code_2021', 'sa2_name_2021'],
            field: 'sa2'
          },
          sa1: {
            url: 'ASGS2021/SA1',
            layer: '1',
            fields: ['objectid', 'shape', 'sa1_code_2021'],
            field: 'sa1'
          },
          mb: {
            url: 'ASGS2021/MB',
            layer: '1',
            fields: ['objectid', 'shape', 'mb_code_2021'],
            field: 'mb' 
          }
        };
    
        let zoomlevel = {};
        // check we have zoom
        // switch (true) {
        //   // case req.query.zoom >= 14:
        //   //   zoomlevel = zooms.oa;
        //   //   break;
        //   // case (req.query.zoom < 14 && req.query.zoom >= 12):
        //   //   zoomlevel = zooms.lsoa;
        //   //   break;
        //   // case (req.query.zoom < 12 && req.query.zoom >= 10):
        //   //   zoomlevel = zooms.msoa;
        //   //   break;
        //   // case (req.query.zoom < 10 && req.query.zoom >= 8):
        //   //   zoomlevel = zooms.ward;
        //   //   break;
        //   // case (req.query.zoom < 8 && req.query.zoom >= 6):
        //   //   zoomlevel = zooms.lad;
        //   //   break;
        //   // case (req.query.zoom < 6 && req.query.zoom >= 4):
        //   //   zoomlevel = zooms.county;
        //   //   break;
        //   // case (req.query.zoom < 4 && req.query.zoom >= 2):
        //   //   zoomlevel = zooms.region;
        //   //   break;
        //   case req.body.zoom >= 15:
        //     zoomlevel = zooms.block;
        //     break;
        //   case (req.body.zoom < 15 && req.body.zoom >= 13):
        //     zoomlevel = zooms.level1;
        //     break;
        //   case (req.body.zoom < 13 && req.body.zoom >= 11):  
        //     zoomlevel = zooms.msoa;
        //     break;
        //   // case (req.query.zoom < 13 && req.query.zoom >= 11):
        //   //   zoomlevel = zooms.ward;
        //   //   break;
        //   case (req.body.zoom < 11 && req.body.zoom >= 10):
        //     zoomlevel = zooms.lad;
        //     break;
        //   case (req.body.zoom < 10 && req.body.zoom >= 9):
        //     zoomlevel = zooms.county;
        //     break;
        //   case (req.body.zoom < 9 && req.body.zoom >= 4):
        //     zoomlevel = zooms.region;
        //     break;
        //   default:
        //     zoomlevel = zooms.country;
        // }
    
        zoomlevel = zooms[getzoomLevel(req.body.zoom)]
        // const bboxstring = `${req.query.sw_lng},${req.query.sw_lat},${req.query.ne_lng},${req.query.ne_lat}`;
        const bboxstring = req.body.bbox;
        const queryParams = Object.assign({}, queryDefaults, {
          geometry: bboxstring,
          outFields: zoomlevel.fields.toString()
        });
        console.log(queryParams)
        console.log(`https://geo.abs.gov.au/arcgis/rest/services/${zoomlevel.url}/MapServer/${zoomlevel.layer}/query`)
        const result = await axios.get(`https://geo.abs.gov.au/arcgis/rest/services/${zoomlevel.url}/MapServer/${zoomlevel.layer}/query`, {
          params: queryParams
        });
        console.log(zoomlevel.field)

        if (!result.data.error) {
          response.success(res, Object.assign({}, Terraformer.arcgisToGeoJSON(result.data), {
            field: zoomlevel.field.toUpperCase()
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
function getzoomLevel(zoom) {
    var level = '';
    console.log(zoom);
    switch (true) {
        case zoom >= 16:
            level = 'mb';
            console.log('mb');
            break;
        case (zoom < 16 && zoom >= 14):
            level = 'sa1';
            console.log('sa1');
            break;
        case (zoom < 14 && zoom >= 12):
            console.log('sa2');
            level = 'sa2';
            break;
        case (zoom < 12 && zoom >= 10):
            console.log('sa3');
            level = 'sa3';
            break;
        case (zoom < 10 && zoom >= 8):
            console.log('sa4');
            level = 'sa4';
            break;
        // case (zoom < 8 && zoom >= 6):
        //     console.log('capital');
        //     level = 'capital';
        //     break;
        default:
          level = 'gccsa';
    }
    return level;
}


