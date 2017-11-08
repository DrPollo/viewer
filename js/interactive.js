module.exports = (env) => {

    const orange = "#FF9800",
        pink = "#E91E63",
        deeporange = "#FF5722",
        blue = "#82b1ff",
        lightblue = "#03a9f3",
        deeppurle = "#673AB7",
        cyan = "#00BCD4",
        teal = "#009688",
        light = "#03A9F4",
        indingo = "#3F51B5",
        azure = "",
        purple = "",
        green = "#4CAF50",
        lightgreen = "#8BC34A",
        yellow = "#FFEB3B",
        amber = "#FFC107",
        lime = "#CDDC39",
        red = "#F44336",
        wgnred = '#c32630',
        gray = "#9E9E9E",
        darkgray = '#666',
        brown = "#795548",
        bluegray = "#607D8B";


    // env color
    let primaryColor = wgnred;
    let secondaryColor = darkgray;
    switch (env) {
        case 'pt3':
            primaryColor = blue;
            secondaryColor = green;
            break;
        case 'southwark':
            break;
        case 'sandona':
            primaryColor = blue;
            secondaryColor = lightblue;
            break;
        case 'torino':
            primaryColor = indingo;
            secondaryColor = bluegray;
            break;
        default:
    }


// reset styles
    const resetStyle = {
        color: secondaryColor,
        weight: 1,
        // fillColor: primaryColor,
        fillColor: 'transparent',
        fill: true
    };
    const highlightStyle = {
        color: primaryColor,
        weight: 2,
        fill: true,
        fillColor: primaryColor,
        opacity: 1,
        fillOpacity: 0.5
    };


    const featureStyle = function (feature, zoom) {
        // console.log(feature,zoom);
        return {
            fill: true,
            weight: 1,
            color: secondaryColor
        };
    };

    const vectorMapStyling = {
        nazioni: featureStyle,
        nazioni_mondo: featureStyle,
        regioni: featureStyle,
        regioni_europa: featureStyle,
        provincie: featureStyle,
        province_europa: featureStyle,
        comuni: featureStyle,
        comune: featureStyle,
        comuni_italia: featureStyle,
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
                    "nazioni_mondo",
                    "waterareas"
                ];
                break;
            case 3:
            case 4:
                return [
                    "nazioni_mondo",
                    "regioni_europa",
                    "province_europa"
                ];
                break;
            case 5:
            case 6:
                return [
                    "nazioni_mondo",
                    "regioni_europa",
                    "province_europa"
                ];
                break;
            case 7:
            case 8:
                return [
                    "nazioni_mondo",
                    "regioni_europa",
                    "province_europa"
                ];
                break;
            case 9:
            case 10:
                return [
                    "nazioni_mondo",
                    "regioni_europa",
                    "province_europa",
                    "comuni_italia",
                    "comune"
                ];
                break;
            case 11:
            case 12:
                return [
                    "province_europa",
                    "comuni_italia",
                    "comune"
                ];
                break;
            case 13:
            case 14:
                return [
                    "province_europa",
                    "comuni_italia",
                    "comune",
                    "quartieri",
                    "landusages",
                    "waterareas"

                ];
                break;
            case 15:
            case 16:
                return [
                    "comuni_italia",
                    "quartieri",
                    "city_block",
                    "waterareas",
                    "landusages"
                ];
                break;
            case 17:
            case 18:
                return [
                    "quartieri",
                    "city_block",
                    "waterareas",
                    "landusages",
                    "building",
                    "site"
                ];
                break;
            case 19:
            case 20:
                return [
                    "city_block",
                    "waterareas",
                    "landusages",
                    "building",
                    "site",
                    "indoor"
                ];
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
    // const vectormapUrl = "https://tiles.fldev.di.unito.it/tile/{z}/{x}/{y}";
    const vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";
    const vGrid = L.vectorGrid.protobuf(vectormapUrl, vectormapConfig);
    let hightlightId = null;
    vGrid.highlight = (id = null) => {
        if (hightlightId) {
            vGrid.resetFeatureStyle(hightlightId);
        }
        if (id) {
            hightlightId = id;
            vGrid.setFeatureStyle(id, highlightStyle);
        }
    };
    vGrid.resetStyle = () => {
        if (hightlightId) {
            vGrid.resetFeatureStyle(hightlightId);
            hightlightId = null;
        }
    };
    return vGrid;
};