'use strict';

const AreaViewer = () => {
    // librerie
    require('leaflet');

    // librerie ad hoc
    require('../libs/Leaflet.VectorGrid');
    require('../libs/leaflet-geojson-gridlayer');
    // require('../libs/leaflet.control-geocoder');


    const within = require('@turf/within');
    const turf = require('@turf/helpers');




    /*
     * moduli
     */
    // gestore di stato
    const Status = require('./status');
    const status = Status();
    // mappa generale
    const Map = require('./map');
    const map = Map(status);
    // events
    const Events = require('./events');
    const events = Events(status, map);
    // POIs layer
    const markerGrid = require('./datasource.js');
    const mGrid = markerGrid(map);
    // Interactive layer
    const vectorGrid = require('./interactive.js');
    const vGrid = vectorGrid();
    // focus layer
    const focusLayer = require('./focus');
    const fLayer = focusLayer();

    // utilities
    const Utils = require('./utils');
    const utils = Utils();


    /*
     * geocoder
     */
    // geocoder config
    const geocoderSettings = {
        defaultMarkGeocode: false,
        position: 'topleft'
    };
    // geocoder load init
    geoCoder();
    // geocoder node
    const geocoder = L.Control.geocoder(geocoderSettings);


    /*
     * costanti e defaults
     */
    // default language
    let lang = 'en';

    // colori
    const colors = {
        'FL_GROUPS': '#3F7F91',
        'FL_EVENTS': '#88BA5C',
        'FL_NEWS': '#823256',
        'FL_ARTICLES': '#FFB310',
        'FL_PLACES': '#FE4336'
    };
    const orange = "#ff7800",
        blue = "#82b1ff",
        green = "#33cd5f",
        gray = "#dcdcdc";
    /*
     * map baselayers
     * 1) baselayer: normal base layer
     * 2) contrastlayer: high contrast base layer
     */
    const baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    // const baselayer = 'https://api.mapbox.com/styles/v1/drp0ll0/cj0tausco00tb2rt87i5c8pi0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
    const contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
    // const contrastlayer = 'https://api.mapbox.com/styles/v1/drp0ll0/cj167l5m800452rqsb9y2ijuq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
    // default contrast
    let contrast = false;


// map setup
    const layers = {
        base: L.tileLayer(baselayer, {
            maxZoom: 20,
            attribution: '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>'
        }),
        contrast: L.tileLayer(contrastlayer, {
            maxZoom: 20,
            attribution: '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>'
        })
    };

// cartography
    layers[contrast ? 'contrast' : 'base'].addTo(map);


    /*
     * Infobox management
     * tag id = "label"
     *
     */
    const tooltipLabel = {
        it : 'Click sulla mappa per esplorare',
        en : 'Click the map to explore'
    };
    const tooltipCancel = {
        it : "Indietro",
        en : 'Back'
    };
    const label = document.getElementById('label');
    // set labels
    const defIcon = '<button " title="'+tooltipLabel[lang]+'">&#x02713;</button>';
    const defaultLabel = defIcon+tooltipLabel[lang];
    label.innerHTML = defaultLabel;
    const cancelButton = '<button onclick="cancel()" title="'+tooltipCancel[lang]+'">&#x2715;</button>';
    // set label current focus
    const setLabel = (params) => {
        // set default content
        let content = 'lat: '+params.lat+', lon:'+params.lng+', zoom: '+params.zoom_level;
        if(params.name && params.name !== params.type){
            // set displa_name
            content = params.name;
        } else if(params.display_name){
            // set display_name
            content = params.display_name;
        } else if(params.type){
            // set type
            content = params.type;
        }
        label.innerHTML = cancelButton+content;
    };
    // reset focus
    const cancel = () => {
        // reset label
        label.innerHTML = defaultLabel;
        // exit focus
        status.restore();
    };


    /*
     * Inizializzazioni
     */
    // stato
    status.move(map.getBounds());
    // inizializzazione vectorGrid layer
    vGrid.addTo(map);
    // inizializzazione markerGrid layer
    mGrid.addTo(map);
    // inizializzazione focusLayer
    fLayer.addTo(map);
    // inizializzazione geocoder
    geocoder.addTo(map);


    /*
     * gestione del focus
     */
    // fit to bounds
    // valuta se fare fix dello zoom > options.maxZoom = map.getCenter();
    status.observe.filter(state => 'bounds' in state).map(state => state.bounds).subscribe(bounds => {
        // map.removeLayer(mGrid);
        map.fitBounds(bounds);
        // map.addLayer(mGrid);
    });

    // draw focus border
    status.observe.filter(state => 'id' in state).map(state => state.id).subscribe(id => vGrid.highlight(id));
    // todo fill label

    // set default style
    status.observe.filter(state => 'id' in state).map(state => state.id).subscribe(id => mGrid.setStyle(id));
    // add focus layer
    status.observe.filter(state => 'features' in state).map(state => state.features).subscribe(features => fLayer.setLayer(features));
    // reset del focus
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        mGrid.resetStyle();
        vGrid.resetStyle();
        fLayer.clearLayers();
    });
    //


    /*
     * Gestione eventi mappa
     */
    vGrid.on('click', e => {
        if (e.originalEvent.defaultPrevented) {
            return;
        }
        e.originalEvent.preventDefault();

        console.debug('click event at', e.latlng);
        // recupero focus se attuale
        let focus = status.getFocus();
        if (focus) {
            // console.debug('click inside focus area',focus);
            let pt = turf.point([e.latlng.lng, e.latlng.lat]);
            let geoJSON = {type: "FeatureCollection", features: focus.features};
            console.debug('within?', pt, geoJSON);
            let result = within(turf.featureCollection([pt]), geoJSON);
            console.debug('within?', result);
            if (result.features.length < 1) {
                status.restore();
            } else {
                status.focus(e.layer.properties);
            }
        } else {
            // azione focus
            status.focus(e.layer.properties);
        }
    });
    // prima del cambio di zoom
    map.on('moveend', (e) => {
        // update della posizione nello stato
        status.move(map.getBounds());
    });
    // fine cambio di zoom
    map.on('zoomend', (e) => {
        // aggiorno stile marker
        // todo gestione focus nella scelta di stile
        mGrid.update();
    });

    // click su risultato geocode
    geocoder.on('markgeocode', function (e) {
        console.log('geocode', e.geocode.properties.osm_id);
        map.setView(e.geocode.center, locationZoom);
        // status.focus();
    });

};
// export {AreaViewer};
module.exports.AreaViewer = AreaViewer;
AreaViewer();