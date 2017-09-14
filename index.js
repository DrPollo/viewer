'use strict';




// defaults
var zoom = 13;
var locationZoom = 18;
var lat = 45.070312;
var lon = 7.686856;
var baseColor = '#c32630';
var mapOptions = {
    center: [lat,lon],
    zoom: zoom
};
var zoomControlPosition = 'bottomright';
// var baselayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
// var contrastlayer = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
var baselayer = 'https://api.mapbox.com/styles/v1/drp0ll0/cj0tausco00tb2rt87i5c8pi0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';
var contrastlayer = 'https://api.mapbox.com/styles/v1/drp0ll0/cj167l5m800452rqsb9y2ijuq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ';

// marker icon
var htmlIcon = '<div class="pin"></div><div class="pulse"></div>';
var pinIcon = L.divIcon({className: 'pointer',html:htmlIcon, iconSize:[30,30],iconAnchor:[15,15]});

// vectorGrid
// var vectormapUrl = "//localhost:3095/tile/{z}/{x}/{y}";
// var vectormapUrl = "https://tiles.fldev.di.unito.it/tile/{z}/{x}/{y}";
var vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";

// defaults
var contrast = false;
var domain = null;
var mode = false;
var params = null;

var label = document.getElementById('label');


// language
var defaultLang = 0;
var languages = ['en','it'];
// tooltips
var tooltipLabel = {
    it : 'Click per localizzare',
    en : 'Click to geolocate'
};
var tooltipCancel = {
    it : 'Click per cancellare la selezione',
    en : 'Click to reset location'
};
var userLang = navigator.language || navigator.userLanguage;
var lang = languages[defaultLang];
for(var i = 0; i < languages.length; i++){
    var l = languages[i];
    if(userLang.search(l) > -1){
        lang = l;
    }
}

// recover search params

// check for IE
var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE ");

// If Internet Explorer, return version number
if (msie > 0) {
    params = escape(location.search);
}else{
    params = (new URL(location)).searchParams;
}



if(params){
// override location from get params
    lat = params.get('lat') ? params.get('lat') : lat;
    lon = params.get('lon') ? params.get('lon') : lon;
    zoom = params.get('zoom') ? params.get('zoom') : zoom;
    contrast = params.get('contrast') === 'true' ;
    lang = params.get('lang') ? params.get('lang') : lang;
    // recover domain param (used for security reasons)
    domain = params.get('domain');
    // if domain does not exist trows a console error
    if(!domain){
        console.error('missing mandatory param: "domain"');
    }
}else{
    console.error('cannot retrieve search params from URL location');
}



// dispatch events
function broadcastEvent(eventName, params) {
    var event = new CustomEvent(eventName, params);
    window.dispatchEvent(event);
}
function emitEvent(params) {
    if(!domain){
        return;
    }
    top.postMessage(params, domain);
}

broadcastEvent('areaViewer.resetView',{detail:{}});
