# AreaViewer

Map-based web viewer for FirstLife area-based explorer

``http://areaviewer.firstlife.org/?c=45.629059798221725:12.563289999961855:17&contrast=false&lang=en&domain=http://areaviewer.firstlife.org/``

## Usage 

AreaViewer is meant to be part of WeGovNow landingpage platform. It can be used as embed and as library. 


##### As library
If AreaViewer is imported as library

```
var areaViewer = require('../pathto/areaviwer');
// init of areaViewer
areaViewer();
```
To set html id of the map, default center, language etc. 
default params are located in ``./pathto/areaviewer/js/main.js``

##### As Embed
AreaViewer can be included within an iframe html tag.

### Initialization of areaViewer
The initial state of AreaViewer can be partially customised including the following search parameters:

1. ***domain*** (required) to setup the communication between the application and the iframe (es. domain=https://wegovnow.firstlife.org)
2. start_time and end_time UTC time (Unix Time milliseconds), interval to be considered. The default is null.
3. c (center) \<lat:lng:zoom\> hash encoding of the centre of the map latitude, longitude and zoom level of the initial zoom level
4. contrast <boolean> to select normal or high contrast cartography
5. lang \<[ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)\> language (default agent lang if defined or "en") 
6. highlight <Array<string>>, application names (es. highlight=app1,app2) of events to be highlighted (optional)
7. background <Array<string>>, application names of events to be displayed as context (optional)
8. exclude <Array<string>>, application names of events to be excluded (optional)
9. interactive <boolean> (default true), sets focus mode behaviour: enable/disables the display of the list of contents and layout change

### Interacting with areaViewer

areaViewer sends messages about its current state, and expects messages to trigger state changes. 
For instance, it is possible to switch the current language sending a message ``areaViewer.setLang`` with params ``{lang:'it'}``.

Messages are handled internally (js) and then dispatched to externally (to the top window).
It is possible to catch js events as follows:

```
var eventName = "areaViewer.***the event you wish to catch***";
document.addEventListener(eventName,function (e) {
        console.debug(eventName,e.detail);
        // getting event param in e.detail
        doStuff(e.detail);
    });
```

Triggering a change in current state can be archived creating a new event:
```
var detail = {/* action params */};
var event = new CustomEvent(eventName, {detail: detail });
// console.debug('broadcasting',eventName,event.detail);
document.dispatchEvent(event);
```

Following the list of supported events: 
##### Getting state changes (reading the current state)
- ``areaViewer.focusOn``: ``{bounds: <array>, id:<string>, features: <geoJSON features>, content: <array> }``
- ``areaViewer.explore``: ``{<empty>}``
- ``areaViewer.position``: ``{c:<hash lat:lng:zoom>, date{from,to}, priority: {highlight, background, exclude}}``

##### Triggering state changes (changing the current state)
- ``areaViewer.setView``: ``{lat:<float>,lng:<float>,zoom<1-20>}`` change map viewPort
- ``areaViewer.setBounds``: ``{[sw.lat,sw.lon,ne.lat,ne.lon]}`` change map viewport
- ``areaViewer.setContrast``: ``{contrast:<boolean>}`` change map base layer
- ``areaViewer.setLanguage``: ``{lang:<string>}`` change language available languages: ``['en','it']``
- ``areaViewer.setDate``: ``{from:<isoDate>,to:<isoDate>}`` change time interval of the events query
- ``areaViewer.setPriority``: ``{highlight:[<string>],background:[<string>],exclude:[<string>]}`` change the rendering of events
- ``areaViewer.focusTo``: ``{id:<integer/string>}`` enter focus mode on area id
- ``areaViewer.toExplore``: ``{null}`` exit from focus
- ``areaViewer.setInteractive``: ``{interactive:<boolean>}`` changes focus behaviour enabling/disabling the layout change and content rendering


##### Priority params

Priority params are meant to custom the visualisation of events within areaViewer:
 - highlight: what should be prominent (colored, icons and bigger)
 - background: what is less relevant (small, gray and no icons)
 - exclude: what should not be rendered
 

### Install
To support the development of AreaViewer, ``gulpfile.js`` includes lives erver, ecma6 linter and browserify boundler scripts.
First, install node packages running in the project directory:
```
npm install
```
To test AreaViewer, run
```
npm test
```
### Development
To start developing launch the live server
```
npm dev
```
The live server will update ``js/bundle.js`` file.

To compile a new `boundle.js` run gulp task `js` in the project root.
```
npm build
```

#### Build distributions

1. ``js/main.js`` > change ``env`` variable
2. ``gulp minify --name=<dist_name>`` to generate ``dist/dist_name/bundle.js`` file 

#### Dependencies
 - LeafletJS
 - Turf.js
 - Rx/js

#### Development dependencies
 - gulp, gulp-util
 - browserify, watchify
 - babel
 - vinyl-source-stream
 - browser-sync

#### Licensing
Author: Alessio Antonini

Licence: MIT