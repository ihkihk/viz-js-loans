"use strict;"

var scatterView = new View();

scatterView.gui = {
	chart: {
		xAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		yAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		body: { d3c: null, BBox: {x:null, y:null, w:null, h:null} },
	}
};

scatterView.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'scatter');

	dbgRect(this.cView.d3c, 0, 0, this.cView.iw, this.cView.ih, 'green');

    this.show(flShow);

	function drawChart() {
        var chart = this.gui.chart;
		var bubbleRadius = 10;
		
		// Y-axis
		var yAxis = chart.yAxis;
		yAxis.BBox = {x:0, y:45, h:this.cView.ih-45-40, w:45};
		
		var xAxis = this.gui.chart.xAxis;
		xAxis.BBox = {x:yAxis.BBox.w, y:yAxis.BBox.y+yAxis.BBox.h, h:this.cView.ih-yAxis.BBox.h,
			w:this.cView.iw-yAxis.BBox.w-40};
			
		// The chart can take the whole area of the view
		chart.body.BBox = {x: yAxis.BBox.w, y: yAxis.BBox.y, h: yAxis.BBox.h, w: xAxis.BBox.w};
		
		yAxis.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + (yAxis.BBox.x + yAxis.BBox.w) + ',' + yAxis.BBox.y + ')').attr('class', 'axis y-axis cont-axis');
		yAxis.scale = d3.scaleLinear()
            .domain([d3.min(model.tblLoanIncome, function(d) { return d.loan;}),
			         d3.max(model.tblLoanIncome, function(d) { return d.loan;})])
            .range([chart.body.BBox.h-bubbleRadius-2, 0+bubbleRadius+2]);
		yAxis.gen = d3.axisLeft().scale(yAxis.scale);
		yAxis.d3c.call(yAxis.gen);

		// X-axis
		
		xAxis.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + xAxis.BBox.x + ',' + xAxis.BBox.y + ')').attr('class', 'axis x-axis cont-axis');
		// Create a scale for the continuous x and y data
        xAxis.scale = d3.scaleLinear()
            .domain([d3.min(model.tblLoanIncome, function(d) { return d.income;}),
			         d3.max(model.tblLoanIncome, function(d) { return d.income;})])
            .range([0+bubbleRadius+2, chart.body.BBox.w-bubbleRadius-2]);
		xAxis.gen = d3.axisBottom().scale(xAxis.scale);
		xAxis.d3c.call(xAxis.gen);
		
		// Put axis titles
		xAxis.d3c.append('text').
			attr('transform', 'translate(' + xAxis.BBox.w/2 + ',' + (xAxis.BBox.h/2-15)+ ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.71em').
			style('fill', 'black').
			attr('class', 'title').
			style('text-anchor', 'middle').text('Per-capita income [$]');

		yAxis.d3c.append('text').
			attr('transform', 'translate(' + (-2) + ',' + (0)+ ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.5em').
			attr('class', 'title').
			style('fill', 'black').
			style('text-anchor', 'end').text('Loan [$]');
			
        //chart.body.BBox = {x: 0, y: 0, w: this.cView.iw, h: this.cView.ih};

        chart.body.d3c = this.cView.d3c.append('g').attr('class', 'scatter').
            attr('transform', 'translate(' + chart.body.BBox.x + ', ' + chart.body.BBox.y + ')');

		// Create the chart clip-path that coincides with the chart's extents
		// (just in case one day we decide to make the chart zoomable)
		chart.body.d3c.
			append('clipPath').attr('id', 'scatter-clipPath').
			append('rect').
			attr('x', 0).attr('y', 0).attr('height', chart.body.BBox.h).attr('width', chart.body.BBox.w);



		// Create a rectangle that serves to catch all clicks outside of bubbles 
        chart.body.d3c.append('rect').attr('class', 'scatter-border').
			attr('x', 0).attr('y', 0).attr('height', chart.body.BBox.h).attr('width', chart.body.BBox.w).
			style('fill', 'none').style('pointer-events', 'all').
			on('click', function(d) { this.ctrl.mapClicked(); }.bind(this));

        // The canvas to contain the bubble mesh
        var bubbles = chart.body.d3c.append('g').attr('class', 'bubbles').
            /*attr('clip-path', 'url(#scatter-clipPath)').*/
			append('g');

        // Draw the states
        bubbles.selectAll('circle').
            data(model.tblLoanIncome).
            enter().
            append('circle').
            attr('class', 'bubble'/*function(d) {
                // This is the class determining the quantized color
				return map.scale(model.mapStateIncome.get(d.properties.name));
			}*/).
			attr('id', function(d) {
                return 'id-scatter-state-' + d.name;
            }).
            attr('cx', function(d) { return chart.xAxis.scale(d.income);} ).
			attr('cy', function(d) { return chart.yAxis.scale(d.loan);} ).
			attr('r', 10).style('fill', 'lightBlue').
			style('opacity', 0.6).
			style('pointer-events', 'all').
			style('stroke', 'black').
			on('mouseenter', function(d) {
                this.ctrl.bubbleHovered(d.name, true);
			}.bind(this)).
            on('mouseout', function(d) {
                this.ctrl.bubbleHovered(d.name, false);
            }.bind(this)).
			on('click', function(d) { this.ctrl.bubbleClicked(d); }.bind(this));


/*		function zoomed() {
			carto.style("stroke-width", 1.5 / d3.event.transform.k + "px").
				attr("transform", d3.event.transform);
		};*/
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


scatterView.clickBubble = function(d) {

	if (d.active == undefined) {
		d.active = false;
	}

	// Reset zoom. This will also deactivate any active state
	// and remove annotations
//	this.resetZoom();

	// Toggle the active state of the currently clicked state
	d.active = !d.active;

	// Toggle the active/inactive hilite of the state
	this.toggleStateHilite(d, d.active);

	// Center the map on the newly activated state, if any
/*	if (d.active) {
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
	};*/
};

scatterView.getBubbleStatus = function(d) {
	return !(d.active == undefined ||
		d.active == false);
};
/*
mapStatesView.resetZoom = function() {
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
};*/

scatterView.toggleBubbleHilite = function(d, flActivate) {
	//var state = this.auxSelectState(d);

	//state.classed('active', flActivate);
};
/*
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
};*/
/*
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
};*/

scatterView.simulateChartHover = function(state, flShow) {
    //var state = this.gui.map.body.d3c.select('#' + 'id-map-state-' + state);

    //state.classed('hovered', flShow);
};


/******************************************************************************/


var chart_scatterCtrl = {
    view: scatterView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},

    bubbleHovered: function(state, flShow) {
        // Push up this event to the parent controller so that other views can respond
        //this.parentCtrl.mapHovered(state, flShow);
    },

    simulateBubbleHover: function(state, flShow) {
        this.view.simulateChartHover(state, flShow);
    },

    bubbleClicked: function(d) {
		//this.view.clickState(d);
		//var flActive = this.view.getStateStatus(d);

		this.notifyOtherCtrlBubbleClicked(d, flActive);
    },

	notifyOtherCtrlBubbleClicked: function(d, flActive) {
		//this.parentCtrl.mapStateClicked(model.mapStateName2Acro.get(d.properties.name), flActive);
	},

	simulateBubbleClick: function(state, flActivate) {
		//var state = this.view.auxSelectState(state);

		//this.view.clickState(state.datum());
	},

	chartClicked: function() {
		//this.view.resetZoom();

		//this.parentCtrl.mapAllDeactivated();
	},

	simulateChartClick: function() {
		//this.view.resetZoom();
	}

};

/* EOF */
