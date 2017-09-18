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
    const setContrastEvent = "areaViewer.setContrast";
    const setLanguageEvent = "areaViewer.setLanguage";
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
    document.addEventListener(setBoundsEvent,function (e) {
        console.log(setBoundsEvent,e.detail);
        // set bounds to
        if(!e.detail.bounds){ return; }
        status.restore();
        status.move(e.bounds);
    },false);

    // catch event listners
    document.addEventListener(setViewEvent,function (e) {
        console.log(setViewEvent,e.detail);
        if(!e.detail.center){ return; }
        status.restore();
        map.setView(e.detail.center,e.detail.zoom || locationZoom);
    },false);

    document.addEventListener(resetViewEvent,function (e) {
        console.log(resetViewEvent,e.detail);
        // status.move();
    },false);

    document.addEventListener(setContrastEvent,function (e) {
        console.log(setContrastEvent,e.detail);
        // todo set current map theme
    },false);
    document.addEventListener(setLanguageEvent,function (e) {
        console.log(setLanguageEvent,e.detail);
        // todo set current language
    },false);


    document.addEventListener(focusToEvent,function (e) {
        console.log(focusToEvent,e.detail);
        // check area id
        if(!e.detail.id){  return; }
        // focus on id
        status.focus(e.detail.id);
    },false);

    document.addEventListener(toExploreEvent,function (e) {
        console.log(toExploreEvent,e.detail);
        // restore the status of explorer
        status.restore();
    },false);



    /*
     * Manager output messages
     */
    // notify reset action
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        // todo send current viewport
        notifyAction(exploreEvent);
    });
    // notify focus action
    status.observe.filter(state => 'id' in state).map(state => state.features).subscribe((features) => {
        notifyAction(focusOnEvent,{
            id: features[0].id || features[0]._id || features[0].properties.id,
            feature:features[0]
        });
    });


    function notifyAction(eventName, params) {
        let detail = params || {};
        let event = new CustomEvent(eventName, { detail: detail, bubbles: true,cancelable: false });
        console.debug('notifying action',eventName,event.detail);
        document.dispatchEvent(event);
    }
};