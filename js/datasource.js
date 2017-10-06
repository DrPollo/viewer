module.exports = (map, status, utils, env) => {

    const within = require('@turf/within');
    // temporal utils
    const moment = require('moment');


    // dev
    let markerUrl = 'https://loggerproxy.firstlife.org/events/{x}/{y}/{z}';
    // env management
    switch (env){
        case 'pt2': markerUrl = 'https://loggerproxy-pt2.firstlife.org/tile/{x}/{y}/{z}'; break;
        case 'pt3': markerUrl = 'https://loggerproxy-pt3.firstlife.org/tile/{x}/{y}/{z}'; break;
        case 'sandona': markerUrl = 'https://loggerproxy-sandona.firstlife.org/tile/{x}/{y}/{z}'; break;
        case 'torino': markerUrl = 'https://loggerproxy-torino.firstlife.org/tile/{x}/{y}/{z}'; break;
        case 'southwark': markerUrl = 'https://loggerproxy-southwark.firstlife.org/tile/{x}/{y}/{z}'; break;
        default:
    }

    // default zoom_level
    const defaultZoomLevel = 18;

    //default date
    // current week, from monday to sunday from 00:00:00:000 to 23:59:59:999
    let date = {
        from: null,
        // from: moment('2017-01-01').isoWeekday(1).hour(0).minute(0).second(0).millisecond(0),
        // from: moment().isoWeekday(1).hour(0).minute(0).second(0).millisecond(0),
        to: null
        // to: moment('2018-01-01').isoWeekday(7).hour(23).minute(59).second(59).millisecond(999)
        // to: moment().isoWeekday(7).hour(23).minute(59).second(59).millisecond(999)
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
        bluegray = "#607D8B",
        darkgray = "#666";

    const colors = (type) => {
        if (type === 'FL_GROUPS') return '#3F7F91';
        if (type === 'FL_EVENTS') return '#88BA5C';
        if (type === 'FL_NEWS') return '#823256';
        if (type === 'FL_ARTICLES') return '#FFB310';
        if (type === 'FL_PLACES') return '#FE4336';
        if (type.includes('imc.infalia')) return blue;
        if (type.includes('tmp.infalia')) return indingo;
        if (type.includes('liquidfeedback')) return green;
        if (type.includes('firstlife')) return orange;
        if (type.includes('geokey')) return red;
        if (type.includes('communitymaps')) return teal;
        return '#c32630';
    };


    const featureStyle = function (feature, zoom) {
        // console.log(feature,zoom);
        return {
            fill: false,
            weight: 0
        };
    };

    // query params
    // start_time and end_time > UTC
    let qParams = "";
    if(date.from && date.from.utc()){
        if(qParams === ""){
            qParams = qParams.concat("?");
        } else {
            qParams = qParams.concat("&");
        }
        qParams = qParams.concat("start_time=",date.from.utc().format('x'));
    }
    if(date.to && date.to.utc()){
        if(qParams === ""){
            qParams = qParams.concat("?");
        } else {
            qParams = qParams.concat("&");
        }
        qParams = qParams.concat("end_time=",date.to.utc().format('x'));
    }


    // priority of POIs visualisation
    let priority = {
        highlight:[],
        background:[],
        exclude:[]
    };




    /*
     * Gaussian
     * https://www.desmos.com/calculator/oihvoxtriz
     * a = max radius
     * b = zoom level
     * cLeft & cRight = spread (between 2 - 3)
     * code diverse per lo zoom in e zoom out dalla media
     */
    const maxWeight = 2,
        maxRadius = 10,
        backgroundMaxRadius = 8,
        backgroundOpacity = 0.6,
        cRight = 1.4,
        cLeft = 3,
        minRadius = 2.5,
        // related to material icon size
        minIconRadius = 14,
        defOpacity = 0.8;
    const scale = (x, level) => {
        let c = x < level ? cLeft : cRight;
        let k = Math.pow((x - level), 2) * -1;
        let q = 2 * Math.pow(c, 2);
        let z = k / q;
        let radius = Math.floor(maxRadius * Math.exp(z));
        // console.log(radius);
        // senza soglia
        return Math.max(radius, minRadius);
        // con soglia
        // return radius;
    };
    /*
     * Markers
     */
    const getType = (feature) => {return feature.properties.entity_type || feature.application || feature.properties.hasType;};
    const getIconName = (type) => {
        if (type === 'FL_GROUPS') return 'People';
        if (type === 'FL_EVENTS') return 'Calendar';
        if (type === 'FL_NEWS') return 'Alert';
        if (type === 'FL_ARTICLES') return 'Content';
        if (type === 'FL_PLACES') return 'Location';
        if (type.includes('imc.infalia')) return 'Alert';
        if (type.includes('tmp.infalia')) return 'Activity';
        if (type.includes('liquidfeedback')) return 'Input';
        if (type.includes('firstlife')) return 'People';
        if (type.includes('geokey')) return 'Content';
        if (type.includes('communitymaps')) return 'Content';
        return 'Content';
    };
    const geojsonMarkerStyle = (feature) => {
        let type = getType(feature);
        let color = colors(type);
        // console.debug(type,color);
        return {
            opacity: defOpacity,
            fill: true,
            fillOpacity: 0.8,
            weight: 0,
            color: color,
            fillColor: color
        };
    };


    let focusId = null;
    let focusGeometry = null;

    const getZoomLevel = (feature) => {
        if(feature && feature.properties && feature.properties.zoom_level) {return feature && feature.properties && feature.properties.zoom_level;}

        // zoom considering hasType
        if(feature && feature.properties && feature.properties.hasType) {
            switch (feature.properties.hasType) {
                case 'BicyclePath':
                case 'Highway':
                case 'Hospital':
                case 'UrbanPark':
                    return 16;
                    break;
                default: return defaultZoomLevel;
            }
        }
        // default
        return defaultZoomLevel;
    };

    // configuration of geojson grid level: it must have "layers":{ "default":{ } }
    const markerLayers = {
        "layers": {
            "default": {
                pointToLayer: function (feature, latlng) {
                   return getMarker(feature,latlng);
                }
            }
        }
    };
    let mGrid = L.geoJsonGridLayer(markerUrl+qParams, markerLayers);

    mGrid.update = () => {
        console.log('grid update');
        let layer = mGrid.getLayers()[0];
        if(!layer){return;}
        // console.log(layer);
        let features = layer['_layers'];
        let zoom = map.getZoom();
        // console.log('nuovo raggio: ',scale(zoom));
        for (let i in features) {
            let feat = features[i];
            // console.log(feat.feature);
            let level = getZoomLevel(feat.feature);
            let radius = scale(zoom, level);
            let weight = Math.min(radius, maxWeight);
            // get type
            let type = getType(feat.feature);
            // if background set cap to backgroundMaxRadius
            if(priority.background.indexOf(type) > -1) {
                radius = Math.min(radius, backgroundMaxRadius);
            }
            // console.debug('check marker',feat);
            // refresh icon
            feat.setIcon(getMarkerIcon(feat.feature));
        }
    };


    // cambia il focus
    mGrid.setStyle = (focus) => {
        if(!focus) {return;}
        // console.debug('setting focus on ',focus);
        focusId = focus.id;
        focusGeometry = {type:"featureCollection", features:focus.features};
        mGrid.update();
    };
    // reset il focus
    mGrid.resetStyle = () => {
        focusId = null;
        focusGeometry = null;
        mGrid.update();
    };



    /*
     * Listners
     */


    // set default style
    status.observe.filter(state => 'features' in state).subscribe(focus => mGrid.setStyle(focus));

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

    status.observe.filter(state => 'priority' in state).map(state => state.priority).subscribe((prioritySettings) => {
        // console.log('setting priority', prioritySettings, priority);
        priority = prioritySettings;
    });



    function getMarkerIcon(feature){
        let currentZoom = map.getZoom();
        // if(feature.area_id)
        // console.log(feature);
        let type = getType(feature);
        let className = getIconName(type);
        let radius = scale(currentZoom, getZoomLevel(feature));
        let weight = Math.min(radius, maxWeight);
        let style = Object.assign(
            {
                interactive: false
            },
            geojsonMarkerStyle(feature),
            {
                weight: weight,
                radius: radius*2,
                className: className
            }
        );

        // do not render POIs if their type should be exclude
        // console.debug('exclude?',priority.exclude,type);
        if(priority.exclude.indexOf(type) > -1) { return null; }


        let confIcon = {
            className: 'marker-circle'
        };


        // if type in background or highlight is set and type is not among highlight types
        // overwrite of radius of background POIs
        // console.debug('check is background',type,priority,priority.background.indexOf(type) > -1 || (priority.highlight.length > 0 && priority.highlight.indexOf(type) < 0));
        if(priority.background.indexOf(type) > -1 || (priority.highlight.length > 0 && priority.highlight.indexOf(type) < 0)) {
            style.radius = Math.min(style.radius, backgroundMaxRadius);
            style.opacity = '0.5';
            style.borderColor = gray;
            style.width = 1;
            style.backgroundColor = hexToRgba(gray,style.opacity);
            style.class = "background";
        }
        // console.debug('check type',type,radius);
        // priority of source:
        // set priority (z-index) of highlight POIs
        // if type in highlight or background is set and type is not among background types
        // console.debug('check is highlight', type, priority, priority.highlight.indexOf(type) > -1 || (priority.background.length > 0 && priority.background.indexOf(type) < 0));
        if(priority.highlight.indexOf(type) > -1 || (priority.background.indexOf(type) < 0)) {
            style.up = true;
            style.opacity = '1';
            style.borderColor = darkgray;
            style.backgroundColor = hexToRgba(style.color,style.opacity);
            style.class = "highlight";
        }

        /*
         * focus management
         */
        // priority of source:
        // type is to be excluded
        // se non definito id o definito e uguale all'area id
        // explicit relation
        if(focusId && feature.area_id === focusId){
            // non cambio nulla
        } else if(focusId && focusGeometry) {
            // within focus area geometry
            // console.debug('focusGeometry', feature, focusGeometry);
            try {
                let isInside = (within({
                    type: "featureCollection",
                    features: [feature]
                }, focusGeometry).features.length > 0);
                if (!isInside) {
                    // todo change style
                    style = Object.assign(style,outsideFocusStyle(style,type));
                }
            } catch (e) {
                console.error('@turf/within', e);
                // todo change style
                style = Object.assign(style,outsideFocusStyle(style,type));
            }
        } else if(focusId){
            style = Object.assign(style,outsideFocusStyle(style,type));
        }

        if(focusId) console.log('check style',style);


        // build icon given the computed style
        let d = style.radius*2;
        confIcon.iconSize = d;


        let iconStyle = ('').concat(
            "font-size:",d,"px;",
            "width:",d,"px;",
            "height:",d,"px;",
            "border-color:",style.borderColor,";",
            // "border-color:",style.color,";",
            "border-width:",style.weight,"px ",style.weight,"px;",
            "background-color:",style.backgroundColor,";");

        // management of icons considering current radius
        // icon iff radius >= min value
        // console.debug('check marker icon',style);
        if(minIconRadius <= style.radius){
            confIcon.html = '<div class="circle" style="'+iconStyle+'">'+utils.getIcon(feature)+'</div>';
        } else {
            confIcon.html = '<div class="circle circle-small '+style.class+'" style="'+iconStyle+'"></div>';
        }

        return L.divIcon(confIcon);

        function hexToRgba(input,opacity){
            let hex = parseInt(input.substring(1),16);

            let r = hex >> 16;
            let g = hex >> 8 & 0xFF;
            let b = hex & 0xFF;
            // console.debug('check rgba',("rgba(").concat(r,", ",g,", ",b,", ",opacity,")"));
            return ("rgba(").concat(r,", ",g,", ",b,", ",opacity,")");
        }

        function outsideFocusStyle(style,type){
            // console.debug('outsideFocusStyle',style,type,priority.highlight);
            // keep color, keep up, bigger radius
            if (priority.highlight.indexOf(type) > -1) {
                return {
                    radius: Math.min(style.radius,backgroundMaxRadius)
                };
            }
            // outside focus style
            return {
                radius: Math.min(style.radius,backgroundMaxRadius),
                backgroundColor : hexToRgba(gray,backgroundOpacity),
                borderColor : hexToRgba(gray,style.opacity)
            };
        }
    }

    function getMarker(feature, latlng){
        // console.debug('get marker',feature, latlng);
        let markerIcon = getMarkerIcon(feature);
        if(!markerIcon){return null;}
        return L.marker(latlng, {icon:markerIcon, interactive: false, pane:"customMarkerPane"});
        // let circle = L.circleMarker(latlng, style);
        // console.debug('check circle',circle);
        // return circle;
    }


    // inizializzazione markerGrid layer
    mGrid.addTo(map);

    return mGrid
};








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

// const dynamicStyle = (feature) => {
//     if(!focusId || !focusGeometry){ return{}; }
//     let type = getType(feature);
//     // priority of source:
//     // type is to be excluded
//     // se non definito id o definito e uguale all'area id
//     // explicit relation
//     if(focusId && feature.area_id === focusId){
//         // non cambio nulla
//         return {
//             up: true
//         };
//     }
//     // within focus area geometry
//     // console.debug('focusGeometry', feature, focusGeometry);
//     try{
//         let isInside = (within({type:"featureCollection", features:[feature]}, focusGeometry).features.length > 0);
//         if(isInside) {
//             return {
//                 up: true
//             };
//         }
//     }catch (e){
//         console.error('@turf/within',e);
//     }
//     // keep color, keep up, bigger radius
//     if(priority.highlight.indexOf(type) > -1) {
//         return {
//             radius: 2
//         };
//     }
//     // otherwise (out of focus and background or not highlighted)
//     return {
//         radius: 1,
//         color: gray,
//         fillColor: gray,
//         up: false
//     }
// };

// circles
// mGrid.update = () => {
//     let layer = mGrid.getLayers()[0];
//     if(!layer){return;}
//     // console.log(layer);
//     let features = layer['_layers'];
//     let zoom = map.getZoom();
//     // console.log('nuovo raggio: ',scale(zoom));
//     for (let i in features) {
//         let feat = features[i];
//         // console.log(feat.feature);
//         let level = getZoomLevel(feat.feature);
//         let radius = scale(zoom, level);
//         let weight = Math.min(radius, maxWeight);
//         // get type
//         let type = getType(feat.feature);
//         // if background set cap to backgroundMaxRadius
//         if(priority.background.indexOf(type) > -1) {
//             radius = Math.min(radius, backgroundMaxRadius);
//         }
//         feat.setRadius(radius);
//         // creo il nuovo stile
//         let style = Object.assign({}, geojsonMarkerStyle(feat.feature), {weight: weight}, dynamicStyle(feat.feature));
//         feat.setStyle(style);
//         if (style.up) {
//             feat.bringToFront();
//         } else {
//             feat.bringToBack();
//         }
//     }
// };