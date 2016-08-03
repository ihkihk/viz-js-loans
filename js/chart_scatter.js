"use strict";

/* global d3, View, dbgRect, model */

var scatterView = new View();

scatterView.gui = {
	chart: {
		xAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		yAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		plot: { d3c: null, BBox: {x:null, y:null, w:null, h:null} },
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
		chart.plot.BBox = {x: yAxis.BBox.w, y: yAxis.BBox.y, h: yAxis.BBox.h, w: xAxis.BBox.w};

		yAxis.d3c = this.cView.d3c.append('g').
			attr('transform', 'translate(' + [yAxis.BBox.x + yAxis.BBox.w, yAxis.BBox.y] + ')').
			attr('class', 'axis y-axis cont-axis');
		yAxis.scale = d3.scaleLinear()
            .domain([d3.min(model.tblLoanIncome, function(d) { return d.loan;}),
			         d3.max(model.tblLoanIncome, function(d) { return d.loan;})])
            .range([chart.plot.BBox.h-bubbleRadius-2, 0+bubbleRadius+2]);
		yAxis.gen = d3.axisLeft().scale(yAxis.scale);
		yAxis.d3c.call(yAxis.gen);

		// X-axis

		xAxis.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + xAxis.BBox.x + ',' + xAxis.BBox.y + ')').attr('class', 'axis x-axis cont-axis');
		// Create a scale for the continuous x and y data
        xAxis.scale = d3.scaleLinear()
            .domain([d3.min(model.tblLoanIncome, function(d) { return d.income;}),
			         d3.max(model.tblLoanIncome, function(d) { return d.income;})])
            .range([0+bubbleRadius+2, chart.plot.BBox.w-bubbleRadius-2]);
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

        //chart.plot.BBox = {x: 0, y: 0, w: this.cView.iw, h: this.cView.ih};

        chart.plot.d3c = this.cView.d3c.append('g').attr('class', 'scatter').
            attr('transform', 'translate(' + chart.plot.BBox.x + ', ' + chart.plot.BBox.y + ')');

		// Create the chart clip-path that coincides with the chart's extents
		// (just in case one day we decide to make the chart zoomable)
		chart.plot.d3c.
			append('clipPath').attr('id', 'scatter-clipPath').
			append('rect').
			attr('x', 0).attr('y', 0).attr('height', chart.plot.BBox.h).attr('width', chart.plot.BBox.w);



		// Create a rectangle that serves to catch all clicks outside of bubbles
        chart.plot.d3c.append('rect').attr('class', 'scatter-border').
			attr('x', 0).attr('y', 0).attr('height', chart.plot.BBox.h).attr('width', chart.plot.BBox.w).
			style('fill', 'none').style('pointer-events', 'all').
			on('click', function(d) { this.ctrl.plotClicked(); }.bind(this));

        // The canvas to contain the bubble mesh
        var bubbles = chart.plot.d3c.append('g').attr('class', 'bubbles').
            /*attr('clip-path', 'url(#scatter-clipPath)').*/
			append('g');

        // Draw the states
        bubbles.selectAll('circle').
            data(model.tblLoanIncome).
            enter().
			datum(function(d) { d.active = false; return d; }).
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
			attr('r', 10).
			on('mouseenter', function(d) {
                this.ctrl.bubbleHovered(d, true);
			}.bind(this)).
            on('mouseout', function(d) {
                this.ctrl.bubbleHovered(d, false);
            }.bind(this)).
			on('click', function(d) { this.ctrl.bubbleClicked(d); }.bind(this));
	} // end function drawChart(...)

    // Wait for data to be loaded
    function waitfor(that, obj, checkfunc, callback) {
        while (checkfunc.call(obj) == false) {
            setTimeout(waitfor, 500, that, obj, checkfunc, callback);
			return;
        }
        drawChart.call(that);
    }

    waitfor(this, model, model.isDataLoaded, drawChart);
}; // end function mapStatesView.create(...)


scatterView.clickBubble = function(d) {
	// If the clicked bar is not the currently active one - deactivate all
	if (d.active == false)
		this.deactivateAll();

	// Toggle the active state of the currently clicked bar
	d.active = !d.active;

	// Toggle the active/inactive hilite of the bar
	this.hiliteBubble(d);
};

scatterView.deactivateAll = function() {
	var bubble = this.gui.chart.plot.d3c.select(".bubble.active");

	if (bubble.node() != null) {
		var d = bubble.datum();
		d.active = false;
		this.hiliteBubble(d);
	}
};

scatterView.hiliteBubble = function(d) {
	var bubble = this.getState(d);

	bubble.classed('active', d.active);
};

scatterView.showDetails = function(d) {
	// Delete any previous annotation
	this.hideDetails();

	// We will draw on the chart plot canvas
	var d3c = this.gui.chart.plot.d3c;

	// Obtain the tip of the bar
	var y = this.gui.chart.yAxis.scale;
	var x = this.gui.chart.xAxis.scale;

	var y_coord = y(d.loan);
	var x_coord = x(d.income);

	// Draw the annotation lines
	var ann = d3c.append('g').attr('class', 'scatter-annotation annotation');
	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).transition().duration(500).attr('y2', (this.gui.chart.plot.BBox.h));

	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).transition().duration(500).attr('x2', 0);

	// Draw the bubble
	var bubble = ann.append('g').style('opacity', 0);
	bubble.append('rect').attr('x', x_coord-25).attr('y', y_coord-35).attr('width', 80).attr('height', 30).
		attr('rx', 3).attr('ry', 3);

	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-20).text('State:  ' + d.name);
	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-10).text('Income: ' + d.income);

	bubble.transition().duration(500).style('opacity', 1);
}; // end function scatterView.showDetails(...)

scatterView.hideDetails = function() {
	this.gui.chart.plot.d3c.select('.scatter-annotation').remove();
}; // end function scatterView.hideDetails(...)

scatterView.getState = function(p) {
	if (p instanceof String || typeof(p) === "string") {
		// The state is specified by name, e.g. "CA"

		// If name is full, first convert to acro
		if (p.length > 2)
			p = model.mapStateName2Acro.get(p);

		return this.gui.chart.plot.d3c.select('#' + 'id-scatter-state-' + p);
	} else {
		// The state is specified e.g. via its datum Object
		return this.gui.chart.plot.d3c.select('#' + 'id-scatter-state-' + p.name);
	}
};

scatterView.hoverBubble = function(d, flShow) {
	var bubble = this.getState(d);

	bubble.classed('hovered', flShow);

	this.ctrl.handleDetails(bubble.datum(), flShow);
};

scatterView.getBubbleStatus = function(d) {
	return d.active;
};


/******************************************************************************/


var chart_scatterCtrl = {
    view: scatterView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},

	handleDetails: function(d, flShow) {
		if (flShow) {
			this.view.showDetails(d);
		} else {
			this.view.hideDetails();
		}
	},

	// # >>> Events from user's GUI actions

	bubbleHovered: function(d, flShow, callParent=true) {
		this.view.hoverBubble(d, flShow);

		if (callParent) {
		    // Push up this event to the parent controller so that other views can respond
		    this.parentCtrl.bubbleHovered(d.name, flShow);
    	}
	},

    bubbleClicked: function(d, callParent=true) {
		this.view.clickBubble(d);

		if (callParent) {
			var flActive = this.view.getBubbleStatus(d);
			this.parentCtrl.bubbleClicked(d.name, flActive);
		}
    },

	plotClicked: function(callParent=true) {
		this.view.deactivateAll();

		if (callParent) {
			this.parentCtrl.scatterAllDeactivated();
		}
	},

	// # <<< Events from user's GUI actions

	// # >>> Messages coming from the parent controller

	simulateBubbleHover: function(state, flShow) {
		var bubble = this.view.getState(state);

        this.bubbleHovered(bubble.datum(), flShow, false);
    },

	simulateBubbleClick: function(state, flActivate) {
		var bubble = this.view.getState(state);

		this.bubbleClicked(bubble.datum(), false);
	},

	simulatePlotClick: function() {
		this.plotClicked(false);
	}

	// # <<< Messages coming from the parent controller
};

/* EOF */