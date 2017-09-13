/**
 * Created by drpollo on 13/09/2017.
 */
module.exports = (map) => {


    /* input events: changing areaViewer state
     * 1) resetViewEvent: void
     * 2) setViewEvent: {lat, lng, zoom, bbox}
     * 3) focusToEvent: {id}
     * 4) toExploreEvent: void
     */
    // viewport events
    const resetViewEvent = "areaViewer.resetView";
    const setViewEvent = "areaViewer.setView";
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




};