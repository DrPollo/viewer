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
console.log('vGrid',vGrid);
let currentFeature = null;

var detailsPromise = null;

vGrid.on('click', e => {
    let id = e.layer.properties.id,
        properties = e.layer.properties;
    console.log('click on ',e, properties.name, id);

    // get feature details
    detailsPromise = getFeature(id);
    detailsPromise.then(
        response => {
            console.debug('feature details',response);
        },
        error => {
            console.error(error);
        }
    );

    // todo multiple selection

    // reset prev feature
    if (currentFeature !== id)
        vGrid.resetFeatureStyle(currentFeature);

    vGrid.setFeatureStyle(id, highlightStyle);
    currentFeature = id;

    // todo focus on feature (bbox)

    // todo clean markers not in the area
});

function getFeature(id) {
    console.log('getFeature',id);
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        console.log('asking to ',detailsUrl.concat(id));
        xhr.open("GET", detailsUrl.concat(id));
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
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
    //
    return Math.max(radius, minRadius);
};
/*
 * Markers
 */
const geojsonMarkerOptions = {
    opacity: 1,
    fill: true,
    fillOpacity: 0.8
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
                let type = feature.properties.entity_type;
                let color = colors[type];
                let radius = scale(currentZoom, feature.properties.zoom_level);
                let weight = Math.min(radius, maxWeight);
                let style = Object.assign(
                    {},
                    geojsonMarkerOptions,
                    {
                        radius: radius,
                        weight: weight,
                        color: color,
                        fillColor: color
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
map.addLayer(mGrid);

map.on('zoomend', (e) => {
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
        feat.setStyle({weight: weight});
    }
});