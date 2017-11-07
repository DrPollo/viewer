module.exports = (status, env) => {
    // colori
    const colors = {
        'FL_GROUPS': '#3F7F91',
        'FL_EVENTS': '#88BA5C',
        'FL_NEWS': '#823256',
        'FL_ARTICLES': '#FFB310',
        'FL_PLACES': '#FE4336'
    };
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
    switch(env){
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

    const focusStyle = {
        style: {
            color: primaryColor,
            weight: 2,
            fill: true,
            fillColor: primaryColor,
            opacity: 1,
            fillOpacity: 0.35,
            dashArray: '10'
        },
        pane: 'focusPane'
    };

    const fLayer = L.geoJson([], focusStyle);
    fLayer.setLayer = (geoJson) => {
        fLayer.clearLayers();
        let feature = fLayer.addData(geoJson);
        return feature;
    };

    status.observe.filter(state => 'features' in state).map(state => state.features).subscribe(features => {
        // update infobox
        console.debug('check focus',features);
        // init infobox
        fLayer.setLayer(features);
    });


    return fLayer;
};