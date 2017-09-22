module.exports = (map, status) => {

    // const markerUrl = 'https://api.fldev.di.unito.it/v5/fl/Things/tilesearch?domainId=1,4,9,10,11,12,13,14,15&limit=99999&tiles={x}:{y}:{z}';
    // const markerUrl = 'https://api.fldev.di.unito.it/v5/fl/Things/tilesearch?domainId=21&limit=99999&tiles={x}:{y}:{z}';
    // const markerUrl = 'https://api.firstlife.org/v5/fl/Things/tilesearch?domainId=12&limit=99999&tiles={x}:{y}:{z}';
    // const markerUrl = 'https://api.firstlife.org/v5/fl/Things/tilesearch?domainId=1,4,7,9,10,11,12,13,14,15&limit=99999&tiles={x}:{y}:{z}';
    // const markerUrl = 'https://loggerproxy.firstlife.org/events/{x}/{y}/{z}';
    // const markerUrl = 'https://loggerproxy-pt2.firstlife.org/tile/{x}/{y}/{z}';
    // const markerUrl = 'http://localhost:3085/events/{x}/{y}/{z}';
    const markerUrl = 'http://localhost:3085/tile/{x}/{y}/{z}';


    // temporal utils
    const moment = require('moment');

    // default zoom_level
    const defaultZoomLevel = 18;


    //default date
    // current week, from monday to sunday from 00:00:00:000 to 23:59:59:999
    let date = {
        from: moment().isoWeekday(1).hour(0).minute(0).second(0).millisecond(0),
        to: moment().isoWeekday(7).hour(23).minute(59).second(59).millisecond(999)
    };

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



    const featureStyle = function (feature, zoom) {
        // console.log(feature,zoom);
        return {
            fill: false,
            weight: 0
        };
    };

    // query params
    // start_time and end_time > UTC
    let qParams = ("?start_time=").concat(date.from.utc().format('x')).concat("&end_time=",date.to.utc().format('x'));



    // exponential
    // var scale = function(x,level){
    //
    //     if(x > level)
    //         return 0;
    //     // https://www.desmos.com/calculator/3fisjexbvp
    //     // return Math.log(num*10);
    //     var a = 0.05,
    //     b = 1.33,
    //     c = 0;
    //     return Math.floor(a*(Math.pow(b,x))+c);
    // }


    /*
     * Gaussian
     * https://www.desmos.com/calculator/oihvoxtriz
     * a = max radius
     * b = zoom level
     * cLeft & cRight = spread (between 2 - 3)
     * code diverse per lo zoom in e zoom out dalla media
     */
    const maxWeight = 1,
        maxRadius = 6,
        cRight = 1.4,
        cLeft = 3,
        minRadius = 1;
    const scale = (x, level) => {
        let c = x < level ? cLeft : cRight;
        let k = Math.pow((x - level), 2) * -1;
        let q = 2 * Math.pow(c, 2);
        let z = k / q;
        let radius = Math.floor(maxRadius * Math.exp(z));
        // console.log(radius);
        // senza soglia
        // return Math.max(radius, minRadius);
        // con soglia
        return radius;
    };
    /*
     * Markers
     */
    const geojsonMarkerStyle = (feature) => {
        let type = feature.properties.entity_type || feature.properties.hasType;
        let color = colors[type] || orange;
        // console.debug(type,color);
        return {
            opacity: 1,
            fill: true,
            fillOpacity: 0.8,
            weight: 0,
            color: color,
            fillColor: color
        };

    };





    let focusId = null;
    const dynamicStyle = (feature) => {
        // console.debug('focus?', focus !== null);
        // todo priority of source
        // se non definito id o definito e uguale all'area id
        if(!focusId || feature.area_id === focusId){
            // non cambio nulla
            return {
                up: true
            };
        } else {
            return {
                radius: 1,
                color: gray,
                fillColor: gray,
                up: false
            }
        }
    };
    const markerLayers = {
        "layers": {
            "default": {
                pointToLayer: function (feature, latlng) {
                    let currentZoom = map.getZoom();
                    // if(feature.area_id)
                    // console.log(feature);

                    let radius = scale(currentZoom, feature.properties.zoom_level || defaultZoomLevel);
                    let weight = Math.min(radius, maxWeight);
                    let style = Object.assign(
                        {
                            interactive: false
                        },
                        geojsonMarkerStyle(feature),
                        {
                            weight: weight,
                            radius: radius
                        }
                    );
                    console.debug(style,latlng);
                    return L.circleMarker(latlng, style);
                }
            }
        }
    };
    let mGrid = L.geoJsonGridLayer(markerUrl+qParams, markerLayers);

    mGrid.update = () => {
        let layer = mGrid.getLayers()[0];
        if(!layer){return;}
        // console.log(layer);
        let features = layer['_layers'];
        let zoom = map.getZoom();
        // console.log('nuovo raggio: ',scale(zoom));
        for (let i in features) {
            let feat = features[i];
            // console.log(features[i].feature.properties.zoom_level);
            let level = feat.feature.properties.zoom_level || defaultZoomLevel;
            let radius = scale(zoom, level);
            let weight = Math.min(radius, maxWeight);
            feat.setRadius(radius);
            // creo il nuovo stile
            let style = Object.assign({}, geojsonMarkerStyle(feat.feature), {weight: weight},dynamicStyle(feat.feature));
            feat.setStyle(style);
            if (style.up) {
                feat.bringToFront();
            } else {
                feat.bringToBack();
            }
        }
    };

    // cambia il focus
    mGrid.setStyle = (id = null) => {
        // console.debug('setting focus on ',id);
        focusId = id;
        mGrid.update();
    };
    // reset il focus
    mGrid.resetStyle = () => {
        focusId = null;
        mGrid.update();
    };



    /*
     * Listners
     */


    // set default style
    status.observe.filter(state => 'id' in state).map(state => state.id).subscribe(id => mGrid.setStyle(id));

    status.observe.filter(state => 'reset' in state).subscribe(() => {
        mGrid.resetStyle();
    });

    status.observe.filter(state => 'date' in state).filter(state => state.date).subscribe((newDate) => {
        if(!newDate.from && !newDate.to) {return;}
        // change date
        date.from = newDate.from || date.from;
        date.to = newDate.to || date.to;
        // change q params
        qParams = ("?start_time=").concat(date.from.utc().format('x')).concat("&end_time=",date.to.utc().format('x'));
        // remove layer
        mGrid.remove();
        // new instance of mGrid
        mGrid = L.geoJsonGridLayer(markerUrl+qParams, markerLayers);
        mGrid.addTo(map);
    });

    // fine cambio di zoom
    map.on('zoomend', (e) => {
        // aggiorno stile marker
        // todo gestione focus nella scelta di stile
        mGrid.update();
    });


    // inizializzazione markerGrid layer
    mGrid.addTo(map);

    return mGrid
};