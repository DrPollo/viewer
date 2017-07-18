/**
 * Created by drpollo on 21/05/2017.
 */



require('leaflet');
require('./libs/Leaflet.VectorGrid');
require('./libs/leaflet-geojson-gridlayer');
// defaults
const initZoom = 14;
const initLat = 45.070312;
const initLon = 7.686856;
// const baselayer = '';
const baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
const contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';


const orange = "#ff7800";
const blue = "#82b1ff";
const green = "#33cd5f";


// L.mapbox.accessToken = 'pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
// var map = L.mapbox.map('map');
// var vector = L.mapbox.gridLayer('https://tiles.fldev.di.unito.it/{z}/{x}/{y}').addTo(map);
//


const featureStyle = function (feature, zoom) {
    // console.log(feature,zoom);
    return {
        fill: false,
        weight: 0
    };
};

const vectorMapStyling = {
    nazioni: featureStyle,
    regioni: featureStyle,
    provincie: featureStyle,
    comuni: featureStyle,
    circoscrizioni: featureStyle,
    quartieri: featureStyle,
    city_block: featureStyle,
    site: featureStyle,
    building: featureStyle,
    landusages: featureStyle,
    roads: featureStyle,
    waterareas: featureStyle,
    waterways: featureStyle,
    indoor: featureStyle,
    interactive: featureStyle
};

// const vectorMapStyling = {
//     nazioni: function (feature, zoom) {
//         // console.log('nazione');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: zoom > 4 ? 2 : 1,
//             color: '#888',
//             opacity: 1
//         };
//     },
//     regioni: function (feature, zoom) {
//         // console.log('regione');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 1,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     provincie: function(feature,zoom){
//         // console.log('provincia');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 1,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     comuni:function(feature,zoom){
//         // console.log('comune');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: zoom < 15 ? 1 : 0,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     circoscrizioni:function(feature,zoom){
//         // console.log('circoscrizione');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 1,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     quartieri:function(feature,zoom){
//         // console.log('quartieri');
//         return {
//             fill: zoom < 15,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 1,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     city_block:function(feature,zoom){
//         // console.log('city_block');
//         return {
//             fill: zoom < 17,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 1,
//             color: '#888',
//             opacity: 0.5,
//         };
//     },
//     site:function(feature,zoom){
//         // console.log('site');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 0,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     building:function(feature,zoom){
//         // console.log('building');
//         return {
//             fill: true,
//             fillColor: '#888',
//             fillOpacity: 1,
//             weight: 1,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     landusages:{
//         fill: true,
//         weight: 0,
//         color: orange,
//         opacity: 1,
//         fillOpacity:0.75,
//         fillColor: green
//     },
//     roads:function(feature,zoom){
//         console.log('roads',zoom);
//         return {
//             fill: true,
//             fillColor: '#888',
//             fillOpacity: 1,
//             weight: zoom,
//             color: '#888',
//             opacity: 0.5
//         };
//     },
//     waterareas:{
//         fill: true,
//         weight: 0,
//         color: orange,
//         opacity: 1,
//         fillOpacity:1,
//         fillColor: blue
//     },
//     waterways:{
//         fill: true,
//         weight: 0,
//         color: orange,
//         opacity: 1,
//         fillOpacity:1,
//         fillColor: blue
//     },
//     indoor:function(feature,zoom){
//         // console.log('indoor');
//         return {
//             fill: true,
//             fillColor: '#fafafa',
//             fillOpacity: 1,
//             weight: 1,
//             color: orange,
//             opacity: 0.5
//         };
//     },
//     // interactive:// console.log(feature,zoom);
//     //     return {
//     //         fill: true,
//     //         weight: 0,
//     //         color: orange,
//     //         opacity: 1,
//     //         fillOpacity:0.75,
//     //         fillColor: '#fafafa'};
// };

const ordering = function (layers, zoom) {
    // console.debug('reordering....',layers);
    switch (zoom) {
        case 1:
        case 2:
            return [
                "nazioni",
                "waterareas",
                "waterways"
            ];
            break;
        case 3:
        case 4:
            return [
                "nazioni",
                "regioni",
                "provincie",
                "waterareas",
                "waterways"
            ];
            break;
        case 5:
        case 6:
            return [
                "nazioni",
                "regioni",
                "provincie",
                "landusages",
                "roads",
                "waterareas",
                "waterways"];
            break;
        case 7:
        case 8:
            return [
                "nazioni",
                "regioni",
                "provincie",
                "landusages",
                "roads",
                "waterareas",
                "waterways",
                "comuni",];
            break;
        case 9:
        case 10:
            return [
                "nazioni",
                "regioni",
                "provincie",
                "landusages",
                "roads",
                "waterareas",
                "waterways",
                "comuni"];
            break;
        case 11:
        case 12:
            return [
                "provincie",
                "landusages",
                "roads",
                "waterareas",
                "waterways",
                "comuni"];
            break;
        case 13:
        case 14:
            return [
                "provincie",
                "quartieri",
                "landusages",
                "comuni"];
            break;
        case 15:
        case 16:
            return [
                "comuni",
                "city_block",
                "landusages",
                "waterareas",
                "waterways",
                "quartieri",];
            break;
        case 17:
        case 18:
            return [
                "site",
                "landusages",
                "building",
                "roads",
                "waterareas",
                "waterways",
                "quartieri",
                "city_block",];
            break;
        case 19:
        case 20:
            return [
                "site",
                "building",
                "roads",
                "waterareas",
                "waterways",
                "indoor"];
            break;
        default:
            return Object.keys(layers);
    }
};


const highlightStyle = Object.assign({},
    featureStyle,
    {
        fill: false,
        weight: 2,
        opacity: 1,
        color: orange
    });


const contrast = false;

// definition of the map
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


const map = L.map('map').setView([initLat, initLon], initZoom);
// pane per vectorGrid
map.createPane('vectorGridPane');
map.createPane('focusPane');
// gestione pane
// overlayPane > markers
map.getPane('overlayPane').style.zIndex = 10;
// vectorGridPane > vector tile
map.getPane('vectorGridPane').style.zIndex = 11;
// focusPane > focus geometry
map.getPane('focusPane').style.zIndex = 12;


const focusStyle = {
    style:{
        color: orange,
        weight: 2,
        fill:false,
        fillColor: orange,
        opacity:1,
        fillOpacity: 0.5
    },
    pane: 'focusPane'
};
const focusLayer = L.geoJson([], focusStyle).addTo(map);

layers[contrast ? 'contrast' : 'base'].addTo(map);


const colors = {
    'FL_GROUPS': '#3F7F91',
    'FL_EVENTS': '#88BA5C',
    'FL_NEWS': '#823256',
    'FL_ARTICLES': '#FFB310',
    'FL_PLACES': '#FE4336'
};


/*
 * VectorGrid
 */


// reset styles
const resetStyle = {
    color: 'transparent',
    weight: 0,
    fillColor: 'transparent'
};
L.Path.mergeOptions(resetStyle);
L.Polyline.mergeOptions(resetStyle);
L.Polygon.mergeOptions(resetStyle);
L.Rectangle.mergeOptions(resetStyle);
L.Circle.mergeOptions(resetStyle);
L.CircleMarker.mergeOptions(resetStyle);
// end reset styles


// Monkey-patch some properties for mapzen layer names, because
// instead of "building" the data layer is called "buildings" and so on
vectorMapStyling.buildings = vectorMapStyling.building;
vectorMapStyling.boundaries = vectorMapStyling.boundary;
vectorMapStyling.places = vectorMapStyling.place;
vectorMapStyling.pois = vectorMapStyling.poi;
vectorMapStyling.roads = vectorMapStyling.road;

// config del layer
const vectormapConfig = {
    rendererFactory: L.svg.tile,
    attribution: false,
    vectorTileLayerStyles: vectorMapStyling,
    interactive: true,
    pane: 'vectorGridPane',
    getFeatureId: function (e) {
        return e.properties.id;
    },
    layersOrdering: ordering
};
const vectormapUrl = "http://localhost:3095/tile/{z}/{x}/{y}";
// const vectormapUrl = "https://tiles.fldev.di.unito.it/tile/{z}/{x}/{y}";
// const vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";

const detailsUrl = "http://localhost:3095/areas/";
// const detailsUrl = "https://tiles.fldev.di.unito.it/areas/";
// const detailsUrl = "https://tiles.firstlife.org/areas/";

// definition of the vectorGrid layer
const vGrid = L.vectorGrid.protobuf(vectormapUrl, vectormapConfig);
vGrid.addTo(map);
// console.log('vGrid',vGrid);
let currentFeature = null;

let detailsPromise = null;

vGrid.on('click', e => {
    if(e.originalEvent.defaultPrevented)
        return;

    e.originalEvent.preventDefault();


    let id = e.layer.properties.id,
        properties = e.layer.properties,
        bbox = JSON.parse(properties.bbox);
    console.log('click on ',e, properties.name, id,bbox);

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
    let bounds = [[bbox[1],bbox[0]],[bbox[3],bbox[2]]];
    // console.log('fit to bounds',bounds);
    // Fit the map to the polygon bounds
    map.fitBounds(bounds);
    // get selected feature by id
    getFeature(id).then(
        res => {
            // console.debug('getFeature',res);
            focusLayer.clearLayers();
            // todo set style
            // aggiungo l'area di focus
            setTimeout(() => {focusLayer.addData(res);},500);
            // todo nascondi contenuti non attinenti
            mGrid.setStyle(hideStyle(id));
        },
        err => {
            console.error('getFeature',err);
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

//
function hideStyle(id) {
    return (feature) => {
        console.debug('new style for',feature);
        if(feature.properties.areaid && feature.properties.areaid === id){
            return {};
        } else {
            return {
                weight: 0,
                fillColor: 'gray'
            }
        }
    }
}
// get feature by id
function getFeature(id) {
    // console.log('getFeature', id);
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url = detailsUrl.concat(id);
        console.log('asking to ', url);
        xhr.open("GET", url);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}


// exponential
// var scale = function(x,level){
//
//     if(x > level)
//         return 0;
//     // https://www.desmos.com/calculator/3fisjexbvp
//     // return Math.log(num*10);
//     var a = 0.05,
//     b = 1.33,
//     c = 0;
//     return Math.floor(a*(Math.pow(b,x))+c);
// }


/*
 * Gaussian
 * https://www.desmos.com/calculator/oihvoxtriz
 * a = max radius
 * b = zoom level
 * cLeft & cRight = spread (between 2 - 3)
 * code diverse per lo zoom in e zoom out dalla media
 */
const maxWeight = 2,
    maxRadius = 10,
    cRight = 1.4,
    cLeft = 3,
    minRadius = 1;
const scale = (x, level) => {
    let c = x < level ? cLeft : cRight;
    let k = Math.pow((x - level), 2) * -1;
    let q = 2 * Math.pow(c, 2);
    let z = k / q;
    let radius = Math.floor(maxRadius * Math.exp(z));
    // console.log(radius);
    // senza soglia
    // return Math.max(radius, minRadius);
    // con soglia
    return radius;
};
/*
 * Markers
 */
const geojsonMarkerStyle = (feature) => {
    let type = feature.properties.entity_type;
    let color = colors[type];
    return {
        opacity: 1,
        fill: true,
        fillOpacity: 0.8,
        weight: 0,
        color: color,
        fillColor: color
    };

};

// const markerUrl = 'https://api.fldev.di.unito.it/v5/fl/Things/tilesearch?domainId=1,4,9,10,11,12,13,14,15&limit=99999&tiles={x}:{y}:{z}';
// const markerUrl = 'https://api.firstlife.org/v5/fl/Things/tilesearch?domainId=12&limit=99999&tiles={x}:{y}:{z}';
const markerUrl = 'https://api.firstlife.org/v5/fl/Things/tilesearch?domainId=1,4,7,9,10,11,12,13,14,15&limit=99999&tiles={x}:{y}:{z}';
const markerLayers = {
    'layers': {
        'things': {
            pointToLayer: function (feature, latlng) {
                let currentZoom = map.getZoom();
                // if(feature.area_id)
                // console.log(feature);

                let radius = scale(currentZoom, feature.properties.zoom_level);
                let weight = Math.min(radius, maxWeight);
                let style = Object.assign(
                    {
                        interactive:false
                    },
                    geojsonMarkerStyle(feature),
                    {
                        weight: weight,
                        radius: radius
                    }
                );
                // console.log(style,latlng);
                return L.circleMarker(latlng, style);
            }
        }
    }
};
// definition of the vectorGrid layer
const mGrid = L.geoJsonGridLayer(markerUrl, markerLayers);
mGrid.addTo(map);
console.log('mGrid',mGrid);
mGrid.setStyle = (newStyle = {}) => {
    let layer = mGrid.getLayers()[0];
    // console.log(layer);
    let features = layer[`_layers`];
    let zoom = map.getZoom();
    // console.log('nuovo raggio: ',scale(zoom));
    for (let i in features) {
        let feat = features[i];
        // console.log(features[i].feature.properties.zoom_level);
        let level = feat.feature.properties.zoom_level;
        let radius = scale(zoom, level);
        let weight = Math.min(radius, maxWeight);
        feat.setRadius(radius);
        // creo il nuovo stile
        let style = Object.assign({},geojsonMarkerStyle(feat.feature),{weight: weight});
        // se e' una funzione la risolvo passando la feature
        if(newStyle instanceof Function) {
            style = Object.assign(style, newStyle(feat.feature));
        }else if(newStyle instanceof Object){
            style = Object.assign(style,newStyle);
        }
        feat.setStyle(style);
    }
};

// prima del cambio di zoom
// map.on('zoomstart', (e) => {
//     // elimino il livello di focus
//     focusLayer.clearLayers();
// });
// prima del cambio di zoom
map.on('movestart', (e) => {
    // elimino il livello di focus
    focusLayer.clearLayers();
});
// fine cambio di zoom
map.on('zoomend', (e) => {
    // aggiorno stile marker
    // todo gestione focus nella scelta di stile
    mGrid.setStyle();
});
