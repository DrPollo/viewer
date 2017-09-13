(function () {
    /**
     * Created by drpollo on 21/05/2017.
     */
// librerie
    require('leaflet');

// librerie ad hoc
    require('../libs/Leaflet.VectorGrid');
    require('../libs/leaflet-geojson-gridlayer');

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
    const map = Map();

    const markerGrid = require('./datasource.js');
    const mGrid = markerGrid(map);

    const vectorGrid = require('./interactive.js');
    const vGrid = vectorGrid();

    const focusLayer = require('./focus');
    const fLayer = focusLayer();

// utilities
    const Utils = require('./utils');
    const utils = Utils();


    /*
     * costanti e defaults
     */
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

// const baselayer = '';
    const baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    const contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
// default contrast
    let contrast = false;


// language
    const defaultLang = 0;
    const languages = ['en', 'it'];
    const userLang = navigator.language || navigator.userLanguage;
    let lang = languages[defaultLang];
    for (let i = 0; i < languages.length; i++) {
        let l = languages[i];
        if (userLang.search(l) > -1) {
            lang = l;
        }
    }


// default date
    let date = new Date();
// get search params
// check for IE
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf("MSIE ");

// If Internet Explorer, return version number
    if (msie > 0) {
        params = escape(location.search);
    } else {
        params = (new URL(location)).searchParams;
    }

    if (params) {
        // override location from get params
        // c = lat:lng:zoom > centre
        if (params.get("c")) {
            let c = params.get("c");
        }
        // contrast
        contrast = params.get('contrast') === 'true';
        // lang > default agent or "en"
        lang = params.get('lang') ? params.get('lang') : lang;
        // date > current date
        date = params.get("date") ? params.get("date") : date;
    } else {
        console.error('cannot retrieve search params from URL location');
    }


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


    /*
     * Gestione eventi mappa
     */
    vGrid.on('click', e => {
        if (e.originalEvent.defaultPrevented){
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
}());