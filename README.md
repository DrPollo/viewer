#AreaViewer

Map-based web viewer for FirstLife area-based clusters.

##Install

```
npm install
```

##Usage
AreaViewer is a JavaScript ecma 5 module. It can be usedin a html page:


Including `boundle.js` after the tag `</body>`.

```
<script src="bounde.js"></script>
```
And including `mapbox.js` style sheet in the html header:
```
<link href='node_modules/mapbox.js/theme/style.css' rel='stylesheet' />
```

###Compile
To compile a new `boundle.js` run gulp task `js` in the project root.
```
gulp js
```
###Development
```
gulp watch
```
##Dependencies
 - Mapbox.js 
 
###Development dependencies
 - gulp, gulp-util
 - browserify, watchify
 - vinyl-source-stream
 - browser-sync
##Licensing
Author: Alessio Antonini

Licence: MIT