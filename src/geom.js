// start zoom and centre point of the map
export const MAP_DEFAULTS = {
  ZOOM: 12,
  CENTER: [145.133957, -37.907803],
}
// restrict map panning
export const MAP_RESTRICTIONS = {
  // see https://gist.github.com/graydon/11198540
  BOUNDS: [
    [113.338953078, -43.6345972634], // Southwest coordinates
    [153.569469029, -10.6681857235], // Northeast coordinates
  ],
  MAX_ZOOM_LEVEL: 17,
  MIN_ZOOM_LEVEL: 6,
}
//  ArcGIS MapServer query parameters
export const ESRI_QUERY_DEFAULTS = {
  where: '1=1',
  geometryType: 'esriGeometryEnvelope',
  inSR: '4326',
  spatialRel: 'esriSpatialRelIntersects',
  outSR: '4326',
  geometryPrecision: '4',
  returnTrueCurves: false,
  returnExtentsOnly: true,
  f: 'geoJSON',
}

export const ZOOM_LEVELS = [
  {
    name: 'country',
    path: 'ASGS2021/AUS', // mapserver subpath
    layer: '1', // layer number
    fields: ['objectid', 'shape', 'aus_code_2021', 'aus_name_2021'], // return fields
    field: 'AUS_CODE_2021', // id field for data queries
    zoom: [2, -1], // [ max, min ]
  },
  {
    name: 'state',
    path: 'ASGS2021/STE',
    layer: '1',
    fields: ['objectid', 'shape', 'state_code_2021', 'state_name_2021'],
    field: 'STATE_CODE_2021',
    zoom: [4, 2],
  },
  {
    name: 'gccsa',
    path: 'ASGS2021/GCCSA',
    layer: '1',
    fields: ['objectid', 'shape', 'gccsa_code_2021', 'gccsa_name_2021'],
    field: 'GCCSA_CODE_2021',
    zoom: [6, 4],
  },
  {
    name: 'sa4',
    path: 'ASGS2021/SA4',
    layer: '1',
    fields: ['objectid', 'shape', 'sa4_code_2021', 'sa4_name_2021'],
    field: 'SA4_CODE_2021',
    zoom: [8, 6],
  },
  {
    name: 'sa3',
    path: 'ASGS2021/SA3',
    layer: '1',
    fields: ['objectid', 'shape', 'sa3_code_2021', 'sa3_name_2021'],
    field: 'SA3_CODE_2021',
    zoom: [10, 8],
  },
  {
    name: 'sa2',
    path: 'ASGS2021/SA2',
    layer: '1',
    fields: ['objectid', 'shape', 'sa2_code_2021', 'sa2_name_2021'],
    field: 'SA2_CODE_2021',
    zoom: [12, 10],
  },
  {
    name: 'mb',
    path: 'ASGS2021/MB',
    layer: '1',
    fields: ['objectid', 'shape', 'mb_code_2021'],
    field: 'MB_CODE_2021',
    zoom: [22, 12], // 22 is max zoom on mapox map
  },
]
