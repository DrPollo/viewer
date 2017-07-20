/**
 * Created by drpollo on 20/07/2017.
 */
// colori
const colors = {
    'FL_GROUPS': '#3F7F91',
    'FL_EVENTS': '#88BA5C',
    'FL_NEWS': '#823256',
    'FL_ARTICLES': '#FFB310',
    'FL_PLACES': '#FE4336'
};
const orange = "#ff7800",
    blue = "#82b1ff",
    green = "#33cd5f",
    gray = "#dcdcdc";

const focusStyle = {
    style: {
        color: orange,
        weight: 2,
        fill: false,
        fillColor: orange,
        opacity: 1,
        fillOpacity: 0.5
    },
    pane: 'focusPane'
};

module.exports = () => {
    const fLayer = L.geoJson([], focusStyle);
    fLayer.setLayer = (geoJson) => {
        fLayer.clearLayers();
        fLayer.addData(geoJson);
    };
    return fLayer;
};