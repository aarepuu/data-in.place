/**
 * Created by aare on 22/02/2018.
 */

(function () {
    L.Control.Legend = L.Control.extend({
        options: {
            position: 'bottomright',
            title: 'Legend Control',
            content: '',
            labels: [],
            grades: [0, 10, 20, 50, 100, 200, 500, 1000]
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "info legend");
            //container.innerHTML = this.options.content;
            let grades = this.options.grades, labels = this.options.labels
            for (var i = 0; i < grades.length; i++) {
                container.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            //add instance to map
            map.legendControl = this;
            return container;
        },
        getContent: function () {
            return this.getContainer().innerHTML;
        },
        setContent: function (html) {
            this.getContainer().innerHTML = html;
        },
        //TODO - tools for manipulating with the legend
        setLabels: function () {

        },
        getLabels: function () {

        },
        setTitle: function () {

        },
        getTitle: function () {

        },
        setBuckets: function () {
            
        },
        getBuckets: function () {
            
        },
        onRemove: function (map) {
            
        }

    });

    L.control.legend = function (options) {
        return new L.Control.Legend(options);
    };

    //TODO - http://pro.arcgis.com/en/pro-app/help/mapping/layer-properties/data-classification-methods.htm
    function getColor(d) {
        return d > 1000 ? '#800026' :
            d > 500 ? '#BD0026' :
                d > 200 ? '#E31A1C' :
                    d > 100 ? '#FC4E2A' :
                        d > 50 ? '#FD8D3C' :
                            d > 20 ? '#FEB24C' :
                                d > 10 ? '#FED976' :
                                    '#FFEDA0';
    }

})();
