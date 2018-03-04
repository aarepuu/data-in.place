'use strict';

/* Controllers */
//TODO - separate GIS (leaflet) controller

angular.module('raw.controllers', [])

    .controller('RawCtrl', ['$scope', 'dataService', 'leafletData', '$http', '$timeout', '$sce', function ($scope, dataService, leafletData, $http, $timeout, $sce) {


        /*$scope.samples = [
         {title: 'Community Conversational', type: 'Community', url: '/api/data/cc', ctype: 'Audio'},
         {title: 'Travel to Work', type: 'Census 2011', url: '/api/data/travel', ctype: 'Pie chart'},
         {title: 'General Health', type: 'Census 2011', url: '/api/data/health', ctype: 'Pie chart'},
         {title: 'Population', type: 'Census 2011', url: '/api/data/pop', ctype: 'Pie chart'},
         {title: 'Crime', type: 'data.police.uk', url: '/api/data/crime', ctype: 'Pie chart'},
         {title: 'Index of Multiple Deprivation', type: 'Mid 2015', url: '/api/data/imd', ctype: 'Pie chart'},
         {title: 'Police Streets', type: 'January 2017', url: $scope.coords, ctype: 'Pie chart', api: true},
         //{title: 'Energy Performance', type: 'DCLG', url: '/api/data/crime', ctype: 'Pie chart'},
         //{title: 'Air Quality', type: 'UK-AIR', url: '/api/data/crime', ctype: 'Pie chart'},
         //{title: 'Access to Car/Van', type: 'Census 2011', url: '/api/geo/crime', ctype: 'Pie chart'},
         //{title: 'Greenspaces', type: 'OS', url: '/api/data/crime', ctype: 'Pie chart'}

         ]*/


        //get the datasets
        $http.get("/api/data/sources").then(function (response) {
            $scope.datasets = response.data;
        });


        $scope.geoTypes = ['Postal Codes', 'Longitude and Latitude'];


        var points = [];

        $scope.removedAreaLayers = {};


        var gradient = {
            1: "#0000cc",
            0.33: "#00ffff",
            0.66: "#3399cc"
        };


        $scope.dataView = 'table';
        $scope.previousZoom = 14;


        //Leaflet controller


        var dataMarker = L.ExtraMarkers.icon({
            icon: 'fa-database',
            markerColor: 'green',
            shape: 'star',
            prefix: 'fa'
        });


        var issueMarker = L.ExtraMarkers.icon({
            icon: 'fa-exclamation',
            markerColor: 'red',
            shape: 'circle',
            prefix: 'fa'
        });


        var sensorMarker = L.ExtraMarkers.icon({
            icon: 'fa-thermometer-full',
            markerColor: 'blue',
            shape: 'square',
            prefix: 'fa'
        });

        L.DrawToolbar.include({
            getModeHandlers: function (map) {
                return [
                    {
                        enabled: true,
                        handler: new L.Draw.Polygon(map, {
                            allowIntersection: false, // Restricts shapes to simple polygons
                            drawError: {
                                color: '#e1e100', // Color the shape will turn when intersects
                                message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                            },
                            shapeOptions: {
                                color: 'rgb(86, 184, 129)'
                            }
                        }),
                        title: 'Draw a boundary'
                    },
                    {
                        enabled: false,
                        handler: new L.Draw.Marker(map, {icon: issueMarker}),
                        title: 'Place an Issue Marker',
                    },
                    {
                        enabled: false,
                        handler: new L.Draw.Marker(map, {icon: dataMarker}),
                        title: 'Place a Data Marker'
                    },
                    {
                        enabled: false,
                        handler: new L.Draw.Marker(map, {icon: sensorMarker}),
                        title: 'Place a Sensor Marker'
                    }
                ];
            }
        });

        $scope.maploading = false;
        angular.extend($scope, {
            center: {
                //lat: 55.0156,
                //lng: -1.67643,
                lat: 54.97328,
                lng: -1.61396,
                zoom: 14
            },
            controls: {
                fullscreen: {},
                scale: true,
                draw: {
                    /*draw: {
                     polyline: false/*{
                     shapeOptions: {
                     color: '#f357a1',
                     weight: 3

                     },

                     },
                     polygon: {
                     allowIntersection: false, // Restricts shapes to simple polygons
                     drawError: {
                     color: '#e1e100', // Color the shape will turn when intersects
                     message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                     },
                     shapeOptions: {
                     color: 'rgb(86, 184, 129)'
                     }
                     },
                     circle: false, // Turns off this drawing tool
                     marker: true,
                     rectangle: false

                     }*/
                },
                //custom: [new L.Control.Info({content: '<h4> Quick Stats </h4> Hover over area'})]

            },
            /*defaults: {
             tileLayer: 'https://api.mapbox.com/styles/v1/aarepuu/cizldto5h001y2rpdzhfsurfa/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFyZXB1dSIsImEiOiJwRDc4UmE0In0.nZEyHmTgCobiCqZ42mqMSg',
             tileLayerOptions: {
             opacity: 0.9,
             detectRetina: true,
             reuseTiles: true,
             },
             scrollWheelZoom: true
             },*/
            layers: {
                baselayers: {
                    mapbox_light: {
                        name: 'Mapbox Light',
                        url: 'https://api.mapbox.com/styles/v1/aarepuu/{mapid}/tiles/256/{z}/{x}/{y}?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1IjoiYWFyZXB1dSIsImEiOiJwRDc4UmE0In0.nZEyHmTgCobiCqZ42mqMSg',
                            mapid: 'cizldto5h001y2rpdzhfsurfa',
                            attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">MapBox </a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                            detectRetina: true,
                            reuseTiles: true,
                        },
                        layerParams: {
                            showOnSelector: true
                        }
                    },
                    edina: {
                        name: 'Ordnance Survey',
                        url: 'https://openstream.edina.ac.uk/openstream/wms',
                        type: 'wms',
                        layerOptions: {
                            token: '64aa1799ff5ee4d99c488ad58c1adcefc5fe59da0ecf3d29aab65bd4d359938f',
                            format: "image/png",
                            layers: "osopendata",
                            //cache: false,
                            attribution: "Contains Ordnance Survey data. &copy;  Crown copyright and database right 2017. Data provided by Digimap OpenStream, an EDINA, University of Edinburgh Service.",
                            detectRetina: true,
                            reuseTiles: true,
                        },
                        layerParams: {
                            minZoom: 6
                        }
                    },
                    //https://api.mapbox.com/styles/v1/aarepuu/cj7or2fkzb8ay2rqfarpanw10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFyZXB1dSIsImEiOiJwRDc4UmE0In0.nZEyHmTgCobiCqZ42mqMSg
                    /* mapbox_notext: {
                     name: 'Mapbox Notext',
                     url: 'https://api.mapbox.com/styles/v1/aarepuu/{mapid}/tiles/256/{z}/{x}/{y}?access_token={apikey}',
                     type: 'xyz',
                     layerOptions: {
                     apikey: 'pk.eyJ1IjoiYWFyZXB1dSIsImEiOiJwRDc4UmE0In0.nZEyHmTgCobiCqZ42mqMSg',
                     mapid: 'cj7or2fkzb8ay2rqfarpanw10',
                     attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">MapBox </a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                     detectRetina: true,
                     reuseTiles: false,
                     },
                     layerParams: {
                     showOnSelector: true
                     }
                     }*/

                },
                overlays: {
                    boundary: {
                        name: 'Boundary',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    },
                    markers: {
                        name: 'Markers',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    },
                    areas: {
                        name: 'Areas',
                        type: 'geoJSONShape',
                        data: [],
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        },
                        layerOptions: {
                            style: {
                                color: 'white',
                                fillColor: '#FD8D3C',
                                weight: 2.0,
                                dashArray: '3',
                                opacity: 0.6,
                                fillOpacity: 0.2
                            },
                            onEachFeature: onEachFeature
                        }
                    },//TODO - markerclustering
                    data: {
                        name: 'Data',
                        type: 'geoJSONShape',
                        data: [],
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        },
                        layerOptions: {
                            pointToLayer: function (feature, latlng) {
                                return L.circleMarker(latlng, {
                                    radius: getPointSize(feature.properties),
                                    fillColor: getPointColour(feature.properties),
                                    color: "#000",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            },
                            onEachFeature: function (feature, layer) {
                                let popup_html = '<ul class="infowindow-list">';
                                for (let key in feature.properties) {
                                    popup_html += '<li class="infowindow-listItem"><h5 class="infowindow-subtitle">'+key+'</h5> <h4 class="infowindow-title">'+feature.properties[key]+'</h4></li>';
                                }
                                popup_html += '</ul>';
                                layer.bindPopup(popup_html);
                            }
                        }

                    },
                    heat: {
                        name: 'Heat Map',
                        type: 'heat',
                        data: points,
                        layerOptions: {
                            radius: 2,
                            blur: 3,
                            minOpacity: 0.95,
                            gradient: gradient
                        },
                        layerParams: {
                            showOnSelector: false
                        },
                        visible: true

                    }


                }
            },
            markers: {},
        });

        function getPointColour(props) {
            return "#ff7800";
        }

        function getPointSize(props) {
            return 8;
        }

        function onEachFeature(feature, layer) {
            layer._leaflet_id = layer.feature.properties.code;
            layer.on({
                click: zoomToFeature,
                mouseover: function () {
                    $scope.highlightFeature(layer._leaflet_id);
                },
                mouseout: function () {
                    $scope.resetHighlight(layer._leaflet_id);
                }
            })

            //layer.bindPopup('<h2>' + feature.properties.name + '</h2><p>name: ' + feature.properties.code + '</p>');
        }

        function zoomToFeature(e) {
            $scope.map.fitBounds(e.target.getBounds());
        }

        $scope.highlightFeature = function (id) {
            if (!id) return;
            var layer = $scope.areaLayer.getLayer(id);
            if (layer == undefined) return;
            layer.setStyle({fillColor: 'blue'});
            //TODO - make it into a funtions or build when data is added
            let info = '<h4>' + layer.feature.properties.name + '</h4>Code: ' + layer.feature.properties.code + '</br>'
            for (let key in layer.feature.properties) {
                if (key !== 'name' && key !== 'code') {
                    info += key + ': ' + layer.feature.properties[key] + '</br>';

                }
            }
            $scope.infoControl.setContent(info)

        };

        $scope.resetHighlight = function (id) {
            if ($scope.infoControl)
                $scope.infoControl.setContent('<h4>Quick Stats</h4> Hover over an area');
            if (!id) return;
            let layer = $scope.areaLayer.getLayer(id);
            if (layer == undefined) return;
            layer.setStyle({fillColor: '#FD8D3C'})

        };


        leafletData.getMap().then(function (map) {
            leafletData.getLayers().then(function (layers) {
                //var drawnItems = layers.overlays.draw;
                //TODO - not a good way
                $scope.map = map;
                $scope.boundaryLayer = layers.overlays.boundary;
                $scope.areaLayer = layers.overlays.areas;
                $scope.dataLayer = layers.overlays.data;
                $scope.heatLayer = layers.overlays.heat;
                $scope.markerLayer = layers.overlays.markers;
                //Clear boundry on each draw
                map.on('draw:drawstart ', function (e) {
                    if (e.layerType === 'polygon')
                        $scope.boundaryLayer.clearLayers();
                });
                map.on('draw:created', function (e) {
                    var type = e.layerType,
                        layer = e.layer;
                    if (type == 'polygon') {
                        $scope.boundary = layer;


                        //Police query format
                        //TODO - use areas for query not the boundary
                        $scope.coords = $scope.boundary.toGeoJSON().geometry.coordinates[0];
                        for (var i = 0, l = $scope.coords.length; i < l; i++) {
                            $scope.coords[i] = [$scope.coords[i][1], $scope.coords[i][0]];
                        }
                        $scope.coords = $scope.coords.join(':');
                        $scope.areaBbox = $scope.boundary.getBounds().toBBoxString();

                        $scope.boundaryLayer.addLayer($scope.boundary);
                        $scope.layers.overlays.boundary.layerParams.showOnSelector = true;
                        getArea($scope.boundary.toGeoJSON());
                    } else {
                        $scope.markerLayer.addLayer(layer);
                        let id = layer._leaflet_id
                        layer.bindPopup('<input id="' + id + '"type="text" placeholder="Insert Comment">').openPopup();
                        layer.dragging.enable();
                        layer.on('popupclose', function () {
                            //layer._popup.setContent(layer._popup.getContent())
                            if ($('#' + id).val())
                                layer._popup.setContent($('#' + id).val())
                        })

                    }

                });
                /*map.on('zoomend',function (e) {
                 if ($scope.layers.overlays.areas.layerParams.showOnSelector) {
                 getArea($scope.boundary.toGeoJSON());
                 }
                 });*/
                map.on('moveend', function () {
                    $scope.mapBbox = map.getBounds().toBBoxString();
                });


                map.on('overlayadd', function (eventLayer) {
                    // Switch to the Population legend...
                    /*if (eventLayer.name === 'Areas') {
                     this.removeControl($scope.infoControl);
                     populationLegend.addTo(this);
                     } else { // Or switch to the Population Change legend...
                     this.removeControl(populationLegend);
                     populationChangeLegend.addTo(this);
                     }*/
                });


                //TODO - make it separate
                $scope.$watch('center.zoom', function () {
                    setLevel($scope.center.zoom);
                    if ($scope.layers.overlays.areas.layerParams.showOnSelector) {
                        if (Math.abs($scope.previousZoom - $scope.center.zoom) > 1 && !($scope.center.zoom > 16)) {
                            getArea($scope.boundary.toGeoJSON());
                            $scope.previousZoom = $scope.center.zoom;
                        }

                    }

                });
                function getArea(json) {
                    $scope.maploading = false;
                    if (!json) return;
                    $http.post('/api/geo/area', {
                        zoom: $scope.center.zoom,
                        boundary: JSON.stringify(json)
                    }).then(function (response) {
                        //console.log(response.data);
                        //handle your response here
                        $scope.maploading = false;
                        $scope.areas = response.data.areas;
                        $scope.areas.forEach(function (obj) {
                            obj.isChecked = true;
                        });
                        //TODO - add properties to areas
                        $scope.features = response.data.features;
                        /*response.data.features.features.forEach(function (feature) {
                         console.log(feature.code);
                         });*/
                        $scope.areaLayer.clearLayers();
                        $scope.areaLayer.addData($scope.features);
                        $scope.dataLayer.bringToFront();
                        //TODO - add on event
                        if (!$scope.infoControl) {
                            $scope.infoControl = new L.Control.Info({content: '<h4> Quick Stats </h4> Hover over area'});
                            $scope.infoControl.addTo($scope.map)
                        }
                        if (!$scope.legendControl) {
                            $scope.legendControl = new L.Control.Legend();
                            $scope.legendControl.addTo($scope.map);
                        }
                        //TODO - is this a good way?
                        $scope.layers.overlays.areas.layerParams.showOnSelector = true;
                    });
                }

            });
        });

        //search postcode function
        $scope.searchPostcode = function (code) {
            $http.get("/api/geo/loc/" + code).then(function (response) {
                $scope.center.lat = response.data.lat;
                $scope.center.lng = response.data.lng;
            });

        };
        //end Leaflet controller


        //Raw code starts
        $scope.loading = false;

        // Clipboard
        $scope.$watch('clipboardText', function (text) {
            if (!text) return;

            $scope.loading = true;

            if (is.url(text)) {
                $scope.importMode = 'url';
                $timeout(function () {
                    $scope.url = text;
                });
                return;
            }

            try {
                var json = JSON.parse(text);
                selectArray(json);
                $scope.loading = false;
            }
            catch (error) {
                parseText(text);
            }

        });

        $scope.antani = function (d) {
            $scope.loading = true;
            var json = dataService.flatJSON(d);
            parseText(d3.tsv.format(json))
        }

        // select Array in JSON
        function selectArray(json) {
            $scope.json = json;
            $scope.structure = [];
            expand(json);
        }

        // parse Text
        function parseText(text) {
            //  $scope.loading = false;
            $scope.json = null;
            $scope.text = text;
            $scope.parse(text);
        }

        // load File
        $scope.uploadFile = function (file) {

            if (file.size) {

                $scope.loading = true;

                // excel
                if (file.name.search(/\.xls|\.xlsx/) != -1 || file.type.search('sheet') != -1) {
                    dataService.loadExcel(file)
                        .then(function (worksheets) {
                            $scope.fileName = file.name;
                            $scope.loading = false;
                            // multiple sheets
                            if (worksheets.length > 1) {
                                $scope.worksheets = worksheets;
                                // single > parse
                            } else {
                                $scope.parse(worksheets[0].text);
                            }
                        })
                }

                // json
                if (file.type.search('json') != -1) {
                    dataService.loadJson(file)
                        .then(function (json) {
                            $scope.fileName = file.name;
                            selectArray(json);
                        })
                }

                // txt
                if (file.type.search('text') != -1) {
                    dataService.loadText(file)
                        .then(function (text) {
                            $scope.fileName = file.name;
                            parseText(text);
                        })
                }
            }
        };


        function parseData(json) {

            $scope.loading = false;
            //  $scope.parsed = true;

            if (!json) return;
            try {
                selectArray(json);
            }
            catch (error) {
                console.log(error)
                parseText(json);
            }

        }

        function uniq(a) {
            var prims = {"boolean": {}, "number": {}, "string": {}}, objs = [];

            return a.filter(function (item) {
                var type = typeof item;
                if (type in prims)
                    return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
                else
                    return objs.indexOf(item) >= 0 ? false : objs.push(item);
            });
        }

        // load URL
        $scope.$watch('url', function (url) {
            console.log(url);

            if (!url || !url.length) {
                return;
            }

            if (is.not.url(url)) {
                $scope.error = "Please insert a valid URL";
                return;
            }

            $scope.loading = true;
            var error = null;
            //TODO - look into using dataservice for this
            // first trying jsonp
            $http.jsonp($sce.trustAsResourceUrl(url), {jsonpCallbackParam: 'callback'})
                .then(function (response) {
                    if (!$scope.currentDataset)
                        $scope.fileName = url;
                    parseData(response.data);
                }, function (response) {
                    $http.get($sce.trustAsResourceUrl(url), {responseType: 'arraybuffer'})
                        .then(function (response) {
                                var data = new Uint8Array(response.data);
                                var arr = new Array();
                                for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                                var bstr = arr.join("");

                                try {
                                    var workbook = XLS.read(bstr, {type: "binary"});
                                    var worksheets = [];
                                    var sheet_name_list = workbook.SheetNames;

                                    sheet_name_list.forEach(function (y) {
                                        var worksheet = workbook.Sheets[y];
                                        worksheets.push({
                                            name: y,
                                            text: XLSX.utils.sheet_to_csv(worksheet),
                                            rows: worksheet['!range'].e.r
                                        })
                                    });
                                    if (!$scope.currentDataset)
                                        $scope.fileName = url;
                                    $scope.loading = false;

                                    // multiple sheets
                                    if (worksheets.length > 1) {
                                        $scope.worksheets = worksheets;
                                        // single > parse
                                    } else {
                                        parseText(worksheets[0].text);
                                    }
                                }
                                catch (error) {
                                    if (!$scope.currentDataset)
                                        $scope.fileName = url;
                                    try {
                                        var json = JSON.parse(bstr);
                                        selectArray(json);
                                    }
                                    catch (error) {
                                        parseText(bstr);
                                    }
                                }

                            },
                            function (response) {
                                $scope.loading = false;
                                $scope.error = "Something wrong with the URL you provided. Please be sure it is the correct address.";
                            }
                        );

                });

        },true);


        $scope.aggregate = function () {
            if (!$scope.aggregator) return;
            var data = $scope.data;
            var aggregatedData = d3.nest()
                .key(function (d) {
                    return d[$scope.aggregator.key];
                })
                .rollup(function (v) {
                    return v.length;
                })
                .entries(data)
                .map(function (group) {
                    return {
                        aggregator: group.key,
                        count: group.values
                    }
                });
            $scope.oldData = data;
            parseText(d3.tsv.format(aggregatedData));


        }
        $scope.selectDataset = function (dataset) {
            if (!dataset) return;

            reset();
            $scope.text = "";
            //set current selected dataset
            $scope.currentDataset = dataset;
            $scope.ctype = dataset.ctype;

            var requestURL = dataset.api_link;
            //TODO - rework this
            if (dataset.ext) {
                console.log(dataset.geom);
                switch (dataset.geom) {
                    case "ons":
                        //All areas in a comma separated string
                        let areastring = [];
                        $scope.areas.forEach(function (area) {
                            if (area.isChecked)
                                areastring.push(area.code);
                        });
                        if (!areastring.length) {
                            //TODO - show message of nothing selected
                            $scope.loading = false;
                            return;
                        }
                        requestURL = requestURL + areastring.toString();
                        break;
                    case "poly":
                        requestURL = requestURL + $scope.coords;
                        break;
                    case "bbox":
                        requestURL = requestURL + $scope.areaBbox;
                        break;
                    default:
                    //latlon?local
                }
                $scope.url = requestURL;
                return;
            }


            var codes = $scope.areas.map(function (area) {
                return area.code;
            });
            $scope.loading = true;
            dataService.loadDataset(dataset, {"codes": codes, "zoom": $scope.center.zoom}).then(
                function (data) {
                    if (Array.isArray(data)) {
                        try {
                            //var json = JSON.parse(data);
                            selectArray(data);
                        }
                        catch (error) {
                            $scope.text = data.replace(/\r/g, '');
                            //parseText(data);
                        }
                    } else {
                        $scope.text = data.replace(/\r/g, '');
                    }


                    //TODO - add stats to features
                    //console.log($scope.text);
                    /*$scope.features.features.forEach(function (feature) {
                     console.log(feature);
                     });*/
                    $scope.loading = false;
                },
                function (error) {
                    $scope.error = error;
                    $scope.loading = false;
                }
            );
        }//);

        $(document.getElementById("load-data")).on('dragenter', function (e) {
            $scope.importMode = 'file';
            $scope.parsed = false;
            $scope.$digest();
        });

        $scope.$watch('areas', function (n, o) {
            //workaround with url datasets
            if ($scope.importMode == 'dataset' && $scope.currentDataset) {
                let larray = $scope.currentDataset.levels.split(',');
                if (!larray.includes('latlon') && !larray.includes('bbox')) {
                    console.log("update");
                    $scope.selectDataset($scope.currentDataset);
                }
            }
        },true);

        $scope.$watch('dataView', function (n, o) {
            //console.log($scope.dataView);
            if (!$('.parsed .CodeMirror')[0]) return;
            var cm = $('.parsed .CodeMirror')[0].CodeMirror;
            $timeout(function () {
                cm.refresh()
            });
        });


        // init
        $scope.raw = raw;
        $scope.data = [];
        $scope.metadata = [];
        $scope.error = false;
        //$scope.loading = true;

        $scope.importMode = 'dataset';

        $scope.categories = ['Hierarchies', 'Time Series', 'Distributions', 'Correlations', 'Others'];

        $scope.bgColors = {
            'Hierarchies': '#0f0',
            'Time Series': 'rgb(255, 185, 5)',
            'Distributions': 'rgb(5, 205, 255)',
            'Correlations': '#df0',
            'Others': '#0f0'
        }


        $scope.$watch('files', function () {
            $scope.uploadFile($scope.files);
        });

        $scope.log = '';

        $scope.files = [];


        $scope.$watch('importMode', function () {
            // reset
            reset();
        })


        var arrays = [];


        //data will be stacked with this function
        $scope.unstack = function () {
            console.log($scope.unstacked);
            console.log("unstack");
            if (!$scope.stackDimension) return;
            var data = $scope.data;
            var base = $scope.stackDimension.key;

            var unstacked = [];
            //var unstacked = pivot(data,0,1,2,base);

            //TODO - look into this unstacking
            data.forEach(function (row) {
                for (var column in row) {
                    if (column == base) continue;
                    var obj = {};
                    obj[base] = row[base];
                    obj.column = column;
                    obj.value = row[column];
                    unstacked.push(obj);
                }
            })


            $scope.oldData = data;
            parseText(d3.tsv.format(unstacked));

            $scope.unstacked = true;

        }

        //Data will be unstacked with this function
        $scope.restack = function () {
            if (!$scope.stackDimension) return;
            var data = $scope.data;
            var base = $scope.stackDimension.key;
            //TODO - hard coded values
            //stack value
            var rowIndex = 0;
            //column
            var colIndex = 1;
            //data
            var dataIndex = 2;

            //TODO - test performance
            //inspired by code from http://techbrij.com
            var result = {}, stacked = [];
            var newCols = [];
            var keys = Object.keys($scope.data[0])
            for (var i = 0; i < $scope.data.length; i++) {
                if (!result[$scope.data[i][keys[rowIndex]]]) {
                    result[$scope.data[i][keys[rowIndex]]] = {};
                }
                result[$scope.data[i][keys[rowIndex]]][$scope.data[i][keys[colIndex]]] = $scope.data[i][keys[dataIndex]];

                //To get column names
                if (newCols.indexOf($scope.data[i][keys[colIndex]]) == -1) {
                    newCols.push($scope.data[i][keys[colIndex]]);
                }
            }


            //Add content
            for (var key in result) {
                var item = {};
                item[base] = key;
                for (var i = 0; i < newCols.length; i++) {
                    item[newCols[i]] = result[key][newCols[i]] || "";
                }
                stacked.push(item);
            }

            $scope.oldData = data;
            parseText(d3.tsv.format(stacked));

            $scope.restacked = true;

        }

        $scope.geoReference = function () {
            if (!$scope.pcodeColumn && (!$scope.latColumn || !$scope.lngColumn)) return;
            $scope.loading = true;
            var data = $scope.data;
            if ($scope.geoType == 'Longitude and Latitude') {
                //lng and lat
                $http.post('/api/geo/parse', {
                    //TODO - Just send lon/lat?
                    rawdata: data,
                    lng: $scope.lngColumn.key,
                    lat: $scope.latColumn.key
                }).then(function (response) {
                    $scope.loading = false;
                    $scope.maploading = true;
                    //TODO - what happens with big data?
                    $scope.dataLayer.clearLayers();
                    $scope.dataLayer.addData(response.data);
                    $scope.dataLayer.setZIndex(9999);
                    $scope.map.fitBounds($scope.dataLayer.getBounds());
                    $scope.layers.overlays.data.layerParams.showOnSelector = true;
                    $scope.maploading = false;
                    //TODO - reset fields properly
                    $scope.georeferencing = false;
                    $scope.georeference = true;
                });
            } else {
                //postcode
                //var postcodes = data.map(function(d) { return d[$scope.pcodeColumn.key].replace(' ', '').toUpperCase(); });
                //remove empty ones
                data = data.filter(function (d) {
                    if (!(!d[$scope.pcodeColumn.key] || /^\s*$/.test(d[$scope.pcodeColumn.key]))) return d[$scope.pcodeColumn.key];
                });
                var nested_data = d3.nest()
                    .key(function (d) {
                        return d[$scope.pcodeColumn.key].replace(/\s+/g, '').toUpperCase()
                    })
                    .rollup(function (leaves) {
                        return leaves.length;
                    })
                    .entries(data);
                var max = d3.max(nested_data.map(function (d) {
                    return d.values;
                }));
                var postcodes = nested_data.map(function (d) {
                    return d.key;
                });
                $http.post('/api/geo/code', postcodes).then(function (response) {
                    var result = join(nested_data, response.data, "key", "pcd", function (geom, places) {
                        /*return {
                         postcode: geom.pcd,
                         latitude: geom.latitude,
                         longitude: geom.longitude,
                         value: (places !== undefined) ? places.values/max : null,
                         };*/
                        return [
                            geom.latitude,
                            geom.longitude,
                            (places !== undefined) ? places.values / max : null
                        ];
                    });
                    $scope.loading = false;
                    $scope.maploading = true;

                    $scope.heatLayer.setLatLngs(result);
                    $scope.layers.overlays.heat.layerParams.showOnSelector = true;

                    $scope.maploading = false;
                    //TODO - reset fields properly
                    $scope.georeferencing = false;
                    $scope.georeference = true;
                });

            }

        }

        //data will be (unstacked) turn to original
        $scope.stack = function () {
            parseText(d3.tsv.format($scope.oldData));
            $scope.unstacked = ($scope.unstacked) ? false : true;
            $scope.restacked = ($scope.restacked) ? false : true;
        }


        function reset() {
            $scope.parsed = false;
            $scope.loading = false;
            $scope.clipboardText = "";
            $scope.unstacked = false;
            $scope.restacked = false;
            $scope.text = "";
            $scope.data = [];
            $scope.json = null;
            $scope.worksheets = [];
            $scope.fileName = null;
            $scope.url = "";
            $scope.georeference = false;
            $scope.georeferencing = false;
            $scope.geotype = false;
            $scope.geoType = false;
            $scope.lngColumn = false;
            $scope.latColumn = false;
            $scope.pcodeColumn = false;
            $scope.stackDimension = false;
            //$scope.$apply();
        }

        function jsonTree(json) {
            // mettere try
            var tree = JSON.parse(json);
            $scope.json = tree;
            $scope.structure = [];
            //console.log(JSON.parse(json));
            expand(tree);
        }

        function join(lookupTable, mainTable, lookupKey, mainKey, select) {
            var l = lookupTable.length,
                m = mainTable.length,
                lookupIndex = [],
                output = [];
            for (var i = 0; i < l; i++) { // loop through l items
                var row = lookupTable[i];
                lookupIndex[row[lookupKey]] = row; // create an index for lookup table
            }
            for (var j = 0; j < m; j++) { // loop through m items
                var y = mainTable[j];
                var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
                output.push(select(y, x)); // select only the columns you need
            }
            return output;
        }


        function expand(parent) {
            for (var child in parent) {
                if (is.object(parent[child]) || is.array(parent[child])) {
                    expand(parent[child]);
                    if (is.array(parent[child])) arrays.push(child);
                }
            }
            //console.log(child,parent[child])
        }


        // very improbable function to determine if pivot table or not.
        // pivotable index
        // calculate if values repeat themselves
        // calculate if values usually appear in more columns

        function pivotable(array) {
            var n = array.length;
            var rows = {};

            array.forEach(function (o) {
                for (var p in o) {
                    if (!rows.hasOwnProperty(p)) rows[p] = {};
                    if (!rows[p].hasOwnProperty(o[p])) rows[p][o[p]] = -1;
                    rows[p][o[p]] += 1;
                }
            })

            for (var r in rows) {
                for (var p in rows[r]) {
                    for (var ra in rows) {
                        if (r == ra) break;
                        //    if (p == "") break;
                        if (rows[ra].hasOwnProperty(p)) rows[r][p] -= 2.5;

                    }
                }
            }

            var m = d3.values(rows).map(d3.values).map(function (d) {
                return d3.sum(d) / n;
            });
            $scope.pivot = d3.mean(m);

        }

        //auto georeference function
        function geomFields() {
            let obj = $scope.metadata.find(o => o.type === 'Latitude');
            if (obj !== undefined) {
                $scope.geoType = 'Longitude and Latitude';
                $scope.latColumn = obj;
                $scope.lngColumn = $scope.metadata.find(o => o.type === 'Longitude');
                $scope.geotype = true;
                $scope.geoReference();
                return;
            }
            obj = $scope.metadata.find(o => o.type === 'Postcode');
            if (obj !== undefined) {
                $scope.geoType = 'Postal Codes';
                $scope.pcodeColumn = obj;
                $scope.geotype = true;
                $scope.geoReference();
                return;
            }
            obj = $scope.metadata.find(o => o.type === 'ONSCode');
            if (obj !== undefined) {
                $scope.geotype = true;
                $scope.georeference = true;
                return;
            }
            //console.log(obj.key)
        }

        //function for adding data to geometry
        //TODO - test with unstacking!!
        function datatoGeom() {
            //TODO - Nomisweb specific??
            if ($scope.currentDataset.geom == "ons") {
                if ($scope.currentDataset.ext) {
                    $scope.data.forEach(function (row) {
                        //TODO - find index of geotype!!
                        let layer = $scope.areaLayer.getLayer(row[Object.keys(row)[0]])
                        let propkey = Object.keys(row)[1];
                        let propval = Object.keys(row)[2];
                        layer.feature.properties[row[propkey]] = row[propval];
                    });
                } else {
                    $scope.data.forEach(function (row) {
                        let layer = $scope.areaLayer.getLayer(row[Object.keys(row)[0]])
                        let rowCopy = Object.assign({}, row);
                        //TODO - hardcoded position, expect the area to be first?
                        delete rowCopy[Object.keys(row)[0]]
                        $.extend(layer.feature.properties, rowCopy)
                    });
                }

            }
        }

        //TODO - quick and hacky solution should have geo type variable for levels
        $scope.dataAvailable = function (levels) {
            let larray = levels.split(',');
            if (!larray.includes($scope.level) && !larray.includes('latlon') && !larray.includes('bbox'))
                return 'disabled'
        }


        function setLevel(zoom) {
            let level = '';
            switch (true) {
                case zoom >= 16:
                    level = 'oa';
                    break;
                case (zoom <= 16 && zoom >= 14):
                    level = 'lsoa';
                    break;
                case (zoom <= 14 && zoom >= 12):
                    level = 'wd';
                    break;
                case (zoom <= 12 && zoom >= 10):
                    level = 'lad';
                    break;
                default:
                    level = 'lsoa';
            }
            $scope.level = level;
        }

        $scope.addremoveArea = function (e) {
            if (e.isChecked) {
                $scope.areaLayer.addLayer($scope.removedAreaLayers[e.code]);
                delete $scope.removedAreaLayers[e.code];
                if (!$scope.infoControl) {
                    $scope.infoControl = new L.Control.Info({content: '<h4> Quick Stats </h4> Hover over area'});
                    $scope.infoControl.addTo($scope.map)
                }

            } else {
                $scope.removedAreaLayers[e.code] = $scope.areaLayer.getLayer(e.code);
                $scope.areaLayer.removeLayer(e.code);
                if (!Object.keys($scope.areaLayer.getLayers()).length) {
                    $scope.map.removeControl($scope.infoControl);
                    $scope.infoControl = null;
                }
            }
            /*if ($scope.importMode == 'dataset' && $scope.currentDataset) {
                console.log("update");
                $scope.selectDataset($scope.currentDataset);
            }*/
        }
        $scope.parse = function (text) {

            if ($scope.model) $scope.model.clear();

            $scope.text = text;
            $scope.data = [];
            $scope.metadata = [];
            $scope.error = false;
            //$scope.importMode = null;
            //$scope.$apply();

            if (!text) return;

            try {
                var parser = raw.parser();

                //$scope.data = getPivotArray(parser(text),0,1,2);
                //$scope.metadata = parser.metadata(d3.tsv.format($scope.data));
                //TODO - already iterates data
                $scope.data = parser(text);

                $scope.metadata = parser.metadata(text);
                //TODO - parse for geodata
                $scope.error = false;
                pivotable($scope.data);
                geomFields();
                $scope.parsed = true;
                datatoGeom();

                $timeout(function () {
                    $scope.charts = raw.charts.values().sort(function (a, b) {
                        return d3.ascending(a.category(), b.category()) || d3.ascending(a.title(), b.title())
                    })
                    $scope.chart = $scope.charts.filter(function (d) {
                        return d.title() == ($scope.ctype ? $scope.ctype : 'Scatter Plot');
                    })[0];
                    $scope.model = $scope.chart ? $scope.chart.model() : null;
                });
            } catch (e) {
                $scope.data = [];
                $scope.metadata = [];
                $scope.error = e.name == "ParseError" ? +e.message : false;
            }
            if (!$scope.data.length && $scope.model) $scope.model.clear();
            $scope.loading = false;
            var cm = $('.parsed .CodeMirror')[0].CodeMirror;
            $timeout(function () {
                cm.refresh();
                cm.refresh();
            });
        }

        $scope.delayParse = dataService.debounce($scope.parse, 500, false);

        $scope.$watch("text", function (text) {
            if (!text) return;
            $scope.loading = true;
            $scope.delayParse(text);
        });

        $scope.$watch('error', function (error) {
            if (!$('.parsed .CodeMirror')[0]) return;
            var cm = $('.parsed .CodeMirror')[0].CodeMirror;
            if (!error) {
                cm.removeLineClass($scope.lastError, 'wrap', 'line-error');
                return;
            }
            cm.addLineClass(error, 'wrap', 'line-error');
            cm.scrollIntoView(error);
            $scope.lastError = error;
        })

        $('body').mousedown(function (e, ui) {
            if ($(e.target).hasClass("dimension-info-toggle")) return;
            $('.dimensions-wrapper').each(function (e) {
                angular.element(this).scope().open = false;
                angular.element(this).scope().$apply();
            })
        })

        $scope.codeMirrorOptions = {
            dragDrop: false,
            lineNumbers: true,
            lineWrapping: true
        }

        $scope.selectChart = function (chart) {
            if (chart == $scope.chart) return;
            $scope.model.clear();
            $scope.chart = chart;
            $scope.model = $scope.chart.model();
        }

        function refreshScroll() {
            $('[data-spy="scroll"]').each(function () {
                $(this).scrollspy('refresh');
            });
        }

        $(window).scroll(function () {

            // check for mobile
            if ($(window).width() < 760 || $('#mapping').height() < 300) return;

            var scrollTop = $(window).scrollTop() + 0,
                mappingTop = $('#mapping').offset().top + 10,
                mappingHeight = $('#mapping').height(),
                isBetween = scrollTop > mappingTop + 50 && scrollTop <= mappingTop + mappingHeight - $(".sticky").height() - 20,
                isOver = scrollTop > mappingTop + mappingHeight - $(".sticky").height() - 20,
                mappingWidth = mappingWidth ? mappingWidth : $('.mapping').width();

            if (mappingHeight - $('.dimensions-list').height() > 90) return;
            //console.log(mappingHeight-$('.dimensions-list').height())
            if (isBetween) {
                $(".sticky")
                    .css("position", "fixed")
                    .css("width", mappingWidth + "px")
                    .css("top", "20px")
            }

            if (isOver) {
                $(".sticky")
                    .css("position", "fixed")
                    .css("width", mappingWidth + "px")
                    .css("top", (mappingHeight - $(".sticky").height() + 0 - scrollTop + mappingTop) + "px");
                return;
            }

            if (isBetween) return;

            $(".sticky")
                .css("position", "relative")
                .css("top", "")
                .css("width", "");

        })

        $scope.sortCategory = function (chart) {
            // sort first by category, then by title
            return [chart.category(), chart.title()];
        };

        $(document).ready(refreshScroll);


    }]);
