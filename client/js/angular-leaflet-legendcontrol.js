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
            grades: [1, 2, 3, 4, 5, 6, 7, 8, 9,10]
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

})();
