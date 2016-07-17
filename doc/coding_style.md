_Author: (c) Ivailo Kassamakov 2016_  
_Last update: 16-Jul-2016_

# Coding style guidelines

## Abbreviations

* Btn - button
* Ctrl - controller
* `geom` object properties:  
   oX, oY - offsetX/Y,  
   iw, ih - internal width/height,  
   bt, p - boundary thickness, padding,  
   bw, bh - BorderBox width/height,   
   m - margin,   
   w, h - BBox width/height,   
   t, b, l, r - top, bottom, left, right  

## Naming conventions

### General
* VO - verb-object, e.g. readFile()
* OA - object-attribute, e.g. fileSize
* prototypes - CamelCase
* functions, objects, attributes - camelCase

### Concrete
* View objects - e.g. page0View, storyView
* Controller objects - e.g. page0Ctrl, mainCtrl
* GUI container objects - e.g. cRibbon
* GUI canvas objects - d3c (meaning they are already d3-selected elements, ready to receive .append(), etc.)

_EOF_
