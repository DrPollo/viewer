//'use strict';

// import {AreaViewer} from './build/bundle.js'
// setTimeout(function(){new AreaViewer();},5000);
// console.log(this);



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


// vectorGrid
// var vectormapUrl = "//localhost:3095/tile/{z}/{x}/{y}";
// var vectormapUrl = "https://tiles.fldev.di.unito.it/tile/{z}/{x}/{y}";
var vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";

// defaults
var contrast = false;
var domain = null;
var mode = false;
var params = null;
var focus = false;

var label = document.getElementById('label');


// language
var defaultLang = 0;
var languages = ['en','it'];
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
    focus = params.get('focus') ? params.get('focus') : false;
    // recover domain param (used for security reasons)
    domain = params.get('domain');
    // if domain does not exist trows a console error
    if(!domain){
        console.error('missing mandatory param: "domain"');
    }
}else{
    console.error('cannot retrieve search params from URL location');
}




/*
 * Message names
 */
// input events
var focusOnEvent = "areaViewer.focusOn";
var exploreEvent = "areaViewer.explore";

// output events
var resetViewEvent = "areaViewer.resetView";
var setViewEvent = "areaViewer.setView";
var setBoundsEvent = "areaViewer.setBounds";
var setContrastEvent = "areaViewer.setContrast";
var setLanguageEvent = "areaViewer.setLanguage";
var focusToEvent = "areaViewer.focusTo";
var toExploreEvent = "areaViewer.toExplore";


/*
 * Message broker
 * Output messages: receives messages from AreaViewer and emit them to top
 * Input messages: receives messages from top and broadcast them to AreaViewer
 */
// Output messages
// todo send focus message
// todo send reset message
// todo send set source message
// top.postMessage({src:'AreaViewer',reset:true},domain);
// emitEvent('areaViewer.resetView',{detail:{}});


// input messages
// todo set contrast
// todo set viewport
// todo set focus
// todo set lang
// todo set source
window.addEventListener( "message",
    function (e) {
        if (e.defaultPrevented)
            return
        e.preventDefault();

        // if (e.origin !== iframeDomain) {
        //     return;
        // }
        if(e.data.type == 'setContrast'){
            console.log('got setContrast',e);
        }
    });




/*
 * Init AreaViewer status
 */
function initAreaViewer(){
    console.debug("init AreaViewer");
    initListners();
    initStatus ();

    // test listners
    // setTimeout(function(){broadcastEvent(focusToEvent,{id:"dc1346b2-8d8f-11e7-94d0-6558e55bfac7"});},2000);
    // setTimeout(function(){broadcastEvent(setContrastEvent,{contrast:true});},2000);
    // setTimeout(function(){broadcastEvent(setLanguageEvent,{lang:"it"});},2000);
}

// init status
function initStatus (){
    console.debug('init status');
    // set default lang
    broadcastEvent(setLanguageEvent,{lang: lang});
    // set default contrast
    broadcastEvent(setContrastEvent,{contrast: contrast});
    // set default viewport
    broadcastEvent(setViewEvent, {lat: lat, lng:lon, zoom:zoom});
    // set focus
    if(focus) {
        setTimeout(function(){
            broadcastEvent(focusToEvent,{id:focus});
        },1500);
    }
    // todo set source
    // todo set priority: {highlight:'', exluded:[]}
}

// init output message listners
function initListners() {
    console.debug("init output listners");
    document.addEventListener(focusOnEvent,function (e) {
        console.debug(focusOnEvent,e.detail);
        emitEvent(focusOnEvent,e.detail);
    },true);
    document.addEventListener(exploreEvent,function (e) {
        console.debug(exploreEvent,e.detail);
        emitEvent(exploreEvent,e.detail);
    },true);
}



/*
 * dispatch events
 * broadcast > to areaViewer
 * emit > to top
 */

function broadcastEvent(eventName, params) {
    var detail = params || {};
    var event = new CustomEvent(eventName, {detail: detail });
    console.debug('broadcasting',eventName,event.detail);
    document.dispatchEvent(event);
}
function emitEvent(eventName, params) {
    if(!domain){
        console.error("domain not defined: cannot emit message",eventName);
        return;
    }
    console.debug('emitting',params, 'to',domain);
    top.postMessage(Object.assign(params || {},{"event":eventName}), domain);
}