/**
 * Created by drpollo on 20/07/2017.
 */
const Rx = require('rxjs/Rx');


// inizializzazione status
const store = {
    "focus":{
        "id":null
    },
    "explore":{
        "bounds":null
    }
};

let current = "explorer";


module.exports = (params = {}) => {
    // azioni dello stato
    const status = {
        "focus":null,
        "move":null,
        "restore":null,
        "observe": null
    };
    // observable da restituire
    status.observe = Rx.Observable.create(function (observer) {
        status.focus = (id) => {
            current = "focus";
            store["focus"].id = id;
            observer.next(store["focus"]);
        };
        status.move = (bounds) => {
            current = "explorer";
            store["explorer"].bounds = bounds;
            observer.next(store["explorer"]);
        };
        status.restore = () => {
            current = "explorer";
            observer.next(store["explorer"]);
        };
    });
    return status;
};