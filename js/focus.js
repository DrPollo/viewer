module.exports = (status) => {
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
        brown = "#795548",
        bluegray = "#607D8B";

    const focusStyle = {
        style: {
            color: wgnred,
            weight: 2,
            fill: true,
            fillColor: wgnred,
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