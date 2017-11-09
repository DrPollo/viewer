module.exports = (map) => {
    const BBox = require('@turf/bbox');
    const Rx = require('rxjs/Rx');
    const Utils = require('./utils');
    const utils = Utils();
    const moment = require('moment');
    const within = require('@turf/within');
    const tilebelt = require('@mapbox/tilebelt');

    // init of state params
    const initFocus = {
        "id": null,
        "bounds": null,
        "features": []
    };
    const initExplorer = {
        "bounds": null,
        "reset": true
    };
    const initInterface = {
        "lang": "en",
        "contrast": false,
        "interactive": true
    };
    const initView = {
        "c": null,
        "priority": {
            "highlight": [],
            "background": [],
            "exclude": []
        },
        "date":{
            "from" :null,
            "to": null
        }
    };
    // state param storage
    const store = {
        "focus": initFocus,
        "explorer": initExplorer,
        "interface": initInterface,
        "view": initView
    };

    let current = "explorer";

    /* state actions
     * focus > enter focus mode
     * move > change viewport
     * restore > enter explore mode (exit focus mode)
     * lang > change language
     * contrast > change map base layer
     * priority > change highlight, exclude and background lists
     * date > chage date_from and date_to (interval) in entries query
     * observe > returns the channel
     * current > current state
    */
    const status = {
        "focus": null,
        "move": null,
        "restore": null,
        "lang": null,
        "contrast": null,
        "priority": null,
        "interactive": null,
        "date": null,
        "observe": null,
        "current": () => current
    };

    // focus handler
    // init of focus handler requires the observer
    function focusHandler(observer) {
        // console.debug('focusHandler',observer);
        // gestiore del focus
        return (entry) => {
            console.debug('focusHandler',entry);
            //fallback focus in case no entry is defined
            if(!entry.feature && !entry.id){
                virtualFocus(entry,observer);
            }else{
                // if entry is defined
                switch(current){
                    case "focus":
                        // check if focus is inside the current focus
                        if(store["focus"].features.lenght > 0 && JSON.stringify(store["focus"].features).find(entry.id)){
                            focus(entry, observer);
                        } else {
                            //nothing to do
                        }
                        break;
                    default:
                        focus(entry, observer);
                }
            }
        };
    }
    // extract relevant features from map
    function extractContent(focusGeometry){
        // console.debug('extractContent?',typeof map._layers === 'undefined',  !map._layers);
        if(typeof map._layers === 'undefined' || !map._layers ){return [];}
        // console.debug('extractContent',map, focusGeometry);
        let focusFeatures = Object.keys(map._layers).reduce((res,key) => {
            let feature = map._layers[key].options.feature;
            // console.debug("check feature",feature);
            if(!feature){return res;}
            if(feature && feature.properties && feature.properties.area_id && feature.properties.area_id === features[0].id){
                return res.concat(feature);
            }
            try{
                // console.debug(feature, focusGeometry);
                let isInside = (within({type:"featureCollection", features:[feature]}, {type:"featureCollection", features:[focusGeometry]}).features.length > 0);
                // console.debug('is inside?',isInside);
                if(isInside) {
                    return res.concat(feature);
                }
            }catch (e){
                console.error('@turf/within',e);
            }
            return res;
        },[]);
        // console.debug("extractContent",focusFeatures);
        return focusFeatures;
    }
    // fallback: focus on a tile
    function virtualFocus(entry,observer){
        // console.debug('virtual focus on ',entry, observer);
        if(!entry && !(entry.tileId || (entry.lat && entry.lng && entry.zoom ) )){return;}

        let tile = null;
        let tileId = null;
        // tileId
        if(entry.tileId){
            tileId = entry.tileId;
            let tmp = entry.tileId.split(":");
            tile = [parseFloat(tmp[0]),parseFloat(tmp[1]),parseInt(tmp[2])];
            console.debug('focus on tileId, tile',tile);
        }else {
            // from latlng and zoom to tile
            tile = tilebelt.pointToTile(parseFloat(entry.lng), parseFloat(entry.lat), parseInt(entry.zoom));
            // tile = [x,y,z], tileId = x:y:z
            if (!tile) { return; }
            tileId = tile[0] + ":" + tile[1] + ":" + tile[2];
            console.debug('virtual focus on tile', tileId);
            // tile to bbox
            if (!tileId) {
                return;
            }
        }
        if (!tile) { return; }
        if (!tileId) { return; }

        let bbox = tilebelt.tileToBBOX(tile);
        console.debug('virtual focus on bbox',bbox);
        // bbox to GeoJSON feature poligon
        if(!bbox){return;}
        let polygon = tilebelt.tileToGeoJSON(tile);
        // let polygon = bboxPolygon(bbox);
        console.debug('virtual focus on polygon',polygon);

        // update polygon with extra info
        if(!polygon){return;}
        polygon.id = tileId;

        polygon.properties = {
            id : tileId,
            type : 'tile'
        };

        // update status
        store["focus"].id = tileId;
        store["focus"].bounds = bbox;
        store["focus"].features = [polygon];
        // extractContent from tile
        store["focus"]["content"] = extractContent(polygon);

        current = "focus";

        observer.next(store["focus"]);

    }
    // focus handler
    function focus(entry, observer) {
        console.debug('focus on ',entry);
        current = "focus";
        // set id
        store["focus"].id = entry.id;

        // management of tileId = x:y:z
        if(entry.id && entry.id.split(":").length === 3){
            return virtualFocus({tileId : entry.id},observer);
        }


        // set bounds
        let bounds = null;
        // if (entry.bbox) {
        //     let bbox = JSON.parse(entry.bbox);
        //     bounds = L.latLngBounds(L.latLng(bbox[1], bbox[0]), L.latLng(bbox[3], bbox[2]));
        //     store["focus"].bounds = bounds;
        // }

        // recupero il contenuto
        utils.getFeature(entry.id).then(
            res => {
                // console.debug('getFeature',id);
                // aggiungo il contenuto dello stato
                if(Array.isArray(res)) {
                    store["focus"].features = res;
                } else if(res.type === "FeatureCollection"){
                    store["focus"].features = res.features;
                } else if(res.type === "Feature") {
                    store["focus"].features = [res];
                } else {
                    store["focus"].features = [];
                }
                let bb = BBox(store["focus"].features[0]);
                store["focus"].bounds = [bb[1],bb[0],bb[3],bb[4]];
                // store["focus"].bounds = L.latLngBounds(L.latLng(bb[1], bb[0]), L.latLng(bb[3], bb[2]));
                store["focus"]["content"] = extractContent(res);
                // propago il nuovo stato
                console.debug("stato focus",store["focus"]);
                observer.next(store["focus"]);
            },
            err => {
                console.error('getFeature', err);
            }
        );
    }
    // time validity check
    function checkTime(date){
        let newDate = Object.assign(date);
        // console.debug('checkTime',date);
        // case valid_from and valid_to defined
        // check intersection date.from after date.to
        if(date.from && date.to && Date.parse(date.from) > Date.parse(date.to) ){
            // forcing date.from = date.to
            newDate.from = date.to;
        }
        // check valid_from not defined valid_to defined
        if(!date.from && date.to){
            console.log('adding date_from')
            // forcing date.from = date.to
            newDate.from = date.to;
        }
        // check valid_to not defined and valid_from defined
        if(!date.to && date.from){
            // forcing date.to = date.from
            newDate.to = date.from;
        }
        // console.debug('new data',newDate);
        return newDate;
    }

    // observable da restituire
    status.observe = Rx.Observable.create(function (observer) {
        console.debug('check observer',Object.assign({},observer) );
        // costruttori delle azioni di cambio di stato
        status.lang = (lang) => {
            if(store["interface"]["lang"] === lang){
                return;
            }
            switch (lang) {
                case "it":
                    store["interface"]["lang"] = "it";
                    break;
                default:
                    store["interface"]["lang"] = "en";
            }
            observer.next(store["interface"]);
        };
        status.contrast = (contrast) => {
            if(store["interface"]["contrast"] === contrast){
                return;
            }
            store["interface"]["contrast"] = contrast;
            observer.next(store["interface"]);
        };
        status.priority = (priority) => {
            // console.debug('check setting of priority',priority);
            // todo management of flags
            // all, none, true, false
            store["view"]["priority"] = priority;
            observer.next(store["view"]);
        };
        status.date = (date) => {
            // check time validity and fix
            let newDate = checkTime(date);
            store["view"]["date"]["from"] = newDate.from;
            store["view"]["date"]["to"] = newDate.to;
            observer.next(store["view"]["date"]);
        };
        status.interactive = (val) => {
            // check behaviour of focus mode
            // console.debug('check interactive',val.interactive);
            store["interface"]["interactive"] = (val.interactive === 'false') ? false : true;
            observer.next(store["interface"]);
        };
        status.focus = focusHandler(observer);
        status.move = (params) => {
            let bounds = params.bounds;
            // update current map center
            store["view"]["c"] = params.center.lat+":"+params.center.lng+":"+params.zoom;
            store["view"]["bounds"] = ("").concat(bounds.getNorthEast().lng,",",bounds.getNorthEast().lat,",",bounds.getSouthWest().lng,",",bounds.getSouthWest().lat);
            observer.next(store["view"]);


            // console.log('saving? ',current);
            switch (current) {
                case "focus":
                    break;
                default:
                    // update current bounds of explorer state
                    // console.debug('saving bounds',bounds);
                    store["explorer"].bounds = bounds;
            }
        };
        status.restore = () => {
            console.debug('to restore?', current !== "explorer");
            if(current === "explorer")
                return;

            current = "explorer";
            observer.next(store["explorer"]);
        };
    }).share(); // observable hot
    // init objervable
    status.observe.subscribe();
    // get current focus
    status.getFocus = () => {
        if(current === "focus")
            return store["focus"];
        else return null;
    };
    // console.log('status',status);
    return status;
};