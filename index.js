/**
 * Created by drpollo on 21/05/2017.
 */
require('leaflet');
require('leaflet.vectorgrid');
require('./libs/leaflet-geojson-gridlayer');

// defaults
const initZoom = 13;
const initLat = 45.070312;
const initLon = 7.686856;
const baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
const contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';


const orange = "#ff7800";


// L.mapbox.accessToken = 'pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
// var map = L.mapbox.map('map');
// var vector = L.mapbox.gridLayer('https://tiles.fldev.di.unito.it/{z}/{x}/{y}').addTo(map);
//



const featureStyle = {
    fill: true,
    weight: 1,
    color: orange,
    opacity: 1,
    fillOpacity:0.25,
    fillColor: 'transparent'
};

const vectorMapStyling = {
    interactive:featureStyle
};
const highlightStyle = Object.assign({},featureStyle);
highlightStyle.fill = true;
highlightStyle.fillColor = orange;
highlightStyle.fillOpacity = 0.75;


const contrast = false;

// definition of the map
// map setup
const layers = {
    base: L.tileLayer(baselayer, {
        maxZoom: 20,
        attribution: '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>'
    }),
    contrast : L.tileLayer(contrastlayer, {
        maxZoom: 20,
        attribution: '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>'
    })
};


const map = L.map('map').setView([initLat, initLon], initZoom );
layers[contrast ? 'contrast': 'base'].addTo(map);




const colors = {
    'FL_GROUPS':'#3F7F91',
    'FL_EVENTS':'#88BA5C',
    'FL_NEWS':'#823256',
    'FL_ARTICLES':'#FFB310',
    'FL_PLACES':'#FE4336'};



/*
 * VectorGrid
 */


// reset styles
const resetStyle = {
    color: 'transparent',
    weight:0,
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
vectorMapStyling.buildings  = vectorMapStyling.building;
vectorMapStyling.boundaries = vectorMapStyling.boundary;
vectorMapStyling.places     = vectorMapStyling.place;
vectorMapStyling.pois       = vectorMapStyling.poi;
vectorMapStyling.roads      = vectorMapStyling.road;

// config del layer
const vectormapConfig = {
    rendererFactory: L.svg.tile,
    attribution: false,
    vectorTileLayerStyles: vectorMapStyling,
    interactive: true,
    getFeatureId:function (e) {
        return e.properties.id;
    }
};
const vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";
// definition of the vectorGrid layer
// var vGrid = L.vectorGrid.protobuf(vectormapUrl, vectormapConfig).addTo(map);


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
 * a = max radius
 * b = zoom level
 * cLeft & cRight = spread (between 2 - 3)
 * code diverse per lo zoom in e zoom out dalla media
 */
const maxWeight = 2,
    maxRadius = 10,
    cRight = 1.4,
    cLeft = 3;
const scale = (x,level) => {
    let c = x < level ? cLeft : cRight;
    let k = Math.pow((x - level),2) * -1;
    let q = 2 * Math.pow(c,2);
    let z = k/q;
    return Math.floor(maxRadius * Math.exp(z));
}
/*
 * Markers
 */
const geojsonMarkerOptions = {
    opacity: 1,
    fillOpacity: 0.8
};

const markerUrl = 'https://api.fldev.di.unito.it/v5/fl/Things/tilesearch?domainId=1,9,10,11,12,13,14,15&limit=99999&tiles={x}:{y}:{z}';
const markerLayers = {
    'layers':{
        'things':{
            pointToLayer:function (feature,latlng) {
                // console.log(feature);
                let type = feature.properties.entity_type;
                let color = colors[type];
                let radius = scale(initZoom,feature.properties.zoom_level);
                let weight = Math.min(radius,maxWeight);
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
                return L.circleMarker(latlng,style);
            }
        }
    }
};
// definition of the vectorGrid layer
const mGrid = L.geoJsonGridLayer(markerUrl,markerLayers);
map.addLayer(mGrid);

map.on('zoomend', (e) => {
    let layer = mGrid.getLayers()[0];
    // console.log(layer);
    let features = layer[`_layers`];
    let zoom = map.getZoom();
    // console.log('nuovo raggio: ',scale(zoom));
    for(let i in features){
        let feat = features[i];
        // console.log(features[i].feature.properties.zoom_level);
        let level = feat.feature.properties.zoom_level;
        let radius = scale(zoom,level);
        let weight = Math.min(radius,maxWeight);
        feat.setRadius(radius);
        feat.setStyle({weight:weight});
    }
});

/*
 * Logica
 */