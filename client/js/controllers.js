'use strict';

/* Controllers */

angular.module('raw.controllers', [])

    .controller('RawCtrl', ['$scope', 'dataService', 'leafletData', '$http', '$timeout', '$sce', function ($scope, dataService, leafletData, $http, $timeout, $sce) {

        //Leaflet controller
        $scope.maploading = false;
        angular.extend($scope, {
            center: {
                //lat: 55.0156,
                //lng: -1.67643,
                lat: 55.00302271728109,
                lng: -1.4633274078369143,
                zoom: 14
            },
            controls: {
                custom: new L.Control.FullScreen(),
                scale: true,
                draw: {
                    draw: {
                        polyline: {
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
                                color: '#bada55'
                            }
                        },
                        circle: false, // Turns off this drawing tool
                        marker: true,
                        rectangle: false

                    }
                }

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
                    edina: {
                        name: 'Ordnance Survey',
                        url: 'http://openstream.edina.ac.uk/openstream/wms',
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
                    }

                },
                overlays: {
                    draw: {
                        name: 'draw',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    },
                    areas:{
                        name: 'areas',
                        type: 'geoJSONShape',
                        data: [],
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        },
                        layerOptions: {
                            style: {
                                color: '#00D',
                                fillColor: 'red',
                                weight: 2.0,
                                opacity: 0.6,
                                fillOpacity: 0.2
                            },
                            onEachFeature: onEachFeature
                        }
                    }

                }
            }
        });

        function onEachFeature(feature, layer) {
            layer.on({
                click: function() {
                    console.log(layer.feature);
                    //$scope.country = layer.feature.properties.name;

                },
                mouseover: function(){
                    console.log(layer.feature.properties.name);
                }
            })
        }

        leafletData.getMap().then(function (map) {
            leafletData.getLayers().then(function (layers) {
                var drawnItems = layers.overlays.draw;
                var areas = layers.overlays.areas;
                //Clear boundry on each draw
                map.on('draw:drawstart ', function (e) {
                    drawnItems.clearLayers();
                });
                map.on('draw:created', function (e) {
                    $scope.boundary = e.layer;
                    drawnItems.addLayer($scope.boundary);
                    getArea($scope.boundary.toGeoJSON());
                });
                /*map.on('zoomend',function (e) {
                    if ($scope.layers.overlays.areas.layerParams.showOnSelector) {
                        getArea($scope.boundary.toGeoJSON());
                    }
                });*/
                //TODO - make it separate
                $scope.$watch('center.zoom',function () {
                    if ($scope.layers.overlays.areas.layerParams.showOnSelector) {
                        getArea($scope.boundary.toGeoJSON());
                    }
                });
                function getArea(json){
                    $scope.maploading = false;
                    if (!json) return;
                    $http.post('/api/data/area', {zoom: $scope.center.zoom, boundary: JSON.stringify(json)}).then(function(response){
                        //handle your response here
                        $scope.maploading = false;
                        $scope.lsoas = response.data.lsoas;
                        //$scope.features = response.data.features;
                        areas.clearLayers();
                        areas.addData(response.data.features);
                        //TODO - is this a good way?
                        $scope.layers.overlays.areas.layerParams.showOnSelector = true;
                    });
                }

            });
        });

        //search postcode function
        $scope.searchPostcode = function (code) {
            $http.get("/api/data/loc/"+code).then(function(response) {
                $scope.center.lat = response.data.latitude;
                $scope.center.lng = response.data.longitude;
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

        // load URl
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
            // first trying jsonp
            $http.jsonp($sce.trustAsResourceUrl(url), {jsonpCallbackParam: 'callback'})
                .then(function (response) {
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
                        )

                });

        });


        $scope.samples = [
            {title: 'Travel to Work', type: 'Census 2011', url: '/api/data/travel', ctype: 'Pie chart'},
            {title: 'General Health', type: 'Census 2011', url: '/api/data/health', ctype: 'Pie chart'},
            {title: 'Index of Multiple Deprivation', type: 'Mid 2015', url: '/api/data/imd', ctype: ''},
            {title: 'Population', type: 'Mid 2015', url: '/api/data/pop', ctype: 'Pie chart'},
            {title: 'Economic Activity', type: 'Census 2011', url: '/api/data/eco', ctype: ''},
            {title: 'Long-term health problem', type: 'Census 2011', url: '/api/data/dis', ctype: ''},
            {title: 'Crime', type: 'data.police.uk', url: '/api/data/crime', ctype: ''},
            {title: 'Community Conversational', type: 'Open Lab', url: '/api/data/cc', ctype: ''}

        ]

        $scope.selectSample = function (sample) {
//    $scope.$watch('sample', function (sample){
            if (!sample) return;
            $scope.text = "";
            $scope.loading = true;
            dataService.loadSample(sample.url, $scope.lsoas).then(
                function (data) {
                    $scope.text = data.replace(/\r/g, '');
                    $scope.ctype = sample.ctype;
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

        $scope.$watch('dataView', function (n, o) {
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

        $scope.importMode = 'sample';

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
            $scope.parsed = false;
            $scope.loading = false;
            $scope.clipboardText = "";
            $scope.unstacked = false;
            $scope.text = "";
            $scope.data = [];
            $scope.json = null;
            $scope.worksheets = [];
            $scope.fileName = null;
            $scope.url = "";
            //$scope.$apply();
        })


        var arrays = [];

        $scope.unstack = function () {
            if (!$scope.stackDimension) return;
            var data = $scope.data;
            var base = $scope.stackDimension.key;

            var unstacked = [];

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

        $scope.stack = function () {
            parseText(d3.tsv.format($scope.oldData));
            $scope.unstacked = false;
        }


        function jsonTree(json) {
            // mettere try
            var tree = JSON.parse(json);
            $scope.json = tree;
            $scope.structure = [];
            //console.log(JSON.parse(json));
            expand(tree);
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
            //console.log(d3.mean(m),m)
            $scope.pivot = d3.mean(m);

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
                $scope.data = parser(text);
                $scope.metadata = parser.metadata(text);
                $scope.error = false;
                pivotable($scope.data);
                $scope.parsed = true;

                $timeout(function () {
                    $scope.charts = raw.charts.values().sort(function (a, b) {
                        return d3.ascending(a.category(), b.category()) || d3.ascending(a.title(), b.title())
                    })
                    $scope.chart = $scope.charts.filter(function (d) {
                        return d.title() ==  ($scope.ctype ? $scope.ctype : 'Scatter Plot');
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
