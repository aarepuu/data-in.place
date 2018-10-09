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
            range: [0, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "info legend");
            //container.innerHTML = this.options.content;
            let range = this.options.range, labels = this.options.labels;
            /*let color = d3.scale.threshold()
                .domain(range)
                .range(d3.schemeReds[range.length]);
            color.range().map(function(d) {
                d = color.invertExtent(d);
                console.log(color(d[0]));
                container.innerHTML +=
                    '<i style="background:' + color(d[0]) + '"></i> ' +
                    d[0] + (d[1] ? '&ndash;' + d[1] + '<br>' : '+');
            });}*/
            for (var i = 0; i < range.length; i++) {
                container.innerHTML +=
                   /* '<i style="background:' + getColor(range[i] + 1) + '"></i> ' +
                    range[i] + (range[i + 1] ?  '<br>' : '');*/
                '<i style="background:' + getColor(range[i] + 1) + '"></i> ' + (range[i] == 0 ? ' 10% most deprived' : range[i] == 9 ? ' 10% least deprived' : ' ') + '<br>';
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
