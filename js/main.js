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

    // dom library
    const $ = require('jquery');

    // environment
    const env = "dev";
    console.log('current environment:',env);

    /*
     * costanti e defaults
     */
    // id infobox tag
    const idInfoBox = "infobox";
    const idFeatureBox = "featurebox";
    const idFeatureHeader = "featureboxheader";
    const idMapBox = "areaViewer";
    // default language
    let lang = 'en';
    switch(env){
        case 'pt2' :
        case 'sandona' :
        case 'torino' :
            lang = 'it';
            break;
        default:
            lang = 'en';
    }
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
    // mobile breakpoints
    const minHeight = 500;
    const minWidth = 500;

    // interactive mode enable/disable layout changes at focus
    let interactive = true;

    // const focusClass = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    const focusClass = {
        true:'focus',
        false: 'nofocus'
    };


    /*
     * moduli
     */
    // utilities
    const Utils = require('./utils');
    const utils = Utils();
    // mappa generale
    const Map = require('./map');
    const map = Map(idMapBox, env);
    const zoomControl = map.zoomControl;
    const mapBox = $('#'+idMapBox);
    // gestore di stato
    const Status = require('./status');
    const status = Status(map);
    // events
    const Events = require('./events');
    const events = Events(status, map);
    // POIs layer
    const markerGrid = require('./datasource.js');
    // Interactive layer
    const vectorGrid = require('./interactive.js');
    const vGrid = vectorGrid();
    // focus layer
    const focusLayer = require('./focus');
    const fLayer = focusLayer(status);
    // infobox
    const InfoBox = require('./infobox');
    const infoBox = InfoBox(status, map, idInfoBox, idFeatureBox, idMapBox, idFeatureHeader, utils, lang);



    /*
     * geocoder
     */
    // geocoder config
    const searchPlaceholder = {
        "en": "Search...",
        "it": "Cerca..."
    };
    let geocoderSettings = {
        defaultMarkGeocode: false,
        position: 'topleft',
        placeholder: searchPlaceholder[lang]
    };
    // geocoder load init
    geoCoder();
    // geocoder node
    let geocoder = L.Control.geocoder(geocoderSettings);

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
    markerGrid(map, status, utils, env);
    // inizializzazione focusLayer
    fLayer.addTo(map);
    // inizializzazione geocoder
    geocoder.addTo(map);


    /*
     * gestione del focus
     */
    // fit to bounds
    // valuta se fare fix dello zoom > options.maxZoom = map.getCenter();
    status.observe.filter(state => 'features' in state).subscribe(focus => {
        console.log('focus management',focus.features);
        let feature = fLayer.setLayer(focus.features);
        console.debug('fLayer.setLayer',feature);
        // map.removeLayer(mGrid);
        // console.debug('check focus behaviour',interactive, focusClass[interactive]);
        $('body').addClass(focusClass[interactive]);
        // console.debug('check body class',$('body').hasClass(focusClass[interactive]));
        map.invalidateSize();
        map.fitBounds(feature.getBounds());
    });

    // draw focus border
    // status.observe.filter(state => 'id' in state).map(state => state.id).subscribe(id => vGrid.highlight(id));

    // change interactivity settings
    status.observe.filter(state => 'interactive' in state).map(state => state.interactive).subscribe(newInter => {interactive = newInter});



    // set current contrast
    status.observe.filter(state => 'contrast' in state).map(state => state.contrast).subscribe(contrast => {
        if(contrast){
            map.setBasemap('contrast');
        }else{
            map.setBasemap('base');
        }
    });
    // add focus layer
    // status.observe.filter(state => 'features' in state).map(state => state.features).subscribe(features => fLayer.setLayer(features));
    // reset del focus
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        $('body').removeClass(focusClass[interactive]);
        map.invalidateSize();
        // mGrid.resetStyle();
        vGrid.resetStyle();
        // remove geometry
        console.debug('check fLayer',fLayer);
        fLayer.clearLayers();
    });


    /*
     * Geocoder management
     */
    // enable geocoder at explore
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        geocoder.addTo(map);
    });
    // disable geocoder at focus
    status.observe.filter(state => 'id' in state).subscribe(() => {
        geocoder.remove();
    });
    // switch geocoder lang
    status.observe.filter(state => 'lang' in state).map(state => state.lang).subscribe((lang) => {
        // remove geocoder
        geocoder.remove();
        // change geocoder placeholder accordingly to the new language
        geocoderSettings.placeholder = searchPlaceholder[lang];
        // create a new instance of geocoder
        geocoder = L.Control.geocoder(geocoderSettings);
        // add new geocoder to map
        geocoder.addTo(map);
    });



    /*
     * Gestione eventi mappa
     * 1) click su vGrid is top priority
     * 2) click on map as fallback in case of empty areas
     */
    vGrid.on('click', e => {
        if (e.originalEvent.defaultPrevented) {
            return;
        }
        e.originalEvent.preventDefault();

        // console.debug('click event at', e.latlng, e.layer.properties);
        // recupero focus se attuale
        let focus = status.getFocus();
        console.debug('is focus?',focus);
        if (focus) {
            console.debug('click inside focus area',focus);
            let pt = turf.point([e.latlng.lng, e.latlng.lat]);
            let geoJSON = {type: "FeatureCollection", features: focus.features};
            // console.debug('within?', pt, geoJSON);
            try{
                let result = within(turf.featureCollection([pt]), geoJSON);
                // console.debug('within?', result);
                if (result.features.length < 1) {
                    status.restore();
                } else {
                    status.focus({feature: e.layer.properties, id: e.layer.properties.id});
                }
            } catch (e){
                console.error('turf.within error',e);
                status.restore();
                return;
            }

        } else {
            // azione focus
            status.focus({feature: e.layer.properties, id: e.layer.properties.id});
        }
    });
    map.on('click',(e)=>{
        // console.debug('click on map, it should be handled?',!e.originalEvent.defaultPrevented);
        // fallback click outside
        if (e.originalEvent.defaultPrevented) {
            return;
        }
        e.originalEvent.preventDefault();

        //if focus > exit to explore
        console.debug('click on map, current status',status.current());
        if(status.current() === "focus"){
            return status.restore();
        }else{
            // console.debug('click on map, params',{lat: e.latlng.lat, lng: e.latlng.lng, zoom: map.getZoom()});
            // fallback focus: tile shape as default geometry
            status.focus({lat: e.latlng.lat, lng: e.latlng.lng, zoom: map.getZoom()});
        }
    });



    // prima del cambio di zoom
    map.on('moveend', (e) => {
        // update della posizione nello stato
        status.move({bounds:map.getBounds(),center:map.getCenter(),zoom:map.getZoom()});
    });

    // click su risultato geocode
    geocoder.on('markgeocode', function (e) {
        // console.debug('geocode', e.geocode.properties.osm_id);
        map.setView(e.geocode.center, locationZoom);
        // status.focus();
    });
    // at focus
    status.observe.filter(state => 'id' in state).subscribe(() => {
        // hide zoom controls
        zoomControl.remove();
    });
    // reset map
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        zoomControl.addTo(map);
    });

};
// export
module.exports.AreaViewer = AreaViewer;

// main init
AreaViewer();