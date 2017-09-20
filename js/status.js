module.exports = (params = {}) => {
    const BBox = require('@turf/bbox');
    const Rx = require('rxjs/Rx');
    const Utils = require('./utils');
    const utils = Utils();

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
        "contrast": false
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

    // state actions
    const status = {
        "focus": null,
        "move": null,
        "restore": null,
        "lang": null,
        "contrast": null,
        "priority": null,
        "date": null,
        "observe": null
    };

    // focus handler
    // init of focus handler requires the observer
    function focusHandler(observer) {
        // gestiore del focus
        return (entry) => {
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
        };
    }

    function focus(entry, observer) {
        console.debug('focus on ',entry);
        current = "focus";
        // set id
        store["focus"].id = entry.id;
        // set bounds
        let bounds = null;
        if (entry.bbox) {
            let bbox = JSON.parse(entry.bbox);
            bounds = L.latLngBounds(L.latLng(bbox[1], bbox[0]), L.latLng(bbox[3], bbox[2]));
            store["focus"].bounds = bounds;
        }
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
                store["focus"].bounds = L.latLngBounds(L.latLng(bb[1], bb[0]), L.latLng(bb[3], bb[2]));
                // propago il nuovo stato
                // console.debug("stato focus",store["focus"]);
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
        status.focus = focusHandler(observer);
        status.move = (params) => {

            // update current map center
            store["view"]["c"] = params.center.lat+":"+params.center.lng+":"+params.zoom;
            observer.next(store["view"]);

            let bounds = params.bounds;
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





