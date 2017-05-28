/**
 * Created by drpollo on 21/05/2017.
 */
require('leaflet');
require('leaflet.vectorgrid');
require('./libs/leaflet-geojson-gridlayer');
require('gaussian');

// defaults
var initZoom = 13;
var initLat = 45.070312;
var initLon = 7.686856;
var baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
var contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';


var orange = "#ff7800";

var gaussian = require('gaussian');
//
// L.mapbox.accessToken = 'pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
// var map = L.mapbox.map('map');
// var vector = L.mapbox.gridLayer('https://tiles.fldev.di.unito.it/{z}/{x}/{y}').addTo(map);
//



var featureStyle = {
    fill: true,
    weight: 1,
    color: orange,
    opacity: 1,
    fillOpacity:0.25,
    fillColor: 'transparent'
};

var vectorMapStyling = {
    interactive:featureStyle
};
var highlightStyle = Object.assign({},featureStyle);
highlightStyle.fill = true;
highlightStyle.fillColor = orange;
highlightStyle.fillOpacity = 0.75;


var contrast = false;

// definition of the map
// map setup
var layers = {
    base: L.tileLayer(baselayer, {
        maxZoom: 20,
        attribution: '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>'
    }),
    contrast : L.tileLayer(contrastlayer, {
        maxZoom: 20,
        attribution: '<a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="http://mapbox.com" target="_blank">Mapbox</a>'
    })
};


var map = L.map('map').setView([initLat, initLon], initZoom );
layers[contrast ? 'contrast': 'base'].addTo(map);




var colors = {
    'FL_GROUPS':'#3F7F91',
    'FL_EVENTS':'#88BA5C',
    'FL_NEWS':'#823256',
    'FL_ARTICLES':'#FFB310',
    'FL_PLACES':'#FE4336'};



/*
 * VectorGrid
 */


// reset styles
var resetStyle = {
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
var vectormapConfig = {
    rendererFactory: L.svg.tile,
    attribution: false,
    vectorTileLayerStyles: vectorMapStyling,
    interactive: true,
    getFeatureId:function (e) {
        return e.properties.id;
    }
};
var vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";
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
 * c = spread (between 2 - 3)
 */
var maxWeight = 2;
var maxRadius = 10,
    c = 1.4;
var scale = function(x,level){
    var k = Math.pow((x - level),2) * -1;
    var q = 2 * Math.pow(c,2);
    var z = k/q;
    return Math.floor(maxRadius * Math.exp(z));
}
/*
 * Markers
 */
var geojsonMarkerOptions = {
    opacity: 1,
    fillOpacity: 0.8
};

var markerUrl = 'https://api.fldev.di.unito.it/v5/fl/Things/tilesearch?domainId=1,9,10,11,12,13,14,15&limit=99999&tiles={x}:{y}:{z}';
var layers = {
    'layers':{
        'things':{
            pointToLayer:function (feature,latlng) {
                var type = feature.properties.entity_type;
                var color = colors[type];
                var radius = scale(initZoom,feature.properties.zoom_level);
                var weight = Math.min(radius,maxWeight);
                var style = Object.assign(
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
var mGrid = L.geoJsonGridLayer(markerUrl,layers);
map.addLayer(mGrid);

map.on('zoomend',function (e) {
    var layer = mGrid.getLayers()[0];
    // console.log(layer);
    var features = layer._layers;
    var zoom = map.getZoom();
    // console.log('nuovo raggio: ',scale(zoom));
    for(var i in features){
        // console.log(features[i].feature.properties.zoom_level);
        var level = features[i].feature.properties.zoom_level;
        var radius = scale(zoom,level);
        features[i].setRadius(radius);
        features[i].setStyle({weight:Math.min(radius,maxWeight)});
    }
});

/*
 * Logica
 */