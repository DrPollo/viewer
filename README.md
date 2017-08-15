#AreaViewer

Map-based web viewer for FirstLife area-based explorer

##Usage 

AreaViewer is meant to be part of WeGovNow landingpage platform. It can be used as embed and as library. 

### Embed
AreaViewer can be included within an iframe html tag.
The initial state of AreaViewer can be partially customised including the following search parameters:

1) date <ISO date> (day of temporal queries), ISO format date to be used as temporal param in content queries (default "now")
2) c (center) \<lat:lng:zoom\> hash encoding of the centre of the map latitude, longitude and zoom level of the initial zoom level
3) contrast <boolean> to select normal or high contrast cartography
4) lang \<[ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)\> language (default agent lang if defined or "en") 

### Library
AreaViewer is a JavaScript ECMA6 module. It can be used in a html page:

Including `boundle.js` after the tag `</body>`.

```
<script src="bounde.js"></script>
```
And including `mapbox.js` style sheet in the html header:
```
<link href='node_modules/mapbox.js/theme/style.css' rel='stylesheet' />
```

The custom params can be changed inline in ``index.js``


##Install
To support the development of AreaViewer, ``gulpfile.js`` includes lives erver, ecma6 linter and browserify boundler scripts.
First, install node packages running in the project directory:
```
npm install
```
To test AreaViewer, run
```
npm test
```
###Development
To start developing launch the live server
```
npm dev
```
The live server will update ``js/bundle.js`` file.

To compile a new `boundle.js` run gulp task `js` in the project root.
```
npm build
```
##Dependencies
 - Leaflet
 - Turf js
###Development dependencies
 - gulp, gulp-util
 - browserify, watchify
 - vinyl-source-stream
 - browser-sync
##Licensing
Author: Alessio Antonini

Licence: MIT