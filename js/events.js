/**
 * Created by drpollo on 13/09/2017.
 */
module.exports = (status,map) => {

    /* input events: changing areaViewer state
     * 1) resetViewEvent: void
     * 2) setViewEvent: {lat, lng, zoom, bbox}
     * 3) focusToEvent: {id}
     * 4) toExploreEvent: void
     */

    const locationZoom = 18;
    // viewport events
    const resetViewEvent = "areaViewer.resetView";
    const setViewEvent = "areaViewer.setView";
    const setBoundsEvent = "areaViewer.setBounds";
    // state events
    const focusToEvent = "areaViewer.focusTo";
    const toExploreEvent = "areaViewer.toExplore";


    /* output events: notify areaViewer change of state
     * 1) focusToEvent: {id}
     * 2) toExploreEvent: void
     */
    // state events
    const focusOnEvent = "areaViewer.focusOn";
    const exploreEvent = "areaViewer.explore";



    // catch event listners
    window.addEventListener(setBoundsEvent,function (e) {
        console.log(setBoundsEvent,e.detail);
        // set bounds to
        if(!e.detail.bounds){ return; }
        status.restore();
        status.move(e.bounds);
    },false);
    // catch event listners
    window.addEventListener(setViewEvent,function (e) {
        console.log(setViewEvent,e.detail);
        if(!e.detail.center){ return; }
        status.restore();
        map.setView(e.detail.center,e.detail.zoom || locationZoom);
    },false);
    window.addEventListener(resetViewEvent,function (e) {
        console.log(resetViewEvent,e.detail);
        // status.move();
    },false);
    window.addEventListener(focusToEvent,function (e) {
        console.log(focusToEvent,e.detail);
        // check area id
        if(!e.detail.id){  return; }
        // focus on id
        status.focus(e.detail.id);
    },false);
    window.addEventListener(toExploreEvent,function (e) {
        console.log(toExploreEvent,e.detail);
        // restore the status of explorer
        status.restore();
    },false);

};