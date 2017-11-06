module.exports = (map, status, utils, env) => {

    const within = require('@turf/within');
    // temporal utils
    const moment = require('moment');

    const axios = require('axios');

    // dev env
    let token = 'ZmI5MzNmNjQtOWMxNC00ZjNiLTg3ZmYtZGViOWQ0MmI3NTAx';
    let otmUrl = "https://api.ontomap.eu/api/v1/";
    let loggerUrl = "https://api.ontomap.eu/api/v1/logger/";

    // featureGroup
    const mGrid = L.featureGroup();


// environment management
    switch (env) {
        case 'sandona':
            otmUrl = "https://sandona.api.ontomap.eu/api/v1/";
            loggerUrl = "https://sandona.api.ontomap.eu/api/v1/logger/";
            token = 'ZmI5MzNmNjQtOWMxNC00ZjNiLTg3ZmYtZGViOWQ0MmI3NTAx';
            break;
        case 'torino':
            otmUrl = "https://torino.api.ontomap.eu/api/v1/";
            loggerUrl = "https://torino.api.ontomap.eu/api/v1/logger/";
            token = 'YzFiYjQzYjEtODRjNS00ZDk5LWJlOGEtZDQwYzdhMjkwYzk3';
            break;
        case 'southwark':
            otmUrl = "https://southwark.api.ontomap.eu/api/v1/";
            loggerUrl = "https://southwark.api.ontomap.eu/api/v1/logger/";
            break;
        case 'pt3':
            otmUrl = "https://p3.api.ontomap.eu/api/v1/";
            loggerUrl = "https://p3.api.ontomap.eu/api/v1/logger/";
            token = 'OTM5MTg2NzgtYWQzMy00YzI1LWIzZmQtOWM1NmM0ZTU2ZjJl';
            break;
        case 'pt2':
            otmUrl = "https://p2.api.ontomap.eu/api/v1/";
            loggerUrl = "https://p2.api.ontomap.eu/api/v1/logger/";
            token = 'NWNkNDEzYjktOTZiYS00NGE0LThjZDQtMTI0MDE5OWE5YzBh';
            break;
        default:
            break;
    }


    // DEV DEV DEV
    otmUrl = "http://localhost:3085/";


    const http = axios.create({baseURL: otmUrl});


    // default zoom_level
    const defaultZoomLevel = 19;

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

        console.debug('wgnred?', type);
        return wgnred;
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
    let qParams = "?token=" + token;
    if (date.from && date.from.utc()) {
        qParams = qParams.concat("&start_time=", date.from.utc().format('x'));
    }
    if (date.to && date.to.utc()) {
        qParams = qParams.concat("&end_time=", date.to.utc().format('x'));
    }


    // priority of POIs visualisation
    let priority = {
        highlight: [],
        background: [],
        exclude: []
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
    const getType = (feature) => {
        let type = feature.properties.entity_type || feature.application || feature.properties.hasType;
        // console.debug('check type',type);
        return type;
    };
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
        // console.debug('check default style',feature);
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
        // console.debug('getZoomLevel',feature);

        if (feature && feature.properties && feature.properties.zoom_level) {
            return feature.properties.zoom_level < 1 || feature.properties.zoom_level > 20 ? defaultZoomLevel : feature.properties.zoom_level;
        }
        if (feature && feature.properties && feature.properties.additionalProperties && feature.properties.additionalProperties.zoom_level) {
            return feature.properties.additionalProperties.zoom_level < 1 || feature.properties.additionalProperties.zoom_level > 20 ? defaultZoomLevel : feature.properties.additionalProperties.zoom_level;
        }

        // zoom considering hasType
        if (feature && feature.properties && feature.properties.hasType) {
            switch (feature.properties.hasType) {
                case 'BicyclePath':
                case 'Highway':
                case 'Hospital':
                case 'UrbanPark':
                    return 16;
                    break;
                default:
                    return defaultZoomLevel;
            }
        }
        // default
        return defaultZoomLevel;
    };


    const update = () => {
        // console.debug('grid update', mGrid.getLayers());
        let markers = mGrid.getLayers();
        if (!markers || !Array.isArray(markers) || markers.length < 1) {
            return;
        }
        markers.map((marker) => {
            // console.debug('updating marker:',marker);
            // refresh icon
            marker.setIcon(getMarkerIcon(marker.options.feature));
        });
    };
    //
    //
    // // cambia il focus
    // mGrid.setStyle = (focus) => {
    //     if(!focus) {return;}
    //     // console.debug('setting focus on ',focus);
    //     focusId = focus.id;
    //     focusGeometry = {type:"featureCollection", features:focus.features};
    //     mGrid.update();
    // };
    // // reset il focus
    // mGrid.resetStyle = () => {
    //     focusId = null;
    //     focusGeometry = null;
    //     mGrid.update();
    // };


    /*
     * Listners
     */


    // set default style
    status.observe.filter(state => 'features' in state).subscribe(focus => {
        // set marker style with focus
        if (!focus) {
            return;
        }
        // console.debug('setting focus on ',focus);
        focusId = focus.id;
        focusGeometry = {type: "featureCollection", features: focus.features};
        update();
    });

    // on exit focus mode > reset markers style
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        // reset marker style without focus
        focusId = null;
        focusGeometry = null;
        update();
    });

    status.observe.filter(state => "bounds" in state).map(state => state.bounds).subscribe(bounds => {
        console.debug('datasource, new bounds ', bounds);

        console.log('get markers to update', mGrid);

        // call to OTM logger > add events to mGrid
        getEvents(bounds);

        // todo call to OTM > add to mGrid
    });


    // fine cambio di zoom
    map.on('zoomend', (e) => {
        // aggiorno stile marker
        update();
    });

    status.observe.filter(state => 'priority' in state).map(state => state.priority).subscribe((prioritySettings) => {
        // console.log('setting priority', prioritySettings, priority);
        priority = prioritySettings;
    });

    status.observe.filter(state => 'date' in state).filter(state => state.date).subscribe((newDate) => {
        if (!newDate.from && !newDate.to) {
            return;
        }
        // change date
        date.from = newDate.from || date.from;
        date.to = newDate.to || date.to;
        // change q params
        qParams = ("?token=" + token).concat("&start_time=", date.from.utc().format('x')).concat("&end_time=", date.to.utc().format('x'));
        // remove layer
        // mGrid.remove();
        // // new instance of mGrid
        // mGrid = L.geoJsonGridLayer(markerUrl+qParams, markerLayers);
        // mGrid.addTo(map);
    });


    function getMarkerIcon(feature) {
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
                radius: radius * 2,
                className: className
            }
        );

        // do not render POIs if their type should be exclude
        // console.debug('exclude?',priority.exclude,type);
        if (priority.exclude.indexOf(type) > -1) {
            return null;
        }


        let confIcon = {
            className: 'marker-circle'
        };


        // if type in background or highlight is set and type is not among highlight types
        // overwrite of radius of background POIs
        // console.debug('check is background',type,priority,priority.background.indexOf(type) > -1 || (priority.highlight.length > 0 && priority.highlight.indexOf(type) < 0));
        if (priority.background.indexOf(type) > -1 || (priority.highlight.length > 0 && priority.highlight.indexOf(type) < 0)) {
            style.radius = Math.min(style.radius, backgroundMaxRadius);
            style.opacity = '0.5';
            style.borderColor = gray;
            style.width = 1;
            style.backgroundColor = hexToRgba(gray, style.opacity);
            style.class = "background";
        }
        // console.debug('check type',type,radius);
        // priority of source:
        // set priority (z-index) of highlight POIs
        // if type in highlight or background is set and type is not among background types
        // console.debug('check is highlight', type, priority, priority.highlight.indexOf(type) > -1 || (priority.background.length > 0 && priority.background.indexOf(type) < 0));
        if (priority.highlight.indexOf(type) > -1 || (priority.background.indexOf(type) < 0)) {
            style.up = true;
            style.opacity = '1';
            style.borderColor = style.color;
            style.backgroundColor = hexToRgba(style.color, '0.85');
            style.class = "highlight";
        }

        // console.debug('check style',style.backgroundColor);

        /*
         * focus management
         */
        // priority of source:
        // type is to be excluded
        // se non definito id o definito e uguale all'area id
        // explicit relation
        if (focusId && feature.area_id === focusId) {
            // non cambio nulla
        } else if (focusId && focusGeometry) {
            // within focus area geometry
            // console.debug('focusGeometry', feature, focusGeometry);
            try {
                let isInside = (within({
                    type: "featureCollection",
                    features: [feature]
                }, focusGeometry).features.length > 0);
                if (!isInside) {
                    // todo change style
                    style = Object.assign(style, outsideFocusStyle(style, type));
                }
            } catch (e) {
                console.error('@turf/within', e);
                // todo change style
                style = Object.assign(style, outsideFocusStyle(style, type));
            }
        } else if (focusId) {
            style = Object.assign(style, outsideFocusStyle(style, type));
        }

        // build icon given the computed style
        let d = style.radius * 2;
        confIcon.iconSize = d;


        let iconStyle = ('').concat(
            "font-size:", d, "px;",
            "width:", d, "px;",
            "height:", d, "px;",
            "border-color:", style.borderColor, ";",
            // "border-color:",style.color,";",
            "border-width:", style.weight, "px ", style.weight, "px;",
            "background-color:", style.backgroundColor, ";");

        // management of icons considering current radius
        // icon iff radius >= min value
        // console.debug('check marker icon',style);
        if (minIconRadius <= style.radius) {
            confIcon.html = '<div class="circle" style="' + iconStyle + '">' + utils.getIcon(feature) + '</div>';
        } else {
            confIcon.html = '<div class="circle circle-small ' + style.class + '" style="' + iconStyle + '"></div>';
        }
        // console.debug('getMarkerIcon',confIcon, style.backgroundColor === wgnred);
        return L.divIcon(confIcon);

        function hexToRgba(input, opacity) {
            let hex = parseInt(input.substring(1), 16);

            let r = hex >> 16;
            let g = hex >> 8 & 0xFF;
            let b = hex & 0xFF;
            // console.debug('check rgba',("rgba(").concat(r,", ",g,", ",b,", ",opacity,")"));
            return ("rgba(").concat(r, ", ", g, ", ", b, ", ", opacity, ")");
        }

        function outsideFocusStyle(style, type) {
            // console.debug('outsideFocusStyle',style,type,priority.highlight);
            // keep color, keep up, bigger radius
            if (priority.highlight.indexOf(type) > -1) {
                return {
                    radius: Math.min(style.radius, backgroundMaxRadius)
                };
            }
            // outside focus style
            return {
                radius: Math.min(style.radius, backgroundMaxRadius),
                backgroundColor: hexToRgba(gray, backgroundOpacity),
                borderColor: hexToRgba(gray, style.opacity)
            };
        }
    }

    function getMarker(feature) {

        if (!feature.geometry || !feature.geometry.type === 'point') {
            return
        }
        let latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        console.debug('creating marker', latlng, feature);
        let markerIcon = getMarkerIcon(feature);
        if (!markerIcon) {
            return null;
        }
        // console.log('adding',feature.id,"in",mGrid.getLayers());
        let marker = L.marker(latlng, {
            icon: markerIcon,
            interactive: false,
            pane: "customMarkerPane",
            feature: feature
        });
        marker._leaflet_id = feature.id;
        return marker;
        // let circle = L.circleMarker(latlng, style);
        // console.debug('check circle',circle);
        // return circle;
    }

    // retrieve events from OTM logger
    function getEvents(bbox) {
        // boundingbox=bbox
        // loggerUrl
        let url = ('proxy').concat(qParams, '&boundingbox=', bbox);
        // let url = ('/events?').concat('boundingbox=',bbox,'&token=',token);
        http.get(url)
            .then(function (response) {
                // console.debug('getEvents, response',response.data);
                if (!response.data || !response.data.event_list) {
                    return console.error('getEvents, wrong format from OTM');
                }
                let events = response.data.event_list;
                let markers = events.reduce((r, event) => {
                    // console.debug(r,event);
                    if (!event.activity_objects || !Array.isArray(event.activity_objects) || event.activity_objects.length < 1) {
                        // console.debug('skip',r);
                        return r;
                    }
                    let tmp = Object.assign({}, event);
                    delete tmp.activity_objects;
                    let feature = Object.assign(tmp, event.activity_objects[0]);
                    let marker = getMarker(feature);
                    // console.debug('check',mGrid.hasLayer(marker));
                    if (mGrid.hasLayer(marker)) {
                        return r;
                    }
                    mGrid.addLayer(marker);
                    return r.concat(marker);
                }, []);
                // mGrid.addLayer(markers);
                // map.removeLayer(mGrid)
                // mGrid.addTo(map)
                console.debug('getEvents, markers', mGrid.getLayers());
            }).catch(function (error) {
            console.error('getEvents, errror', error);
        });
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