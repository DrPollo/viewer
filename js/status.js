module.exports = (params = {}) => {

    const Rx = require('rxjs/Rx');
    const Utils = require('./utils');
    const utils = Utils();
// inizializzazione status
    const initFocus = {
        "id": null,
        "bounds": null,
        "features": []
    };
    const initExplorer = {
        "bounds": null,
        "reset": true
    };
    const store = {
        "focus": initFocus,
        "explorer": initExplorer
    };

    let current = "explorer";

    // azioni dello stato
    const status = {
        "focus": null,
        "move": null,
        "restore": null,
        "observe": null
    };

    // gestorione del focus
    // inizializzazione funzione con l'observer
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
        // console.debug('focus on ',entry);
        current = "focus";
        // set id
        store["focus"].id = entry.id;
        // set bounds
        let bounds = null;
        if (entry.bbox) {
            let bbox = JSON.parse(entry.bbox);
            bounds = L.latLngBounds(L.latLng(bbox[1], bbox[0]), L.latLng(bbox[3], bbox[2]));
        }
        store["focus"].bounds = bounds;
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
                // propago il nuovo stato
                // console.debug("stato focus",store["focus"]);
                observer.next(store["focus"]);
            },
            err => {
                console.error('getFeature', err);
            }
        );
    }
    // observable da restituire
    status.observe = Rx.Observable.create(function (observer) {
        // costruttori delle azioni di cambio di stato
        status.focus = focusHandler(observer);
        status.move = (bounds) => {
            // console.log('saving? ',current);
            switch (current) {
                case "focus":
                    break;
                default:
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





