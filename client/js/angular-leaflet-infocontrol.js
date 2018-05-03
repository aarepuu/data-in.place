/**
 * Created by aare on 22/02/2018.
 */

(function () {
    L.Control.Info = L.Control.extend({
        options: {
            position: 'topright',
            title: 'Info Control',
            content: '',
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "info");
            container.innerHTML = this.options.content;
            map.infoControl = this;
            return container;
        },
        getContent: function () {
            return this.getContainer().innerHTML;
        },
        setContent: function (html) {
            this.getContainer().innerHTML = html;
        }
    });

    L.control.info = function (options) {
        return new L.Control.Info(options);
    };

})();
