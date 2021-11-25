'use strict';

/* Controllers */
//TODO - separate GIS (leaflet) controller

angular.module('raw.controllers', [])

    .controller('RawCtrl', ['$scope', 'dataService', 'leafletData', '$http', '$timeout', '$sce', '$location', '$cookies', function ($scope, dataService, leafletData, $http, $timeout, $sce, $location, $cookies) {


        $scope.boundaryTemplate = {
            //"id":
            "type": "Feature",
            "geometry": {"type": "Polygon"}
        }

        $scope.urlparams = $location.search();
        $scope.previousZoom = 14;
        processUrl($scope.urlparams);

        function processUrl(params) {
            if (Object.keys(params).length) {
                // export the coordinates from the layer
                const coordinates = [];
                $scope.datasetId = parseInt(params.data);
                $scope.challengeId = params.cid;
                if ($scope.datasets)
                    $scope.currentDataset = $scope.datasets.find(o => o.id === $scope.datasetId);
                $scope.previousZoom = parseInt(params.zoom);
                if (params.poly == undefined) return;
                params.poly.split(":").forEach(function (latlng) {
                    //Because geoJSON is lng, lat
                    const stringarr = latlng.split(",");
                    coordinates.push([parseFloat(stringarr[1]), parseFloat(stringarr[0])]);
                });
                let boundaryTemplate = angular.copy($scope.boundaryTemplate);
                boundaryTemplate['geometry']['coordinates'] = [coordinates];
                //Creates a FeatureCollection
                $scope.boundary = L.geoJSON(boundaryTemplate);
            }
            else {
                if (navigator.geolocation) {
                    let res = navigator.geolocation.getCurrentPosition(moveToPosition, showError);
                } else {
                    //"Geolocation is not supported by this browser.";
                }
            }
        }

        function moveToPosition(positions) {
            $scope.center.lat = positions.coords.latitude;
            $scope.center.lng = positions.coords.longitude;
            controlLoader.hide();
            $cookies.put("lat", positions.coords.latitude);
            $cookies.put("lng", positions.coords.longitude);
        }

        function showError(error) {
            controlLoader.hide();
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    //console.log("User denied the request for Geolocation.")
                    break;
                case error.POSITION_UNAVAILABLE:
                    //console.log("Location information is unavailable.")
                    break;
                case error.TIMEOUT:
                    //console.log("The request to get user location timed out.")
                    break;
                case error.UNKNOWN_ERROR:
                    //console.log("An unknown error occurred.")
                    break;
            }
        }

        function buildUrl() {
            //http://localhost:3000/?data=1&zoom=15&poly=54.970057640429864,-1.6414019465446472:54.970807995914974,-1.6354675590991976:54.96673042726977,-1.6347990185022354:54.96420634978736,-1.6437119990587237:54.970057640429864,-1.6414019465446472
            return $location.absUrl().split("?")[0] + '?data=' + $scope.datasetId + '&zoom=' + $scope.center.zoom + '&poly=' + $scope.coords


        }

        function getJsonFromUrl(dataurl) {
            var query = dataurl.split("?")[1];
            var result = {};
            query.split("&").forEach(function (part) {
                var item = part.split("=");
                result[item[0]] = decodeURIComponent(item[1]);
            });
            return result;
        }


        //get the datasets
        $http.get("/api/data/sources").then(function (response, req) {
            $scope.datasets = response.data;
            if ($scope.datasetId)
                $scope.currentDataset = $scope.datasets.find(o => o.id === $scope.datasetId);
        });

        //get the challenges
        $http.get("/api/data/challenges").then(function (response) {
            $scope.challenges = response.data;
            if ($scope.challengeId) {
                $scope.currentChallenge = $scope.challenges.find(o => o.cid === $scope.challengeId);
                $scope.$parent.focus = $scope.currentChallenge.line;
            }


        });

        $scope.issueTemplate = {
            //tags: [{text: "data science"}],
            //content: "## **Describe the issue.**\n\n## **What data and other resources (technology, people, skills) are needed?**\n\n## **How do you turn the data into something useful (visualise it)?**\n\n"
        }

        $scope.issue = angular.copy($scope.issueTemplate);

        $scope.challenges = [];

        $scope.geoTypes = ['Postal Codes', 'Longitude and Latitude', /*'ONS Codes', 'Addresses'*/];


        let schoolIcon = L.icon({
            iconUrl: '../imgs/school-blue.png',

            iconSize: [24, 24],
            // size of the icon
            iconAnchor: [12, 23],
            // point of the icon which will correspond to marker's location
            popupAnchor: [1, -21] // point from which the popup should open relative to the iconAnchor
        });

        let noschoolIcon = L.icon({
            iconUrl: '../imgs/school-orange.png',

            iconSize: [24, 24],
            // size of the icon
            iconAnchor: [12, 23],
            // point of the icon which will correspond to marker's location
            popupAnchor: [1, -21] // point from which the popup should open relative to the iconAnchor
        });


        var points = [];

        $scope.removedAreaLayers = {};


        var gradient = {
            1: "#0000cc",
            0.33: "#00ffff",
            0.66: "#3399cc"
        };


        $scope.dataView = 'table';

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
                    }/*,
                     {
                     enabled: true,
                     handler: new L.Draw.Marker(map, {icon: issueMarker}),
                     title: 'Place an Issue Marker',
                     },
                     {
                     enabled: true,
                     handler: new L.Draw.Marker(map, {icon: dataMarker}),
                     title: 'Place a Data Marker'
                     },
                     {
                     enabled: true,
                     handler: new L.Draw.Marker(map, {icon: sensorMarker}),
                     title: 'Place a Sensor Marker'
                     }*/
                ];
            }
        });


        const mybounds = {
            southWest: {lat: 49.79, lng: -8.82},
            northEast: {lat: 60.94, lng: 1.92}
        };

        let drawnItems = new L.FeatureGroup();
        //$scope.maploading = false;
        //controlLoader.hide();
        angular.extend($scope, {
            defaults: {
                minZoom: 5
            },
            maxbounds: mybounds,
            center: {
                lat: 54.97328,
                lng: -1.61396,
                zoom: $scope.previousZoom
            },
            controls: {
                fullscreen: {},
                scale: true,
                draw: {
                    edit: {
                        featureGroup: drawnItems
                    }
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
                    //https://api.mapbox.com/styles/v1/aarepuu/cj7or2fkzb8ay2rqfarpanw10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFyZXB1dSIsImEiOiJwRDc4UmE0In0.nZEyHmTgCobiCqZ42mqMSg
                    /*mapbox_notext: {
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
                     },*/
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
                    }
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

                                if ($scope.currentDataset.id != 15)
                                    return L.circleMarker(latlng, {
                                        radius: getPointSize(feature.properties),
                                        fillColor: getPointColour(feature.properties),
                                        color: "#000",
                                        weight: 1,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    });
                                //console.log(parseInt(feature.properties.Engaged));
                                return L.marker(latlng, {
                                    icon: (parseInt(feature.properties.Engaged) ? schoolIcon : noschoolIcon)
                                });
                            },
                            onEachFeature: function (feature, layer) {
                                let popup_html = '<ul class="infowindow-list">';
                                for (let key in feature.properties) {
                                    popup_html += '<li class="infowindow-listItem"><h5 class="infowindow-subtitle">' + key + '</h5> <h4 class="infowindow-title">'
                                        + (validURL(feature.properties[key]) ? '<a href="' + feature.properties[key] + '" target="_blank">' + feature.properties[key] + '</a>' : feature.properties[key]) + '</h4></li>';
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

        function getColor(d) {
            return d < 2 ? '#800026' :
                d < 3 ? '#BD0026' :
                    d < 4 ? '#E31A1C' :
                        d < 5 ? '#FC4E2A' :
                            d < 6 ? '#FD8D3C' :
                                d < 7 ? '#FEB24C' :
                                    d < 8 ? '#FED976' :
                                        d < 9 ? '#FED976' :
                                            d < 10 ? '#FFEDA0' :
                                                '#EFFFAB';
        }

        function getPointColour(props) {
            if ($scope.currentDataset) {
                return "#ff7800";
            } else {
                return "#00ADEF";
            }

        }

        function getPointSize(props) {
            return 8;
        }

        function onEachFeature(feature, layer) {
            layer._leaflet_id = layer.feature.properties[$scope.fcode];
            //TODO - set fill based on parameter
            //layer.setStyle ({fillColor: getColor(Math.floor(Math.random() * 1000) + 1)});
            layer.on({
                click: zoomToFeature,
                mouseover: function () {
                    $scope.highlightFeature(layer._leaflet_id);
                },
                mouseout: function () {
                    $scope.resetHighlight(layer._leaflet_id);
                }
            });

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
            //TODO - make it into a function or build when data is added
            let info = '<h4>' + layer.feature.properties[$scope.fname] + '</h4>Code: ' + layer.feature.properties[$scope.fcode] + '</br>';
            for (let key in layer.feature.properties) {
                if (key !== $scope.fcode && key !== $scope.fname) {
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
            //if(layer.feature.properties[$scope.geoAggregator]){
            //layer.setStyle ({fillColor: getColor(layer.feature.properties[$scope.geoAggregator])});
            if (layer.feature.properties.Decile) {
                layer.setStyle({fillColor: getColor(layer.feature.properties.Decile)});
            } else {
                layer.setStyle({fillColor: '#FD8D3C'})
            }


        };

        var controlLoader;
        leafletData.getMap().then(function (map) {
            $('#footer').removeClass('navbar-fixed-bottom');
            leafletData.getLayers().then(function (layers) {
                //var drawnItems = layers.overlays.draw;
                //TODO - not a good way
                $scope.map = map;
                //$scope.map.setMaxBounds(mybounds);
                $scope.mapBbox = $scope.map.getBounds().toBBoxString();
                controlLoader = L.control.loader().addTo($scope.map);
                controlLoader.show();
                $scope.boundaryLayer = layers.overlays.boundary;

                $scope.areaLayer = layers.overlays.areas;
                $scope.dataLayer = layers.overlays.data;
                $scope.heatLayer = layers.overlays.heat;
                $scope.markerLayer = layers.overlays.markers;

                //TODO - look at the racing conditions with the datasets
                if ($scope.boundary) {
                    processBoundary(true)
                }
                //Clear boundry on each draw
                map.on('draw:drawstart', function (e) {
                    //if (e.layerType === 'polygon')
                    //  $scope.boundaryLayer.clearLayers();
                });
                map.on('draw:created', function (e) {
                    if (e.layerType === 'polygon')
                        $scope.boundaryLayer.clearLayers();
                    var type = e.layerType,
                        layer = e.layer;
                    drawnItems.addLayer(layer);
                    if (type == 'polygon') {
                        $scope.boundary = layer;
                        processBoundary(false);
                    } else {
                        /*$scope.markerLayer.addLayer(layer);
                         //$('#issueModal').modal('show');
                         let id = layer._leaflet_id;
                         layer.bindPopup('<input id="marker-' + id + '"type="text" placeholder="Insert Comment">').openPopup();
                         //layer.dragging.enable();
                         //Emit to socket
                         socket.emit('send:marker', {
                         id: id,
                         loc: layer.getLatLng()

                         });
                         layer.on('popupclose', function () {
                         //layer._popup.setContent(layer._popup.getContent())
                         if ($('#marker-' + id).val()) {
                         socket.emit('send:issue', {
                         markerId: id,
                         text: $('#marker-' + id).val()
                         });
                         layer._popup.setContent($('#marker-' + id).val())
                         }

                         })*/

                    }

                });
                map.on('draw:edited', function (e) {
                    //Police query format
                    //TODO - use areas for query not the boundary
                    //TODO - use the actual areas
                    $scope.coords = $scope.boundary.toGeoJSON().geometry.coordinates[0];
                    for (var i = 0, l = $scope.coords.length; i < l; i++) {
                        $scope.coords[i] = [$scope.coords[i][1], $scope.coords[i][0]];
                    }
                    $scope.coords = $scope.coords.join(':');
                    if ($scope.areaBbox == undefined) {
                        $scope.oldareaBbox = $scope.boundary.getBounds().toBBoxString();
                    } else {
                        $scope.oldareaBbox = JSON.parse(JSON.stringify($scope.areaBbox));
                    }
                    $scope.areaBbox = $scope.boundary.getBounds().toBBoxString();
                    $scope.boundaryLayer.addLayer($scope.boundary);
                    $scope.layers.overlays.boundary.layerParams.showOnSelector = true;
                    getArea($scope.boundary.toGeoJSON());

                });

                map.on('draw:deleted', function (e) {
                    resetMap();
                    reset();
                });
                map.on('draw:editstart', function () {
                    console.log("editstart");
                });
                /*map.on('zoomend',function (e) {
                 if ($scope.layers.overlays.areas.layerParams.showOnSelector) {
                 getArea($scope.boundary.toGeoJSON());
                 }
                 });*/
                map.on('moveend', function () {

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
                $scope.$watch('center', function (newval, oldval) {
                    $scope.mapBbox = map.getBounds().toBBoxString();
                    if ($scope.layers.overlays.areas.layerParams.showOnSelector) {
                        if (Math.abs($scope.previousZoom - $scope.center.zoom) > 1) {
                            $scope.previousZoom = angular.copy($scope.center.zoom);
                        }
                        if ((!($scope.center.zoom > 16) && !($scope.center.zoom < 7)))
                            getArea($scope.boundary.toGeoJSON());

                    }

                }, true);


            });
        });

        function processBoundary(fitbounds) {
            let boundaryJson = $scope.boundary.toGeoJSON();
            if (boundaryJson.type == "FeatureCollection") {
                $scope.coords = $scope.boundary.toGeoJSON().features[0].geometry.coordinates[0];
            } else {
                $scope.coords = $scope.boundary.toGeoJSON().geometry.coordinates[0];
            }

            //Police query format
            //TODO - use areas for query not the boundary
            //TODO - use the actual areas
            for (var i = 0, l = $scope.coords.length; i < l; i++) {
                $scope.coords[i] = [$scope.coords[i][1], $scope.coords[i][0]];
            }
            $scope.coords = $scope.coords.join(':');

            if ($scope.areaBbox == undefined) {
                $scope.oldareaBbox = $scope.boundary.getBounds().toBBoxString();
            } else {
                $scope.oldareaBbox = JSON.parse(JSON.stringify($scope.areaBbox));
            }

            $scope.areaBbox = $scope.boundary.getBounds().toBBoxString();
            $scope.boundaryLayer.clearLayers();
            $scope.boundaryLayer.addLayer($scope.boundary);
            //$scope.center.zoom = $scope.previousZoom;
            if (fitbounds)
                $scope.map.fitBounds($scope.boundary.getBounds());
            $scope.layers.overlays.boundary.layerParams.showOnSelector = true;
            getArea($scope.boundary.toGeoJSON());
        }

        function getArea(json) {
            //$scope.maploading = true;
            controlLoader.show();
            if (!json) return;
            setLevel($scope.center.zoom);        
            if (json.features)
                json = json.features[0];
            $http.post('/api/geo/area', {
                zoom: $scope.center.zoom,
                boundary: JSON.stringify(json),
                bbox: $scope.areaBbox,
            }).then(function (response) {
                controlLoader.hide();
                $scope.fcode = response.data.data.field +'cd'
                $scope.fname = response.data.data.field +'nm'
                let areas = response.data.data.features.map(function (area) {
                    return {code: area.properties[$scope.fcode], name: area.properties[$scope.fname] }
                });              
                if(is.not.undefined($scope.areas)){
                    if(objectString($scope.areas, 'code') === objectString(areas, 'code'))
                        return;
                }
                $scope.areas = areas
                $scope.features = response.data.data.features;
                $scope.areas.forEach(function (obj) {
                    obj.isChecked = true;
                });
                //TODO - add properties to areas
                // $scope.features = response.data.features;
                /*response.data.features.features.forEach(function (feature) {
                 console.log(feature.code);
                 });*/
                $scope.areaLayer.clearLayers();
                $scope.areaLayer.addData($scope.features);
                $scope.dataLayer.bringToFront();
                //TODO - doesn't really work how to center this
                //$scope.map.fitBounds($scope.areaLayer.getBounds());
                //TODO - add on event
                if (!$scope.infoControl) {
                    $scope.infoControl = new L.Control.Info({content: '<h4> Quick Stats </h4> Hover over area'});
                    $scope.infoControl.addTo($scope.map)
                }
                /*
                 if (!$scope.legendControl) {
                 $scope.legendControl = new L.Control.Legend();
                 $scope.legendControl.addTo($scope.map);
                 }*/
                //TODO - is this a good way?
                $scope.layers.overlays.areas.layerParams.showOnSelector = true;
            });
        }

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
            parseText(d3.tsvFormat(json))
        };

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
                console.log(error);
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
                                var arr = [];
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

        }, true);


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
            parseText(d3.tsvFormat(aggregatedData));


        };

        $scope.selectChallenge = function (challenge) {
            $scope.currentChallenge = challenge;
            $scope.$parent.focus = challenge.line;
            let params = getJsonFromUrl(challenge.dataurl);
            drawnItems.addLayer($scope.boundary);
            processUrl(params);
            processBoundary(true);
            //$scope.importMode = 'dataset';
            //console.log($scope.currentDataset);
            //$scope.selectDataset($scope.currentDataset);
        };
        $scope.selectDataset = function (dataset) {
            if (!dataset) return;
            //TODO - if url has changed need to do an update
            if (($scope.areaBbox == $scope.oldareaBbox) && ($scope.currentDataset == dataset) && !$scope.areachange) {
                $scope.parsed = true;
                return;
            }
            reset();
            $scope.text = "";
            //set current selected dataset
            $scope.currentDataset = dataset;
            //TODO - not a perfect place to do this
            $scope.datasetId = $scope.currentDataset.id;

            $scope.ctype = dataset.ctype;

            var requestURL = dataset.api_link;
            //TODO - rework this
            if (dataset.ext) {
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
            console.log("areas chance")            
            $scope.areachange = true;
            //workaround with url datasets
            if (($scope.importMode == 'dataset' || $scope.importMode == 'challenge') && $scope.currentDataset) {
                let larray = $scope.currentDataset.levels.split(',');

                if (!larray.includes('latlon') && !larray.includes('bbox') || $scope.areaBbox != $scope.oldareaBbox) {
                    $scope.oldareaBbox = JSON.parse(JSON.stringify($scope.areaBbox));
                    $scope.selectDataset($scope.currentDataset);
                }
            }
        }, true);

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
        $scope.master = {};
        $scope.formsubmitted = false;
        $scope.areachange = false;
        //$scope.loading = true;

        $scope.importMode = 'dataset';

        $scope.categories = ['Hierarchies', 'Time Series', 'Distributions', 'Correlations', 'Others'];

        $scope.bgColors = {
            'Hierarchies': '#0f0',
            'Time Series': 'rgb(255, 185, 5)',
            'Distributions': 'rgb(5, 205, 255)',
            'Correlations': '#df0',
            'Others': '#0f0'
        };


        $scope.$watch('files', function () {
            $scope.uploadFile($scope.files);
        });

        //TODO - save to amazon s3
        $scope.$watch('issuefiles', function () {
            //console.log($scope.issuefiles);
        });

        $scope.removeIssueFile = function (file) {
            const rindex = $scope.issuefiles.indexOf(file);
            $scope.issuefiles.splice(rindex, 1);
        }

        $scope.log = '';

        $scope.files = [];
        $scope.issuefiles = [];


        $scope.$watch('importMode', function (oldval, newval) {
            if (newval == oldval) return;
            // reset
            reset();
        });


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
            });


            $scope.oldData = data;
            parseText(d3.tsvFormat(unstacked));

            $scope.unstacked = true;

        };

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
            var keys = Object.keys($scope.data[0]);
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
                    //TODO - better way to clean up field titles
                    item[(newCols[i]).replace(/:/g, '-')] = result[key][newCols[i]] || "";
                }
                stacked.push(item);
            }

            $scope.oldData = data;
            parseText(d3.tsvFormat(stacked));

            $scope.restacked = true;

        };

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
                    //$scope.maploading = true;
                    controlLoader.show();
                    //TODO - what happens with big data?
                    $scope.dataLayer.clearLayers();
                    $scope.dataLayer.addData(response.data);
                    $scope.dataLayer.setZIndex(9999);
                    $scope.map.fitBounds($scope.dataLayer.getBounds());
                    $scope.layers.overlays.data.layerParams.showOnSelector = true;
                    //$scope.maploading = false;
                    controlLoader.hide();
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
                    //$scope.maploading = true;
                    controlLoader.show();

                    $scope.heatLayer.setLatLngs(result);
                    $scope.layers.overlays.heat.layerParams.showOnSelector = true;

                    //$scope.maploading = false;
                    controlLoader.hide();
                    //TODO - reset fields properly
                    $scope.georeferencing = false;
                    $scope.georeference = true;
                });

            }

        };

        //data will be (unstacked) turn to original
        $scope.stack = function () {
            parseText(d3.tsvFormat($scope.oldData));
            $scope.unstacked = ($scope.unstacked) ? false : true;
            $scope.restacked = ($scope.restacked) ? false : true;
        };


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
            $scope.currentDataset = false;
            //$scope.currentChallenge = false;
            $scope.geoAggregator = "";
            $scope.areachange = false;

            //$scope.$apply();
        }

        function resetMap() {
            $scope.areas = false;
            $scope.boundaryLayer.clearLayers();
            $scope.layers.overlays.boundary.layerParams.showOnSelector = false;
            $scope.areaLayer.clearLayers();
            $scope.layers.overlays.areas.layerParams.showOnSelector = false;
            $scope.dataLayer.clearLayers();
            $scope.layers.overlays.data.layerParams.showOnSelector = false;
            //$scope.heatLayer.clearLayers();
            $scope.markerLayer.clearLayers();
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

        //function to return a string of delimiter values from a object position
        function objectString(objectarr, key){
            let dataArray = [];
            objectarr.forEach(function (object) {
                dataArray.push(object[key]);
            });
            return dataArray.toString();
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
            });

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

            }
            //console.log(obj.key)
        }

        //function for adding data to geometry
        //TODO - test with unstacking!!
        function datatoGeom() {
            if($scope.legendControl){
                $scope.legendControl.remove();
                $scope.legendControl = false;
            }
            //TODO - Nomisweb specific??
            if ($scope.currentDataset.geom == "ons") {
                //clear previous data from layers
                $scope.areaLayer.eachLayer(function (layer) {                    
                    let temp = {};
                    temp[$scope.fcode] = layer.feature.properties[$scope.fcode];
                    temp[$scope.fname] = layer.feature.properties[$scope.fname];
                    layer.feature.properties = angular.copy(temp);                    
                    //TODO - need to make style changin into a function
                    layer.setStyle({fillColor: '#FD8D3C'})
                });
                if ($scope.currentDataset.ext) {
                    $scope.data.forEach(function (row) {
                        //TODO - find index of geotype!!
                        let layer = $scope.areaLayer.getLayer(row[Object.keys(row)[0]]);                        
                        let propkey = Object.keys(row)[1];
                        let propval = Object.keys(row)[2];
                        layer.feature.properties[row[propkey]] = row[propval];
                    });
                } else {
                    $scope.data.forEach(function (row) {
                        let layer = $scope.areaLayer.getLayer(row[Object.keys(row)[0]]);
                        //TODO - change querys for local db
                        if(is.undefined(layer))
                            return;
                        let rowCopy = Object.assign({}, row);
                        //TODO - hardcoded position, expect the area to be first?
                        delete rowCopy[Object.keys(row)[0]];
                        $.extend(layer.feature.properties, rowCopy);
                        if (row.Decile) {
                            layer.setStyle({fillColor: getColor(row.Decile)});
                            if (!$scope.legendControl) {
                                $scope.legendControl = new L.Control.Legend();
                                $scope.legendControl.addTo($scope.map);
                            }

                        }

                    });
                }

            }
        }

        //TODO - quick and hacky solution should have geo type variable for levels
        $scope.dataAvailable = function (levels) {
            let larray = levels.split(',');
            if (!larray.includes($scope.level) && !larray.includes('latlon') && !larray.includes('bbox'))
                return 'disabled'
        };


        function setLevel(zoom) {
            let level = '';
            switch (true) {
                case zoom >= 16:
                    level = 'oa';
                    break;
                case (zoom < 16 && zoom >= 14):
                    level = 'lsoa';
                    break;
                case (zoom < 14 && zoom >= 12):
                    level = 'wd';
                    break;
                case (zoom < 12 && zoom >= 10):
                    level = 'lad';
                    break;
                default:
                    level = 'rgn';
            }
            $scope.level = level;
        }

        function validURL(str) {
            var pattern = new RegExp(/^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g);
            if (!pattern.test(str)) {
                return false;
            } else {
                return true;
            }
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
                console.log($scope.areaLayer.getLayer(e.code))
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
        };
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
                //$scope.metadata = parser.metadata(d3.tsvFormat($scope.data));
                //TODO - already iterates data
                var data = parser(text);
                $scope.data = data;
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
                    });
                    $scope.chart = $scope.charts.filter(function (d) {
                        return d.title() == ($scope.ctype ? $scope.ctype : 'Scatter Plot');
                    })[0];
                    $scope.model = $scope.chart ? $scope.chart.model() : null;
                });
            } catch (e) {
                console.log(e)
                $scope.data = [];
                $scope.metadata = [];
                $scope.error = e.name == "ParseError" ? +e.message : false;
            }
            if (!$scope.data.length && $scope.model) $scope.model.clear();
            $scope.loading = false;
            var cm = $('.parsed .CodeMirror')[0].CodeMirror;
            $timeout(function () {
                cm.refresh();
            });
        };

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
        });

        $('body').mousedown(function (e, ui) {
            if ($(e.target).hasClass("dimension-info-toggle")) return;
            $('.dimensions-wrapper').each(function (e) {
                angular.element(this).scope().open = false;
                angular.element(this).scope().$apply();
            })
        });

        $scope.codeMirrorOptions = {
            dragDrop: false,
            lineNumbers: true,
            lineWrapping: true
        };

        $scope.selectChart = function (chart) {
            if (chart == $scope.chart) return;
            $scope.model.clear();
            $scope.chart = chart;
            $scope.model = $scope.chart.model();
        };

        $scope.submitChallenge = function (issue, issueForm) {
            issue.dataurl = buildUrl();
            issue.bbox = $scope.areaBbox;
            $http.post('/api/data/challenge', issue).then(function (response) {
                issue.dataurl = issue.dataurl + '&cid=' + response.data.cid;
                $scope.challenges.push(issue);
                //reset
                $scope.resetissueForm(issueForm);
                $("#issueModal").modal('hide');
            });


        };

        $scope.resetissueForm = function (issueForm) {
            if (issueForm) {
                issueForm.$setPristine();
                issueForm.$setUntouched();
            }
            $scope.issue = angular.copy($scope.issueTemplate);
        }

        $scope.submitDataRequest = function (datarequest, dataForm) {
            datarequest.boundary = JSON.stringify($scope.boundary.toGeoJSON());
            $http.post('/api/data/request', datarequest).then(function (response) {

            });
            //reset
            $scope.resetdataForm(dataForm);
            $("#dataModal").modal('hide');
        }

        $scope.resetdataForm = function (dataForm) {
            if (dataForm) {
                dataForm.$setPristine();
                dataForm.$setUntouched();
            }
            $scope.datarequest = angular.copy($scope.master);
        }

        $scope.focusInput = function () {
            $('input.ng-invalid')[0].focus();
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

        });

        $scope.sortCategory = function (chart) {
            // sort first by category, then by title
            return [chart.category(), chart.title()];
        };


        $(document).ready(refreshScroll);


    }
    ])

    .controller('DataCtrl', ['$scope', function ($scope) {

        $scope.inputData = "dataInPlace";
    }
    ]);


