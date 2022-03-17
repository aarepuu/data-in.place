// start zoom and centre point of the map
export const MAP_DEFAULTS = {
  ZOOM: 12,
  CENTER: [-1.6125, 54.982],
}
// restrict map panning
export const MAP_RESTRICTIONS = {
  // see https://gist.github.com/graydon/11198540
  BOUNDS: [
    [-7.57216793459, 49.959999905], // Southwest coordinates
    [1.68153079591, 58.6350001085], // Northeast coordinates
  ],
  MAX_ZOOM_LEVEL: 17,
  MIN_ZOOM_LEVEL: 6,
}
//  ArcGIS MapServer query parameters
export const ZOOM_LEVELS = [
  {
    name: 'country',
    path:
      'Administrative_Boundaries/Countries_December_2017_Boundaries_UK_WGS84', // mapserver subpath
    layer: '4', // layer number
    fields: ['objectid', 'shape', 'ctry17cd', 'ctry17nm'], // return fields
    field: 'ctry17cd', // id field for data queries
    zoom: [6, -1], // [ max, min ]
  },
  {
    name: 'region',
    path: 'Administrative_Boundaries/Regions_December_2017_Boundaries',
    layer: '4',
    fields: ['objectid', 'shape', 'rgn17cd', 'rgn17nm'],
    field: 'rgn17cd',
    zoom: [11, 6],
  },
  {
    name: 'county',
    path:
      'Administrative_Boundaries/WGS84_UK_Counties_and_Unitary_Authorities_December_2017_Boundaries',
    layer: '4',
    fields: ['objectid', 'shape', 'ctyua17cd', 'ctyua17nm'],
    field: 'ctyua17cd',
    zoom: [12, 11],
  },
  {
    name: 'lad',
    path:
      'Administrative_Boundaries/Local_Authority_Districts_May_2018_Boundaries',
    layer: '4',
    fields: ['objectid', 'shape', 'lad18cd', 'lad18nm'],
    field: 'lad18cd',
    zoom: [13, 12],
  },
  // {
  //   name: 'ward',
  //   path: 'Administrative_Boundaries/Wards_December_2015_Boundaries',
  //   layer: '2',
  //   fields: ['objectid', 'shape', 'wd15cd', 'wd15nm'],
  //   field: 'wd15',
  //   zoom: [13,11],
  // },
  {
    name: 'msoa',
    path:
      'Census_Boundaries/Middle_Super_Output_Areas_December_2011_Boundaries',
    layer: '3',
    fields: ['objectid', 'shape', 'msoa11cd', 'msoa11nm'],
    field: 'msoa11cd',
    zoom: [15, 13],
  },
  {
    name: 'lsoa',
    path: 'Census_Boundaries/Lower_Super_Output_Areas_December_2011_Boundaries',
    layer: '2',
    fields: ['objectid', 'shape', 'lsoa11cd', 'lsoa11nm'],
    field: 'lsoa11cd',
    zoom: [17, 15],
  },
  {
    name: 'oa',
    path: 'Census_Boundaries/Output_Area_December_2011_Boundaries',
    layer: '1',
    fields: ['objectid', 'shape', 'oa11cd', 'lad11cd'],
    field: 'oa11cd',
    zoom: [22, 17], // 22 is max zoom on mapox map
  },
]
export const ESRI_QUERY_DEFAULTS = {
  where: '1=1',
  geometryType: 'esriGeometryEnvelope',
  inSR: '4326',
  /* outFields: 'objectid,ctry17cd,ctry17nm,ctry17nmw,shape', */
  spatialRel: 'esriSpatialRelIntersects',
  outSR: '4326',
  f: 'geojson',
}
