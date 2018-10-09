'use strict';

angular.module('raw', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'mgcrea.ngStrap',
    'ui',
    'colorpicker.module',
    'ngFileUpload',
    'hc.marked',
    'hljs',
    'angular-markdown-editor',
    'ng-showdown',
    'ngTagsInput',
    'ngCookies',
    'raw.filters',
    'raw.services',
    'raw.directives',
    'leaflet-directive',
    'wavesurfer.angular',
    'raw.controllers'
])

    .config(['$routeProvider', '$locationProvider', 'markedProvider', 'hljsServiceProvider', function ($routeProvider, $locationProvider, markedProvider, hljsServiceProvider) {
        // marked config
        markedProvider.setOptions({
            gfm: true,
            tables: true,
            sanitize: true,
            highlight: function (code, lang) {
                if (lang) {
                    return hljs.highlight(lang, code, true).value;
                } else {
                    return hljs.highlightAuto(code).value;
                }
            }
        });
        // highlight config
        hljsServiceProvider.setOptions({
            // replace tab with 4 spaces
            tabReplace: '    '
        });
        $routeProvider.when('/',
            {
                templateUrl: 'partials/main.html',
                controller: 'RawCtrl'
            });
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);


    }]);


/*
 app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
 var original = $location.path;
 $location.path = function (path, reload) {
 if (reload === false) {
 var lastRoute = $route.current;
 var un = $rootScope.$on('$locationChangeSuccess', function () {
 $route.current = lastRoute;
 un();
 });
 }
 return original.apply($location, [path]);
 };
 }])*/
