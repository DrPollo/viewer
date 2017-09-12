module.exports = () => {
    const orange = "#ff7800";
    const blue = "#82b1ff";
    const green = "#33cd5f";
    const gray = "#dcdcdc";


// reset styles
    const resetStyle = {
        color: 'transparent',
        weight: 0,
        fillColor: 'transparent'
    };
    const highlightStyle = {
        color: orange,
        weight: 2,
        fill: false,
        fillColor: orange,
        opacity: 1,
        fillOpacity: 0.5
    };


    const featureStyle = function (feature, zoom) {
        // console.log(feature,zoom);
        return {
            fill: false,
            weight: 0
        };
    };

    const vectorMapStyling = {
        nazioni: featureStyle,
        regioni: featureStyle,
        provincie: featureStyle,
        comuni: featureStyle,
        circoscrizioni: featureStyle,
        quartieri: featureStyle,
        city_block: featureStyle,
        site: featureStyle,
        building: featureStyle,
        landusages: featureStyle,
        roads: featureStyle,
        waterareas: featureStyle,
        waterways: featureStyle,
        indoor: featureStyle,
        interactive: featureStyle
    };


    const ordering = function (layers, zoom) {
        // console.debug('reordering....',layers);
        switch (zoom) {
            case 1:
            case 2:
                return [
                    "nazioni",
                    "waterareas",
                    "waterways"
                ];
                break;
            case 3:
            case 4:
                return [
                    "nazioni",
                    "regioni",
                    "provincie",
                    "waterareas",
                    "waterways"
                ];
                break;
            case 5:
            case 6:
                return [
                    "nazioni",
                    "regioni",
                    "provincie",
                    "landusages",
                    "roads",
                    "waterareas",
                    "waterways"];
                break;
            case 7:
            case 8:
                return [
                    "nazioni",
                    "regioni",
                    "provincie",
                    "landusages",
                    "roads",
                    "waterareas",
                    "waterways",
                    "comuni",];
                break;
            case 9:
            case 10:
                return [
                    "nazioni",
                    "regioni",
                    "provincie",
                    "landusages",
                    "roads",
                    "waterareas",
                    "waterways",
                    "comuni"];
                break;
            case 11:
            case 12:
                return [
                    "provincie",
                    "landusages",
                    "roads",
                    "waterareas",
                    "waterways",
                    "comuni"];
                break;
            case 13:
            case 14:
                return [
                    "provincie",
                    "quartieri",
                    "landusages",
                    "comuni"];
                break;
            case 15:
            case 16:
                return [
                    "comuni",
                    "city_block",
                    "landusages",
                    "waterareas",
                    "waterways",
                    "quartieri",];
                break;
            case 17:
            case 18:
                return [
                    "site",
                    "landusages",
                    "building",
                    "roads",
                    "waterareas",
                    "waterways",
                    "quartieri",
                    "city_block",];
                break;
            case 19:
            case 20:
                return [
                    "site",
                    "building",
                    "roads",
                    "waterareas",
                    "waterways",
                    "indoor"];
                break;
            default:
                return Object.keys(layers);
        }
    };


    /*
     * VectorGrid
     */



    L.Path.mergeOptions(resetStyle);
    L.Polyline.mergeOptions(resetStyle);
    L.Polygon.mergeOptions(resetStyle);
    L.Rectangle.mergeOptions(resetStyle);
    L.Circle.mergeOptions(resetStyle);
    L.CircleMarker.mergeOptions(resetStyle);
// end reset styles


// Monkey-patch some properties for mapzen layer names, because
// instead of "building" the data layer is called "buildings" and so on
    vectorMapStyling.buildings = vectorMapStyling.building;
    vectorMapStyling.boundaries = vectorMapStyling.boundary;
    vectorMapStyling.places = vectorMapStyling.place;
    vectorMapStyling.pois = vectorMapStyling.poi;
    vectorMapStyling.roads = vectorMapStyling.road;

// config del layer
    const vectormapConfig = {
        rendererFactory: L.svg.tile,
        attribution: false,
        vectorTileLayerStyles: vectorMapStyling,
        interactive: true,
        pane: 'vectorGridPane',
        getFeatureId: function (e) {
            return e.properties.id;
        },
        layersOrdering: ordering
    };
// const vectormapUrl = "http://localhost:3095/tile/{z}/{x}/{y}";
    const vectormapUrl = "https://tiles.fldev.di.unito.it/tile/{z}/{x}/{y}";
// const vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";
    const vGrid = L.vectorGrid.protobuf(vectormapUrl, vectormapConfig);
    let hightlightId = null;
    vGrid.highlight = (id = null) => {
        if(hightlightId){
            vGrid.resetFeatureStyle(hightlightId);
        }
        if(id) {
            hightlightId = id;
            vGrid.setFeatureStyle(id, highlightStyle);
        }
    };
    vGrid.resetStyle = () => {
        if(hightlightId) {
            vGrid.resetFeatureStyle(hightlightId);
            hightlightId = null;
        }
    };
    return vGrid;
};