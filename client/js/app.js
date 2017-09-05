'use strict';

angular.module('raw', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'raw.filters',
    'raw.services',
    'raw.directives',
    'leaflet-directive',
    'wavesurfer.angular',
    'raw.controllers',
    'mgcrea.ngStrap',
    'ui',
    'colorpicker.module',
    'ngFileUpload'
])

    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/main.html', controller: 'RawCtrl'});
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
    }]);
