'use strict';

const AreaViewer = () => {
    // map render library
    require('leaflet');
    // librerie ad hoc
    require('../libs/Leaflet.VectorGrid');
    require('../libs/leaflet-geojson-gridlayer');
    // spatial utils
    const within = require('@turf/within');
    const turf = require('@turf/helpers');
    // temporal utils
    const moment = require('moment');
    // dom library
    const $ = require('jquery');




    /*
     * costanti e defaults
     */
    // id infobox tag
    const idNode = "label";
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
    // default contrast
    let contrast = false;


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
    // infobox
    const InfoBox = require('./infobox');
    const infoBox = InfoBox(status, idNode);
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



    // init baselayer
    if(contrast){
        map.setBasemap('contrast');
    }



    /*
     * Inizializzazioni
     */
    // stato
    status.move({bounds:map.getBounds(),center:map.getCenter(),zoom:map.getZoom()});
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
        console.debug('fitting to bounds',bounds);
        // map.removeLayer(mGrid);
        map.fitBounds(bounds);
        // map.addLayer(mGrid);
    });

    // draw focus border
    status.observe.filter(state => 'id' in state).map(state => state.id).subscribe(id => vGrid.highlight(id));

    // set default style
    status.observe.filter(state => 'id' in state).map(state => state.id).subscribe(id => mGrid.setStyle(id));

    // set current contrast
    status.observe.filter(state => 'contrast' in state).map(state => state.contrast).subscribe(contrast => {
        if(contrast){
            map.setBasemap('contrast');
        }else{
            map.setBasemap('base');
        }
    });
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
        status.move({bounds:map.getBounds(),center:map.getCenter(),zoom:map.getZoom()});
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
// export
module.exports.AreaViewer = AreaViewer;

// main init
AreaViewer();