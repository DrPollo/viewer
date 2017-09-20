/**
 * Created by drpollo on 19/09/2017.
 */
module.exports = (status, idNode) => {
    const $ = require('jquery');
    // dom node id "label"
    const infoBox = $("#"+idNode);
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
    // todo onFocus fill infobox
    status.observe.filter(state => 'features' in state).map(state => state.features[0].properties).subscribe(feature => {
        // update infobox
        console.debug('to update infobox',feature);
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
            label = (feature.type ? feature.type+": " : "").concat(feature.name);
            console.debug('init infobox label',label);
        }
        // bottone per uscire dal focus
        let cancelButton = '<button id="exitFocus" title="'+tooltipCancel[currentLang]+'">&#x2715;</button>';
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





    // inits
    // init tooltip
    initFocusLabel();
};