_Author: (c) Ivailo Kassamakov 2016_  
_Last update: 16-Jul-2016_

# GUI concepts

**Note:** Below we use frequently the concept of a GUI object. When used unqualified, _object_ will mean _GUI object_. To avoid misunderstanding, the term _object_ used in its programming language meaning will always be qualified, e.g. like this _JS-object_.

## Low-level GUI concepts

GUIs consist of GUI objects organized in a tree-like layout hierarchy.
This hierarchy is enabled by the capability of objects to nest other objects, forming parent-child relationships. Parent objects clip children objects. Hiding a parent object hides also its children.

GUI objects can be functionally divided into two categories:
* Containers
* Elements

Containers serve only to group hierarchically and layout their child elements. Unlike elements, its possible that they don't have a graphical representation.

Note that this division is relative since all elements can become containers. Here we reserve the term _container_ primarily for non-visual objects used to organize their children.

The inner content of the objects can be surrounded by a border with a certain thickness, separated from the inner content by the amount of any __padding__.

Objects have a rectangular __BorderBox__. Its dimensions indicate the outermost extents of the object's graphical representation. The BorderBox clips the graphical representation of any children objects.

Objects have a __bounding box__ (BBox). Its dimensions indicate the outermost extents of the objects. The BBox can coincide with or extend beyond (by the amount of any __margins__) the BorderBox of the object. The BBox is used to calculate the object's position in its container's layout.

When objects overlap each other, their visibility is determined by their __Z-order__. Note that in SVG the Z-order is implicitly specified by the order of drawing of the elements.

## Computing GUI object geometry

All objects are specified by the following rectangular dimensions (aka *object geometry*), listed in an outward direction from the object's center:

* _Internal width and height_ - these are the dimensions of the object's contents (or the total BBox of all of its children).

* _Paddings_ - these are the inward distances from the object's border to the BBoxes of its children.

* _Border thicknesses_ - these are thicknesses of the strokes forming the four object borders.

* _BorderBox width and height_ - these are the total dimensions of the object's BorderBox, which equal the sum of all elements above.

* _Margins_ - these are the outward distances (in each direction) from the object's border to the BBoxs of its left/right/top/bottom neighbors, or the padding of its container object.

* _BBox width and height_ - these are the total dimensions of the object's BBox, which equals the sum of the BorderBox and the Margins. An object needs a canvas of at least this size to draw fully.

Object geometries are represented by a JS-object that has the following general form:

```javascript
var geom = {
    o: {x, y}  // The origin of the BBox (the offset of its upper-left corner) to the origin of its canvas
    iw, ih // The internal width and height
    bt: {t,b,l,r} // The top/bottom/left/right border thicknesses respectively
    p: {t,b,l,r} // These are the top/bottom/left/right padding respectively
    bw, bh, // The width and height of the BorderBox (the graphical representation)
    m: {t,b,l,r} // These are the top/bottom/left/right margins respectively
    w, h // These are the total width and height
    z // The Z order of the object inside of its container
}
```

The BorderBox and BBox dimensions are calculated as follows:
* bw = iw + bt.l + bt.r + p.l + p.r
* bh = ih + bt.t + bt.b + p.t + p.b
* w = bw + m.l + m.r
* h = bh + m.t + m.b


## High-level GUI organization

GUIs are organized in Views. Views can contain sub-Views in a parent-child relationship. Views can overlap or completely replace other Views.

Views consist of general GUI objects and/or sub-Views.

Each View is drawn on its own **Canvas**. In this case the views are drawn with SVG elements, and the canvases are SVG `<g>` elements.

The top-level Views are drawn onto a canvas coinciding with the top-level `<svg>` element.

Following the **MVC** architectural pattern, each View is managed by its own pair of `View-Controller` JS-objects. The interaction between these JS-objects are as follows:
* The Controller creates the View
* The View draws itself
* All GUI events from the View are managed by the Controller
* The View and its Controller know each other
* The two Controllers of a View and its sub-View know each other

On creation, a sub-View receives from its parent View a canvas and canvas size (width and length).

The canvas size is the total BBox for the sub-view. Any sub-View margins, border thicknesses and paddings are to be calculated inward from this BBox!

The canvas is created by the parent View in the form of an SVG `<g>` element with any appropriate `class` and `id` attributes. The sub-View can add more classes to the `class` attribute, but it cannot change/add the `id` attribute.

_EOF_
