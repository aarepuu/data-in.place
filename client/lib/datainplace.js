/**
 * Created by aare on 20/06/2018.
 */


!function (exports) {
    'use strict';

    var datainplace = {
        version: "1.0.0",
        models: d3.map(),
        charts: d3.map()
    };


    datainplace.model = function () {

        var title = "Untitled",
            description = null,
            dimensions = d3.map();

        var model = function (data) {
            if (!data) return;
            return map.call(this, data);
        }

        function map(data) {
            return data;
        }

        model.title = function (_) {
            if (!arguments.length) return title;
            title = "" + _;
            return model;
        }

        model.description = function (_) {
            if (!arguments.length) return description;
            description = "" + _;
            return model;
        }

        model.map = function (_) {
            if (!arguments.length) return map;
            map = _;
            return model;
        }

        model.dimension = function (id) {
            var id = id || dimensions.values().length;
            var dimension = model_dimension();
            dimensions.set(id, dimension);
            return dimension;
        }

        model.dimensions = function () {
            return dimensions;
        }

        model.isValid = function () {
            return dimensions.values()
                    .filter(function (d) {
                        return d.required() > d.value.length;
                    })
                    .length == 0;
        }

        model.instruction = function () {
            return dimensions.values()
                .filter(function (d) {
                    return d.required() > d.value.length;
                })
                .map(function (d) {
                    var v = d.required() - d.value.length > 1 ? 'dimensions' : 'dimension';
                    return '<b>' + d.title() + "</b> requires at least " + (d.required() - d.value.length) + " more " + v;
                })
                .join(". ")
        }

        model.clear = function () {
            dimensions.values().forEach(function (d) {
                d.clear()
            });
        }

        return model;

    }

    exports.datainplace = datainplace;

}(typeof exports !== 'undefined' && exports || this);