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
    const setPriorityEvent = "areaViewer.setPriority";
    const setDateEvent = "areaViewer.setDate";
    const setInteractivityEvent = "areaViewer.setInteractive";
    // state events
    const focusToEvent = "areaViewer.focusTo";
    const toExploreEvent = "areaViewer.toExplore";
    const changePositionEvent = "areaViewer.position";

    /* output events: notify areaViewer change of state
     * 1) focusToEvent: {id}
     * 2) toExploreEvent: void
     */
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
        // console.debug(setViewEvent,e.detail);
        if((!e.detail.lat || !e.detail.lng) && !e.detail.center){ return; }
        status.restore();
        map.setView(e.detail.center || L.latLng(e.detail.lat,e.detail.lng), e.detail.zoom || locationZoom);
    },false);

    document.addEventListener(resetViewEvent,function (e) {
        console.log(resetViewEvent,e.detail);
        // status.move();
    },false);


    // change current baselayer according to contrast setup
    document.addEventListener(setContrastEvent,function (e) {
        console.log(setContrastEvent,e.detail);
        // set current map theme
        status.contrast(e.detail.contrast);
    },false);

    // change current language accordingly
    document.addEventListener(setLanguageEvent,function (e) {
        console.log(setLanguageEvent,e.detail);
        // set current language
        if(!e.detail.lang){  return; }
        status.lang(lang);
    },false);
    // change current date_from and date_to accordingly
    document.addEventListener(setDateEvent,function (e) {
        console.log(setDateEvent,e.detail);
        // set current dates
        if(!e.detail.date_from || !e.detail.date_to){  return; }
        status.date({from: e.detail.date_from, to: e.detail.date_to});
    },false);

    // change behaviour of focus: enable or disable list and change of layout
    document.addEventListener(setInteractivityEvent,function (e) {
        console.log(setInteractivityEvent,e.detail);
        // set current dates
        if(e.detail.interactive === null || e.detail.interactive === "null"){  return; }
        status.interactive({interactive: e.detail.interactive});
    },false);

    // definition of priority of sources for visualisation purpose
    document.addEventListener(setPriorityEvent,function (e) {
        console.log(setPriorityEvent,e.detail);
        if(!e.detail.priority){  return; }
        // set priority of POIs: {highlight:[], background:[], exluded:[]}
        status.priority(e.detail.priority);
    },false);

    // request focus on id
    document.addEventListener(focusToEvent,function (e) {
        console.log(focusToEvent,e.detail);
        // check area id
        if(!e.detail.id){  return; }
        // focus on id
        status.focus({id:e.detail.id});
    },false);

    // back to explore
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
        notifyAction(exploreEvent);
    });
    status.observe.filter(state => 'c' in state).filter(state => state.c).subscribe((c) => {
        // send current mpa center
        notifyAction(changePositionEvent,c);
    });
    // notify focus action
    status.observe.filter(state => 'id' in state).map(state => {
        return {features:state.features, content:state.content};
    }).subscribe((focus) => {
        // returns id of focus area, feature description, pois related to the focus area
        notifyAction(focusOnEvent,{
            id: focus.features[0].id || focus.features[0]._id || focus.features[0].properties.id,
            feature:focus.features[0],
            content: focus.content
        });
    });
    // notify the user's action
    function notifyAction(eventName, params) {
        let detail = params || {};
        let event = new CustomEvent(eventName, { detail: detail, bubbles: true,cancelable: false });
        console.debug('notifying action',eventName,event.detail);
        document.dispatchEvent(event);
    }
};