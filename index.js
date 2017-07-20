/**
 * Created by drpollo on 21/05/2017.
 */
// librerie
require('leaflet');

// librerie ad hoc
require('./libs/Leaflet.VectorGrid');
require('./libs/leaflet-geojson-gridlayer');

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

// inizializzazione vectorGrid layer
vGrid.addTo(map);
// inizializzazione markerGrid layer
mGrid.addTo(map);
// inizializzazione focusLayer
fLayer.addTo(map);

/*
 * Gestione eventi
 */


vGrid.on('click', e => {
    if (e.originalEvent.defaultPrevented)
        return;

    e.originalEvent.preventDefault();


    let id = e.layer.properties.id,
        properties = e.layer.properties,
        bbox = JSON.parse(properties.bbox);
    // console.log('click on ',e, properties.name, id,bbox);

    // get feature details
    // detailsPromise = getFeature(id);
    // detailsPromise.then(
    //     response => {
    //         console.debug('feature details',response);
    //     },
    //     error => {
    //         console.error(error);
    //     }
    // );
    let bounds = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
    // console.log('fit to bounds',bounds);

    // todo set default style


    // get selected feature by id
    utils.getFeature(id).then(
        res => {
            // console.debug('id focus',id);
            // imposta stile
            let style = utils.hideStyle(id);
            mGrid.setStyle(style);
            // console.debug('getFeature',res);
            fLayer.clearLayers();
            // todo set style
            // aggiungo l'area di focus
            fLayer.addData(res);
            // Fit the map to the polygon bounds
            // set view
            map.flyToBounds(bounds);
        },
        err => {
            console.error('getFeature', err);
        }
    );

    // todo multiple selection

    // reset prev feature
    // if (currentFeature !== id)
    //     vGrid.resetFeatureStyle(currentFeature);
    //
    // vGrid.setFeatureStyle(id, highlightStyle);
    // currentFeature = id;

    // todo focus on feature (bbox)


    // todo clean markers not in the area
});


// prima del cambio di zoom
// map.on('zoomstart', (e) => {
//     // elimino il livello di focus
//     fLayer.clearLayers();
// });
// prima del cambio di zoom
map.on('movestart', (e) => {
    // elimino il livello di focus
    fLayer.clearLayers();
});
// fine cambio di zoom
map.on('zoomend', (e) => {
    // aggiorno stile marker
    // todo gestione focus nella scelta di stile
    mGrid.setStyle();
});
