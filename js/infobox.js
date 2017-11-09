/**
 * Created by drpollo on 19/09/2017.
 */
module.exports = (status, map, idInfoBox, idFeatureBox, idMapBox, idFeatureHeader, utils, defLang) => {
    const $ = require('jquery');
    const moment = require('moment');

    // dom node id "label"
    const infoBox = $("#" + idInfoBox);
    const featureBox = $('#' + idFeatureBox);
    const featureHeader = $('#'+idFeatureHeader);

    const mapBox = $('#' + idMapBox);

    // mapBox.on('map-container-resize', function () {
    //     setTimeout(map.invalidateSize,400); // doesn't seem to do anything
    // });

    // interactive mode enable/disable features rendering at focus
    let interactive = true;

    const typeLabels = {
        'city_block': {
            "en": "City block",
            "it": "Isolato"
        },
        'quartieri': {
            "en": "Neighbourhood",
            "it": "Quartiere"
        },
        "site": {
            "en": "Outdoor place",
            "it": "Spazio esterno"
        },
        "tile": {
            "en": "Area",
            "it": "Area"
        }
    };

    infoBox.empty();


    const tooltipLabel = {
        it: 'Click sulla mappa per esplorare',
        en: 'Click the map to explore'
    };
    const tooltipCancel = {
        it: "Indietro",
        en: 'Back'
    };
    const locateLabel = {
        it: "Localizza:",
        en: "Locate:"
    };
    const goToLabel = {
        it: "Vai a:",
        en: "Go to:"
    };
    const headerText = {
      empty:{
          it: "Nessun contenuto",
          en: "No contents yet"
      },
      full:{
          it: "Contenuti",
          en: "Contents"
      }
    };
    // def lang
    let currentLang = defLang;

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
        if (currentLang === lang) {
            return;
        }
        // set new labels
        console.debug('to setup current language', lang);
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
        if (!feature && !label) {
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
        if (feature) {
            // feature.name
            // feature.type
            label = parseLabel(feature);
            // console.debug('init infobox label',label);
        }
        // bottone per uscire dal focus
        let cancelButton = '<button class="mdl-button mdl-js-button mdl-button--icon" id="exitFocus" title="' + tooltipCancel[currentLang] + '"><i class="material-icons">clear</i></button>';
        // creo nodo con bottone e label
        let defaultLabel = $('<div id="label">' + cancelButton.concat('<span class="placeName">', label, '</span></div>'));
        // svuoto
        infoBox.empty();
        // aggiungo la label
        infoBox.append(defaultLabel);
        // init listner
        initExitListner();

        console.debug('label: ',label, 'from feature: ' ,feature);
    };


    /*
     * Exit button: back to explore
     */
    const exitHandler = () => {
        console.debug('click to exit from focus mode');
        status.restore();
    };
    const initExitListner = () => {
        if (!document.getElementById('exitFocus')) {
            return;
        }
        document.getElementById('exitFocus').addEventListener('click', exitHandler);
    };
    const removeExitListner = () => {
        if (!document.getElementById('exitFocus')) {
            return;
        }
        document.getElementById('exitFocus').removeEventListener('click', exitHandler);
    };

    // change interactivity settings
    status.observe.filter(state => 'interactive' in state).map(state => state.interactive).subscribe(newInter => {
        interactive = newInter;
    });

    // focus
    status.observe.filter(state => 'content' in state).map(state => state.content).subscribe((content) => {
        // clear
        featureBox.empty();
        // if featurebox disabled: exit
        if (interactive === 'false' || interactive === false) {
            return;
        }
        console.debug('add content to featurebox', content, interactive);
        // append features to featurebox
        // sorting contents from newer to older
        content.sort((a, b) => {
            return a.timestamp >= b.timestamp;
        }).forEach((entry) => {
            let e = parseEntry(entry);
            // console.debug('check entry to append',e);
            if (e) {
                featureBox.append(e);
                document.getElementById(entry.id).addEventListener('click',()=>{map.goToLocationByID(entry.id)});
            }
        });
        setFocusHeader(content);
    });




    // parsing label infobox
    function parseLabel(feature) {
        let label = "";
        let type = feature.type.toLowerCase();
        switch (type) {
            case 'city_block':
                label = label.concat(typeLabels['city_block'][lang]);
                break;
            case 'quartieri':
                label = label.concat(typeLabels['quartieri'][lang]);
                break;
            case 'site':
                label = label.concat(typeLabels['site'][lang]);
                break;
            case 'tile':
                label = label.concat(typeLabels['tile'][lang]);
            default:
                break;
        }
        if (typeof feature.name !== "undefined" && feature.type !== feature.name) {
            if(label !== ""){
                label = label.concat(": ");
            }
            label = label.concat(feature.name);
        }

        return label;
    }

    // parsing and building content entries
    function parseEntry(entry) {
        console.debug("check entry",entry);
        let i = '<li class="mdl-list__item mdl-list__item--two-line"><span class="mdl-list__item-primary-content">';
        let c = '</li>';
        let name = null;

        // icon
        let icon = utils.getIcon(entry);
        i = i.concat('<i class="material-icons mdl-list__item-icon">', icon, '</i>');


        if (entry.properties.name || entry.properties.hasName || entry.details.name) {
            name = entry.properties.name || entry.properties.hasName || entry.details.name;
            let titleName = name;
            // if there is an URI >  action: go to content
            if (entry.properties.reference_external_url || entry.properties.external_url) {
                let url = entry.properties.reference_external_url || entry.properties.external_url;
                titleName = ("").concat('<a title="',goToLabel[currentLang],' ',name,'" class="mdl-list__item-secondary-action" target="_top" href="', url, '">',name,'</a>');
            }

            i = i.concat('<span class="name">', titleName, '</span>');
        }
        // timestamp > UTC, calculate duration
        if (entry.timestamp) {
            let duration = moment.duration(moment() - moment(entry.timestamp)).humanize();
            i = i.concat('<span class="mdl-list__item-sub-title">', duration, '</span>');
        }

        // action: locate marker
        let url = entry.properties.reference_external_url || entry.properties.external_url;
        c = ('</span>').concat('<span class="mdl-list__item-secondary-content">',
            '<button id="',entry.id,'" title="',locateLabel[currentLang]," ",name,'" class="mdl-list__item-secondary-action mdl-button mdl-js-button mdl-button--accent">',
            '<i class="material-icons">',
            'location_searching',
            '</i>',
            '</button></span>', c);

        // if it has a name
        if (name) {
            return i.concat(c);
        }

        return null;
    }

    function setFocusHeader(content) {
        // clear header
        featureHeader.empty();
        // default header
        if(!content || typeof content === 'undefined' || content.length < 1){
           return featureHeader.append('<span>'+headerText.empty[currentLang]+'</span>');
        }
        // todo build header
        return featureHeader.append('<span>'+headerText.full[currentLang]+'</span>');
    }



    // inits
    // init tooltip
    initFocusLabel();
};