"use strict;"

var mapStatesView = new View();

mapStatesView.gui = {
	chart: {
		map: { d3c: null, BBox: {x:null, y:null, w:null, h:null} },
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
        var map = this.gui.chart.map;

        map.BBox = {x: 0, y: 0, w: this.cView.iw, h: this.cView.ih};

        // Create the map canvas that will contain all map elements
        map.d3c = this.cView.d3c.append('g').attr('class', 'map').
            attr('transform', 'translate(' + map.BBox.x + ', ' + map.BBox.y + ')');

		// Create a map zoomer
		this.gui.chart.zoom = d3.zoom().scaleExtent([1,16]).on('zoom', zoomed);

        // Call the map zoomer continuously on the map canvas.
        // If the drag behavior prevents the default click,
		// also stop propagation so we don't click-to-zoom.
		// Note: the click handler is set on the capturing phase!
		map.d3c.call(this.gui.chart.zoom).on('click', function() {
			if (d3.event.defaultPrevented) d3.event.stopPropagation();
		}, true);

        // Create the map path generator, based on Albers projection
        var proj = d3.geoAlbersUsa().scale(1).translate([0, 0]);
		this.gui.chart.path = d3.geoPath().projection(proj);

		// Create the map's clip-path that coincides with the map's extents
		map.d3c.
			append('clipPath').attr('id', 'map-clipPath').
			append('rect').
			attr('x', 0).attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w);

		// Create a scale for quantizing the continuous data into a pallette of choropleth colors
        var scale = d3.scaleQuantize()
            .domain([d3.min(model.tblStatesIncome, function(d) { return d['Per capita income'];}),
			         d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));


        // # >>> Find the bounds of the map and scale appropriately the projection
        // so that the map fills initially the whole viewport

        // First convert TopoJSON -> json
        var json = topojson.feature(model.topojsonUs, model.topojsonUs.objects.units);

        // ## >>> Then update the unity projection with computed scale and translation

        // Below for brevity: b=bounds, s=scale, t=translation
        var b = this.gui.chart.path.bounds(json),
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
			datum(function(d) { d.properties.active = false; return d;}).
            append('path').
            attr('class', function(d) {
                // This is the class determining the quantized color
				return scale(model.mapStateIncome.get(d.properties.name));
			}).
			classed('state', true).
            attr('id', function(d) {
                return 'id-map-state-' + model.mapStateName2Acro.get(d.properties.name);
            }).
            attr('d', this.gui.chart.path).
			on('mouseenter', function(d) { this.ctrl.mapHovered(d, true); }.bind(this)).
            on('mouseout', function(d) { this.ctrl.mapHovered(d, false); }.bind(this)).
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
	// Reset the map (usually means resetting the zoom, deactivating any
    // activated state and removing annotations).
	if (d.properties.active) {
		this.resetMap();
		return;
	}

	this.resetMap();

	// Toggle the active state of the currently clicked state
	d.properties.active = !d.properties.active;

	// Toggle the active/inactive hilite of the state
	this.hiliteState(d, d.properties.active);

	// Center the map on the newly activated state, if any
	if (d.properties.active) {
		var bounds = this.gui.chart.path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
				bbox = this.gui.chart.map.BBox,
                scale = Math.max(1, Math.min(16,
				                             0.9 / Math.max(dx / bbox.w,
				                                            dy / bbox.h))),
                translate = [bbox.w / 2 -  x * scale, bbox.h / 2 -  y * scale];

		var transform = d3.zoomTransform(this.gui.chart.map.d3c).
			translate(translate[0], translate[1]).scale(scale);

		this.gui.chart.map.d3c.transition().duration(750).
			call(this.gui.chart.zoom.transform, transform);

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
	this.gui.chart.map.d3c.select('.map-annotation').remove();

	// Deselect any selected state
	var state = this.gui.chart.map.d3c.select('.active');
	if (state.node() != null) {
		var d = state.datum();
		d.properties.active = false;
		this.hiliteState(d);
	}

	// Zoom out to scale 1
	this.gui.chart.map.d3c.transition().duration(750).
		call(this.gui.chart.zoom.transform, d3.zoomIdentity);
}; // end function mapStatesView.resetMap(...)

mapStatesView.hiliteState = function(d) {
	var state = this.getState(d);

	state.classed('active', d.properties.active);
};

mapStatesView.addDetails = function(d) {
	// Create the annotation canvas
	var ann = this.gui.chart.map.d3c.append('g').attr('class', 'map-annotation annotation').
		style('opacity', 0);

	var cx = this.gui.chart.map.BBox.w / 2,
		cy = this.gui.chart.map.BBox.h / 2;

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

mapStatesView.hoverMap = function(d, flShow) {
    var state = this.getState(d);

    state.classed('hovered', flShow);
};

mapStatesView.getState = function(p) {
	if (p instanceof String || typeof(p) === "string") {
		// The state is specified by name, e.g. "CA"
		return this.gui.chart.map.d3c.select('#' + 'id-map-state-' + p);
	} else {
		// The state is specified e.g. via its datum Object
		var state = model.mapStateName2Acro.get(p.properties.name);
		return this.gui.chart.map.d3c.select('#' + 'id-map-state-' + state);
	}
};


/******************************************************************************/


var chart_mapStatesCtrl = {
    view: mapStatesView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},

	// # >>> Events from user's GUI actions
	
    mapHovered: function(d, flShow, callParent=true) {
		this.view.hoverMap(d, flShow);

		if (callParent) {
        	// Push up this event to the parent controller so that other views can respond
			var state = model.mapStateName2Acro.get(d.properties.name);
        	this.parentCtrl.mapHovered(state, flShow);
		}
    },

    stateClicked: function(d, callParent=true) {
		this.view.clickState(d);

		if (callParent) {
			var flActive = this.view.getStateStatus(d);
			var state = model.mapStateName2Acro.get(d.properties.name);
			this.parentCtrl.mapStateClicked(state, flActive);
		}
    },

	mapClicked: function(callParent=true) {
		this.view.resetMap();

		if (callParent) {
			this.parentCtrl.mapAllDeactivated();
		}
	},

	// # <<< Events from user's GUI actions

	// # >>> Messages coming from the parent controller

	simulateMapHover: function(state, flShow) {
		var s = this.view.getState(state);
        this.mapHovered(s.datum(), flShow, callParent=false);
    },

	simulateStateClick: function(state, flActivate) {
		var s = this.view.getState(state);
		this.stateClicked(s.datum(), callParent=false);
	},

	simulateMapClick: function() {
		this.mapClicked(callParent=false);
	}

	// # <<< Messages coming from the parent controller
};

/* EOF */
