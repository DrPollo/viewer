/**
 * Created by drpollo on 20/07/2017.
 */
// definition of the map

module.exports = (status) => {

    // defaults
    const initZoom = 14;
    const initLat = 45.070312;
    const initLon = 7.686856;
    let zoomControlPosition = 'bottomright';

    const map = L.map('areaViewer').setView([initLat, initLon], initZoom);
    // control position
    map.zoomControl.setPosition(zoomControlPosition);

    // pane per vectorGrid
    map.createPane('vectorGridPane');
    map.createPane('focusPane');
    // gestione pane
    // overlayPane > markers
    map.getPane('overlayPane').style.zIndex = 10;
    // vectorGridPane > vector tile
    map.getPane('vectorGridPane').style.zIndex = 11;
    // focusPane > focus geometry
    map.getPane('focusPane').style.zIndex = 12;

    return map;
};