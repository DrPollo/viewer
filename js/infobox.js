/**
 * Created by drpollo on 19/09/2017.
 */
module.exports = (status, map, idInfoBox, idFeatureBox, idMapBox) => {
    const $ = require('jquery');
    const moment = require('moment');

    // dom node id "label"
    const infoBox = $("#"+idInfoBox);
    const featureBox = $('#'+idFeatureBox);
    const mapBox = $('#'+idMapBox);
    // mapBox.on('map-container-resize', function () {
    //     setTimeout(map.invalidateSize,400); // doesn't seem to do anything
    // });
    infoBox.empty();


    const tooltipLabel = {
        it : 'Click sulla mappa per esplorare',
        en : 'Click the map to explore'
    };
    const tooltipCancel = {
        it : "Indietro",
        en : 'Back'
    };
    // def lang
    let currentLang = 'en';

    // current label
    let label = null;


    /*
     * Listner cambio di stato
     */
    // onFocus fill infobox
    status.observe.filter(state => 'features' in state).map(state => state.features[0].properties).subscribe(feature => {
        // update infobox
        // console.debug('to update infobox',feature);
        // init infobox
        initFocusLabel(feature);
    });
    // reset del focus
    status.observe.filter(state => 'reset' in state).subscribe(() => {
        label = null;
        // init infobox
        initFocusLabel();
    });
    // set current language
    status.observe.filter(state => 'lang' in state).map(state => state.lang).subscribe(lang => {
        if(currentLang === lang){ return; }
        // set new labels
        console.debug('to setup current language',lang);
        currentLang = lang;
        // init infobox
        initFocusLabel();
    });


    /*
     * manipolazione dom infobox
     */

    // init tooltip text
    const initFocusLabel = (feature) => {
        // default: no feature > empty infobox
        if(!feature && !label){
            // rimuovo il listner del pulsante exit
            removeExitListner();
            // rimozione del label
            infoBox.empty();
            // aggiungo il tooltip
            // infoBox.append($('<span>'+tooltipLabel[currentLang]+'</span>'));
            return;
        }

        // gestisco la creazione della label
        // se ho una nuova feature aggiorno label
        if(feature && feature.name) {
            // feature.name
            // feature.type
            label = (feature.type && feature.type !== feature.name ? feature.type+": " : "").concat(feature.name);
            // console.debug('init infobox label',label);
        }
        // bottone per uscire dal focus
        let cancelButton = '<button class="mdl-button mdl-js-button mdl-button--icon" id="exitFocus" title="'+tooltipCancel[currentLang]+'"><i class="material-icons">clear</i></button>';
        // creo nodo con bottone e label
        let defaultLabel = $('<div id="label">'+cancelButton.concat('<span class="placeName">',label,'</span></div>'));
        // svuoto
        infoBox.empty();
        // aggiungo la label
        infoBox.append(defaultLabel);
        // init listner
        initExitListner();
    };





    /*
     * Exit button: back to explore
     */
    const exitHandler = () => {
        console.debug('click to exit from focus mode');
        status.restore();
    };
    const initExitListner = () => {
        if(!document.getElementById('exitFocus')){ return; }
        document.getElementById('exitFocus').addEventListener('click',exitHandler);
    };
    const removeExitListner = () => {
        if(!document.getElementById('exitFocus')){ return; }
        document.getElementById('exitFocus').removeEventListener('click',exitHandler);
    };

    // todo reset size map in explorer


    status.observe.filter(state => 'content' in state).map(state => state.content).subscribe((content) => {
        console.debug('add content to featurebox',content);
        // append features to featurebox
        featureBox.empty();
        // sorting contents from newer to older
        content.sort((a,b) => {return a.timestamp >= b.timestamp;}).forEach((entry) => {
            let e = parseEntry(entry);
            // console.debug('check entry to append',e);
            if(e){
                featureBox.append(e);
            }
        });
    });

    function parseEntry(entry){
        let i = '<li class="mdl-list__item mdl-list__item--two-line"><span class="mdl-list__item-primary-content">';
        let c = '</li>';
        let name = null;

        if(entry.properties.hasType) {
            let icon = null;
            let type = entry.properties.hasType.toLowerCase();
            // console.debug('type?',type);
            switch(type){
                case 'school': icon = 'school'; break;
                default:
                    icon = 'room';
            }
            // icon
            if(icon){
                i = i.concat('<i class="material-icons mdl-list__item-icon">',icon,'</i>');
            }
        }
        if(entry.activity_type) {
            // todo parse and lang
            let activity = entry.activity_type;
        }

        if(entry.properties.name || entry.properties.hasName || entry.details.name) {
            name = entry.properties.name || entry.properties.hasName || entry.details.name;
            i = i.concat('<span class="name">',name,'</span>');
        }
        // timestamp > UTC, calculate duration
        if(entry.timestamp){
            let duration = moment.duration(moment() - moment(entry.timestamp)).humanize();
            i = i.concat('<span class="mdl-list__item-sub-title">',duration,'</span>');
        }

        // action: go to content
        if(entry.properties.external_url){
            let url = entry.properties.external_url;
            c = ('</span>').concat('<span class="mdl-list__item-secondary-content">',
                '<a class="mdl-list__item-secondary-action" href="',url,'">',
                '<i class="material-icons">',
                'launch',
                '</i>',
                '</a></span>',c);
        }

        // if it has a name
        if(name){
            return i.concat(c);
        }

        return null;
    }


    // inits
    // init tooltip
    initFocusLabel();
};