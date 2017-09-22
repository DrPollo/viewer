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
var focus = null;
var date = {
    from:null,
    to:null
};
var priority = {
    highlight: [],
    background: false,
    exclude: false
};

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

var currentParams = {};

if(params){
// override location from get params
//     lat = params.get('lat') ? params.get('lat') : lat;
//     lon = params.get('lon') ? params.get('lon') : lon;
//     zoom = params.get('zoom') ? params.get('zoom') : zoom;
//     currentParams.c = lat+':'+lon+':'+zoom;
    if(params.get('c')){
        currentParams.c = params.get('c');
        let cArray = currentParams.c.split(':');
        lat = cArray[0];
        lon = cArray[1];
        zoom = cArray[2];
    }else{
        currentParams.c = lat+':'+lon+':'+zoom;
    }
    contrast = params.get('contrast') === 'true';
    currentParams.contrast = contrast;
    lang = params.get('lang') ? params.get('lang') : lang;
    currentParams.lang = lang;
    focus = params.get('focus') ? params.get('focus') : false;
    currentParams.focus = focus;

    // if domain does not exist trows a console error
    if(params.get('domain')){
        // recover domain param (used for security reasons)
        domain = params.get('domain');
        currentParams.domain = domain;
    }else{
        console.error('missing mandatory param: "domain"');
    }
    // handling date_from param
    if(params.get('date_from') && Date.parse(params.get('date_from'))){
        date.from = params.get('date_from');
        currentParams.date_from = date.to;
    }
    // handling date_to param
    if(params.get('date_to') && Date.parse(params.get('date_to'))){
        date.to = params.get('date_to');
        currentParams.date_to = date.to;
    }
    // fix time validity
    checkTime();
    // handling priority params
    if(params.get('highlight')){
        priority.highlight = params.get('highlight').split(",") || [];
        currentParams.highlight = priority.highlight;
    }
    if(params.get('background')){
        priority.background = params.get('background').split(",") || false;
        currentParams.background = priority.background;
    }
    if(params.get('exclude')){
        priority.exclude = params.get('exclude').split(",") || false;
        currentParams.exclude = priority.exclude;
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
var changePositionEvent = "areaViewer.position";

// output events
var resetViewEvent = "areaViewer.resetView";
var setViewEvent = "areaViewer.setView";
var setBoundsEvent = "areaViewer.setBounds";
var setContrastEvent = "areaViewer.setContrast";
var setLanguageEvent = "areaViewer.setLanguage";
var setDateEvent = "areaViewer.setDate";
var setPriorityEvent = "areaViewer.setPriority";
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
    if(focus && focus !== 'null') {
        setTimeout(function(){
            broadcastEvent(focusToEvent,{id:focus});
        },1500);
    }
    // set date
    if(date.form !== 'null' && date.to !== 'null') {
        broadcastEvent(setDateEvent,{date_from:date.from,date_to:date.to});
    }
    // set priority: {highlight:[], background:[], exclude:[]}
    if(priority.highlight.length > 0 || priority.highlight.length > 0 || priority.highlight.length > 0){
        setTimeout(function(){
            broadcastEvent(setPriorityEvent,{priority:priority});
        },1500);
    }
}

// init output message listners
function initListners() {
    // console.debug("init output listners")
    // enter in focus mode
    document.addEventListener(focusOnEvent,function (e) {
        console.debug(focusOnEvent,e.detail);
        //change search param > add focus=id
        if(!e.detail.id){return;}
        updateQueryParams('focus',e.detail.id);
        emitEvent(focusOnEvent,e.detail);
    },true);
    // back to explore mode
    document.addEventListener(exploreEvent,function (e) {
        console.debug(exploreEvent,e.detail);
        //change search param > remove focus=id
        updateQueryParams('focus',null);
        emitEvent(exploreEvent,e.detail);
    },true);
    // update position
    document.addEventListener(changePositionEvent,function (e) {
        console.debug(changePositionEvent,e.detail);
        // update c param
        if(!e.detail.c){return;}
        updateQueryParams('c',e.detail.c);
        emitEvent(changePositionEvent,e.detail);
    });
}



/*
 * dispatch events
 * broadcast > to areaViewer
 * emit > to top
 */

function broadcastEvent(eventName, params) {
    var detail = params || {};
    var event = new CustomEvent(eventName, {detail: detail });
    // console.debug('broadcasting',eventName,event.detail);
    document.dispatchEvent(event);
}
function emitEvent(eventName, params) {
    if(!domain){
        console.error("domain not defined: cannot emit message",eventName);
        return;
    }
    // console.debug('emitting',params, 'to',domain);
    top.postMessage(Object.assign(params || {},{"event":eventName}), domain);
}


// update location.search params
function updateQueryParams(key, value) {
    if (!currentParams) {return;}
    if(!location.search){ return;}
    if(!window.history){ return;}

    // console.debug('updating location.search params', key,value);
    if(value !== null && value !== "null"){
        // aggiungo chiave e valore
        currentParams[key] = value;
    }else if(currentParams[key]){
        // rimuovo chiave
        delete currentParams[key];
    }

    // console.debug('check new params', currentParams);
    // history.replaceState(stateParams,'AreaViewer');
    var q = Object.keys(currentParams).reduce(function (res, key) {
        // null value
        if(currentParams[key] === null || currentParams[key] === "null") { return res;}

        var val = '';
        if(res !== '?'){ val = val.concat('&'); }
        val = val.concat(key,'=',currentParams[key]);
        return res.concat(val);
    },'?');
    // console.debug('check new params',q);
    // console.debug('new location.search value? ',(location.search !== q),' ',location.search,' !== ',q);
    if(location.search !== q){
        // location.search = q;
        window.history.replaceState(null, null, q);
    }
}



function checkTime(){
    console.log('checkTime',date);
    // case valid_from and valid_to defined
    // check intersection date.from after date.to
    if(date.from && date.to && Date.parse(date.from) > Date.parse(date.to) ){
        // forcing date.from = date.to
        date.from = date.to;
        currentParams.date_from = date.from;
        updateQueryParams('date_from',date.from);
    }
    // check valid_from not defined valid_to defined
    if(!date.from && date.to){
        console.log('adding date_from')
        // forcing date.from = date.to
        date.from = date.to;
        currentParams.date_from = date.from;
        updateQueryParams('date_from',date.from);
    }
    // check valid_to not defined and valid_from defined
    if(!date.to && date.from){
        // forcing date.to = date.from
        date.to = date.from;
        currentParams.date_to = date.to;
        updateQueryParams('date_to',date.to);
    }
}