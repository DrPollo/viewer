/**
 * Created by drpollo on 21/05/2017.
 */
// librerie
require('leaflet');

// librerie ad hoc
require('./libs/Leaflet.VectorGrid');
require('./libs/leaflet-geojson-gridlayer');

const inside = require('@turf/inside');
const combine = require('@turf/combine');
const within = require('@turf/within');
const turf = require('@turf/helpers');
/*
 * moduli
 */

// gestore di stato
const Status = require('./js/status');
const status = Status();
// mappa generale
const Map = require('./js/map');
const map = Map();

const markerGrid = require('./js/datasource.js');
const mGrid = markerGrid(map);

const vectorGrid = require('./js/interactive.js');
const vGrid = vectorGrid();

const focusLayer = require('./js/focus');
const fLayer = focusLayer();

// utilities
const Utils = require('./js/utils');
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

const contrast = false;


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
status.observe.filter( state => 'bounds' in state ).map(state => state.bounds).subscribe( bounds => map.fitBounds(bounds) );
// draw focus border
status.observe.filter( state => 'id' in state ).map(state => state.id).subscribe( id => vGrid.highlight(id) );
// set default style
status.observe.filter( state => 'id' in state ).map(state => state.id).subscribe( id => mGrid.setStyle(id) );
// add focus layer
status.observe.filter( state => 'features' in state ).map(state => state.features).subscribe( features => fLayer.setLayer(features) );
// reset del focus
status.observe.filter( state => 'reset' in state).subscribe( () => {
    mGrid.resetStyle();
    vGrid.resetStyle();
    fLayer.clearLayers();
} );


/*
 * Gestione eventi mappa
 */
vGrid.on('click', e => {
    if (e.originalEvent.defaultPrevented)
        return;

    e.originalEvent.preventDefault();

    console.debug('click event at',e.latlng);
    // recupero focus se attuale
    let focus = status.getFocus();
    if(focus){
        // console.debug('click inside focus area',focus);
        let pt = turf.point([e.latlng.lng,e.latlng.lat]);
        let geoJSON = {type:"FeatureCollection",features:focus.features};
        console.debug('within?',pt,geoJSON);
        let result = within(turf.featureCollection([pt]),geoJSON);
        console.debug('within?',result);
        if(result.features.length < 1){
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
