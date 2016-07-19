"use strict;"

var mapStatesView = new View();

mapStatesView.gui = {
	map: {
		body: { d3c: null, BBox: {x:null, y:null, w:null, h:null} },
		path: null,
		zoom: null
	}
};

mapStatesView.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'mapStates');

	dbgRect(this.cView.d3c, 0, 0, this.cView.iw, this.cView.ih, 'green');

    this.show(flShow);

	function drawChart() {
        var map = this.gui.map.body;

        map.BBox = {x: 0, y: 0, w: this.cView.iw, h: this.cView.ih};

        // Create the map canvas that will contain all map elements
        map.d3c = this.cView.d3c.append('g').attr('class', 'map').
            attr('transform', 'translate(' + map.BBox.x + ', ' + map.BBox.y + ')');

		// Create a map zoomer
		this.gui.map.zoom = d3.zoom().scaleExtent([1,16]).on('zoom', zoomed);

        // And call it continuously on the map canvas
        // TODO: Is stopPropagation needed? It is at least for the barchart.
		map.d3c.call(this.gui.map.zoom).on('click', stopPropagation, true);

		function stopPropagation() {
			if (d3.event.defaultPrevented) d3.event.stopPropagation();
		}

        // Create the map path generator, based on Albers projection
        var proj = d3.geoAlbersUsa().scale(1).translate([0, 0]);
		this.gui.map.path = d3.geoPath().projection(proj);

		// Create the map's clip-path that coincides with the map's extents
		map.d3c.
			append('clipPath').attr('id', 'map-clipPath').
			append('rect').
			attr('x', 0).attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w);

		// Create a scale for quantizing the continuous data into a pallette of choropleth colors
        map.scale = d3.scaleQuantize()
            .domain([d3.min(model.tblStatesIncome, function(d) { return d['Per capita income'];}),
			         d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));


        // # >>> Find the bounds of the map and scale appropriately the projection
        // so that the map fills initially the whole viewport

        // First convert TopoJSON -> json
        var json = topojson.feature(model.topojsonUs, model.topojsonUs.objects.units);

        // ## >>> Then update the unity projection with computed scale and translation

        // Below for brevity: b=bounds, s=scale, t=translation
        var b = this.gui.map.path.bounds(json),
            dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1],
            s = 0.95 / Math.max(dx / map.BBox.w, dy / map.BBox.h),
            t = [(map.BBox.w - s * (b[1][0] + b[0][0])) / 2,
                 (map.BBox.h - s * (b[1][1] + b[0][1])) / 2];

        proj.scale(s).translate(t);

        // ## <<<
        // # <<<

		// Create a rectangle that serves both as the map border and
        // as transparent background. Clicking the latter resets the zoom.
        map.d3c.append('rect').attr('class', 'map-border').
			attr('x', 0).attr('y', 0).
            attr('height', map.BBox.h).attr('width', map.BBox.w).
			style('fill', 'none').
            style('pointer-events','all').
			on('click', function(d) { this.ctrl.mapClicked(); }.bind(this));

        // The canvas to contain the cartography mesh
        var carto = map.d3c.append('g').attr('class', 'states').
            attr('clip-path', 'url(#map-clipPath)').append('g');

        // Draw the states
        carto.selectAll('path').
            data(json.features).
            enter().
            append('path').
            attr('class', function(d) {
                // This is the class determining the quantized color
				return map.scale(model.mapStateIncome.get(d.properties.name));
			}).
			classed('state', true).
            attr('id', function(d) {
                return 'id-map-state-' + model.mapStateName2Acro.get(d.properties.name);
            }).
            attr('d', this.gui.map.path).
			on('mouseenter', function(d) {
                var stateAcro = model.mapStateName2Acro.get(d.properties.name);
				this.ctrl.mapHovered(stateAcro, true);
			}.bind(this)).
            on('mouseout', function(d) {
                var stateAcro = model.mapStateName2Acro.get(d.properties.name);
                this.ctrl.mapHovered(stateAcro, false);
            }.bind(this)).
			on('click', function(d) { this.ctrl.stateClicked(d); }.bind(this));


		function zoomed() {
			carto.style("stroke-width", 1.5 / d3.event.transform.k + "px").
				attr("transform", d3.event.transform);
		};
    } // end function drawChart(...)

    // Wait for data to be loaded
    function waitfor(that, obj, checkfunc, callback) {
        while (checkfunc.call(obj) == false) {
            setTimeout(waitfor, 500, that, obj, checkfunc, callback);
			return;
        }
        drawChart.call(that);
    };

    waitfor(this, model, model.isDataLoaded, drawChart);
}; // end function mapStatesView.create(...)


mapStatesView.clickState = function(d) {
    // Detect the case when the state has never been activated before, so
    // that we can add the "active" attribute.
	if (d.properties.active == undefined) {
		d.properties.active = false;
	}

	// Reset the map (usually means resetting the zoom, deactivating any
    // activated state and removing annotations).
	this.resetMap();

	// Toggle the active state of the currently clicked state
	d.properties.active = !d.properties.active;

	// Toggle the active/inactive hilite of the state
	this.toggleStateHilite(d, d.properties.active);

	// Center the map on the newly activated state, if any
	if (d.properties.active) {
		var bounds = this.gui.map.path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
				bbox = this.gui.map.body.BBox,
                scale = Math.max(1, Math.min(16,
				                             0.9 / Math.max(dx / bbox.w,
				                                            dy / bbox.h))),
                translate = [bbox.w / 2 -  x * scale, bbox.h / 2 -  y * scale];

		var transform = d3.zoomTransform(this.gui.map.body.d3c).
			translate(translate[0], translate[1]).scale(scale);

		this.gui.map.body.d3c.transition().duration(750).
			call(this.gui.map.zoom.transform, transform);

		// Place an annotation
		this.addDetails(d);
	};
};

mapStatesView.getStateStatus = function(d) {
	return !(d.properties.active == undefined ||
		d.properties.active == false);
};

mapStatesView.resetMap = function() {
	// Remove all map annotations
	this.gui.map.body.d3c.select('.map-annotation').remove();

	// Deselect any selected state
	var active = this.gui.map.body.d3c.select('.active');
	if (active.node() != null) {
		this.toggleStateHilite(active.datum(), flActivate=false);
		this.ctrl.notifyOtherCtrlStateClicked(active.datum(), false);
	}

	// Zoom out to scale 1
	this.gui.map.body.d3c.transition().duration(750).
		call(this.gui.map.zoom.transform, d3.zoomIdentity);
}; // end function mapStatesView.resetMap(...)

mapStatesView.toggleStateHilite = function(d, flActivate) {
	var state = this.auxSelectState(d);

	state.classed('active', flActivate);
};

mapStatesView.addDetails = function(d) {
	// Create the annotation canvas
	var ann = this.gui.map.body.d3c.append('g').attr('class', 'map-annotation annotation').
		style('opacity', 0);

	var cx = this.gui.map.body.BBox.w / 2,
		cy = this.gui.map.body.BBox.h / 2;

	// Add bubble
	var bubble = ann.append('rect').attr('x', cx-50).attr('y', cy-15).
		attr('width', 100).attr('height', 30).
		attr('rx', 3).attr('ry', 3);

	// Add text
	ann.append('text').attr('x', cx-45).attr('y', cy-5).
		text('State:  ' + model.mapStateName2Acro.get(d.properties.name));
	ann.append('text').attr('x', cx-45).attr('y', cy+5).
		text('Income: ' + "DEADBEEF");

	ann.transition().delay(750).duration(500).style('opacity', 1);
};

mapStatesView.auxSelectState = function(p) {
	var filter = null;

	if (p instanceof String || typeof(p) === "string") {
		// The state is specified by name, e.g. "CA"

		// If name is acro, first expand it
		if (p.length == 2) p = model.mapStateName2Full.get(p);

		filter = function(d) { return d.properties.name == p; };
	} else {
		// The state is specified e.g. via its datum Object
		filter = function(d) { return d.properties.name == p.properties.name; }
	}

	return this.gui.map.body.d3c.selectAll('.state').filter(filter);
};

mapStatesView.simulateMapHover = function(state, flShow) {
    var state = this.gui.map.body.d3c.select('#' + 'id-map-state-' + state);

    state.classed('hovered', flShow);
};


/******************************************************************************/


var chart_mapStatesCtrl = {
    view: mapStatesView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},

    mapHovered: function(state, flShow) {
        // Push up this event to the parent controller so that other views can respond
        this.parentCtrl.mapHovered(state, flShow);
    },

    simulateMapHover: function(state, flShow) {
        this.view.simulateMapHover(state, flShow);
    },

    stateClicked: function(d) {
		this.view.clickState(d);
		var flActive = this.view.getStateStatus(d);

		this.notifyOtherCtrlStateClicked(d, flActive);
    },

	notifyOtherCtrlStateClicked: function(d, flActive) {
		this.parentCtrl.mapStateClicked(model.mapStateName2Acro.get(d.properties.name), flActive);
	},

	simulateStateClick: function(state, flActivate) {
		var state = this.view.auxSelectState(state);

		this.view.clickState(state.datum());
	},

	mapClicked: function() {
		this.view.resetMap();

		this.parentCtrl.mapAllDeactivated();
	},

	simulateMapClick: function() {
		this.view.resetMap();
	}

};

/* EOF */
