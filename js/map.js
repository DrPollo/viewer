/**
 * Created by drpollo on 20/07/2017.
 */
// definition of the map

module.exports = (idMapBox, env) => {
    const $ = require('jquery');

    // const baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    // const baselayer = 'https://api.mapbox.com/styles/v1/drp0ll0/cj0tausco00tb2rt87i5c8pi0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
    const baselayer = 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const contrastlayer = 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // const baseAttribution = '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>';
    const baseAttribution = "Tiles and Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.";
    const contrastAttribution = "Tiles and Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.";
    // const contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
    // const contrastlayer = 'https://api.mapbox.com/styles/v1/drp0ll0/cj167l5m800452rqsb9y2ijuq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
    // const contrastlayer = 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // const contrastAttribution = '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>';
    // const contrastAttribution = "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.";

    // "tile_view" : "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    //     "tile_view_attribution": "Tiles and Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>.",
    //     "tile_edit" : "http://b.tile.stamen.com/toner/{z}/{x}/{y}.png",
    //     "tile_edit_attribution": "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>."


    // map setup
    const layers = {
        base: L.tileLayer(baselayer, {
            maxZoom: 20,
            attribution: baseAttribution
        }),
        contrast: L.tileLayer(contrastlayer, {
            maxZoom: 20,
            attribution: contrastAttribution
        })
    };

    // defaults
    let initZoom = 14;
    let initLat = 45.630373;
    let initLon = 12.566082;

    switch (env){
        case 'pt1':
            initZoom = 14;
            initLat = 51.483448;
            initLon = -0.082088;
            break;
        case 'pt2':
            initZoom = 14;
            initLat = 45.070339;
            initLon = 7.686864;
            break;
        case 'pt3':
            initZoom = 14;
            initLat = 45.630373;
            initLon = 12.566082;
            break;
        case 'sandona':
            initZoom = 14;
            initLat = 45.630373;
            initLon = 12.566082;
            break;
        case 'torino':
            initZoom = 14;
            initLat = 45.070339;
            initLon = 7.686864;
            break;
        case 'southwark':
            initZoom = 14;
            initLat = 51.483448;
            initLon = -0.082088;
            break;
    }


    let zoomControlPosition = 'bottomleft';

    const map = L.map(idMapBox).setView([initLat, initLon], initZoom);
    // control position
    const zoomControl = map.zoomControl;
    zoomControl.setPosition(zoomControlPosition);

    // pane per vectorGrid
    map.createPane('focusPane');
    map.createPane('customMarkerPane');
    map.createPane('vectorGridPane');

    // gestione pane
    // focusPane > focus geometry
    map.getPane('focusPane').style.zIndex = 9;
    // overlayPane > markers
    map.getPane('overlayPane').style.zIndex = 10;
    map.getPane('customMarkerPane').style.zIndex = 10;
    // vectorGridPane > vector tile
    map.getPane('vectorGridPane').style.zIndex = 11;


    // cartography
    let baseLayer = layers['base'].addTo(map);

    map.setBasemap = (basemap) => {
        if (baseLayer) {
            map.removeLayer(baseLayer);
        }

        baseLayer = ( layers[basemap] || layers['base'] );

        map.addLayer(baseLayer);
    };








    return map;
};