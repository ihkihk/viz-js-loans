"use strict";

/* global d3, View, waitfor, model, drawSpinner */

var scatterView = new View();

scatterView.gui = {
	chart: {
		xAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		yAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		plot: { d3c: null, BBox: {x:null, y:null, w:null, h:null} },
	}
};

scatterView.create = function(canvas, ctrl, show=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'scatter');

    this.show(show);

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

		// X-axis
		xAxis.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + xAxis.BBox.x + ',' + xAxis.BBox.y + ')').attr('class', 'axis x-axis cont-axis');
		// Create a scale for the continuous x and y data
        xAxis.scale = d3.scaleLinear()
            .domain([d3.min(model.mapStateIncome.entries(), function(d) { return d.value;}),
			         d3.max(model.mapStateIncome.entries(), function(d) { return d.value;})])
            .range([0+bubbleRadius+2, chart.plot.BBox.w-bubbleRadius-2]);
		xAxis.gen = d3.axisBottom().scale(xAxis.scale);
		xAxis.d3c.call(xAxis.gen);

		// Y-axis
		yAxis.d3c = this.cView.d3c.append('g').
			attr('transform', 'translate(' + [yAxis.BBox.x + yAxis.BBox.w, yAxis.BBox.y] + ')').
			attr('class', 'axis y-axis cont-axis');
		yAxis.scale = d3.scaleLinear()
            .domain([d3.min(model.tblLoanState, function(d) { return d.value;}),
			         d3.max(model.tblLoanState, function(d) { return d.value;})])
            .range([chart.plot.BBox.h-bubbleRadius-2, 0+bubbleRadius+2]);
		yAxis.gen = d3.axisLeft().scale(yAxis.scale);
		yAxis.d3c.call(yAxis.gen);

		// Put axis titles
		xAxis.d3c.append('text').
			attr('transform', 'translate(' + xAxis.BBox.w/2 + ',' + (xAxis.BBox.h/2-15)+ ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.71em').
			style('fill', 'black').
			attr('class', 'title').
			style('text-anchor', 'middle').text('Per-capita income [$]');

		yAxis.d3c.append('text').
			attr('x', -50).attr('y', -15).
			attr('dy', '0.5em').
			attr('class', 'title').
			style('fill', 'black').
			style('text-anchor', 'middle').text('Average Original Loan Amount [$]').call(textWrap, 60);

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

		// Draw the Least-Square Regression Line fit
		var lsrl_x1 = xAxis.scale.range()[0],
			lsrl_x2 = xAxis.scale.range()[1],
			lsrl_y1 = yAxis.scale(model.getLSRLintercept()),
			lsrl_y2 = yAxis.scale(model.getLSRLintercept() + model.getLSRLslope() * xAxis.scale.domain()[1]);

		chart.plot.d3c.append('line').attr('class', 'fit-model-line').
			attr('x1', lsrl_x1).attr('y1', lsrl_y1).attr('x2', lsrl_x2).attr('y2', lsrl_y2);
			
		// Draw the LSRL legend
		var lsrlLegend = chart.plot.d3c.append('g').attr('class', 'legend').
			attr('transform', 'translate(' + [chart.plot.BBox.w-90, chart.plot.BBox.h-50] + ')');
		
		lsrlLegend.append('line').attr('class', 'fit-model-line').
			attr('x1', 0).attr('y1', 0).
			attr('x2', 20).attr('y2', 0);
			
		lsrlLegend.append('text').
			attr('x', 25).
			attr('y', 0).style('alignment-baseline', 'middle').
			text('LS model fit');

        // The canvas to contain the bubble mesh
        var bubbles = chart.plot.d3c.append('g').attr('class', 'bubbles').
            /*attr('clip-path', 'url(#scatter-clipPath)').*/
			append('g');

        // Draw the state bubbles
        bubbles.selectAll('circle').
            data(model.tblLoanState).
            enter().
			datum(function(d) { d.active = false; return d; }).
            append('circle').
            attr('class', 'bubble').
			attr('id', function(d) {
                return 'id-scatter-state-' + d.key;
            }).
			// X coordinate is the state's income per capita
            attr('cx', function(d) { return chart.xAxis.scale(model.mapStateIncome.get(d.key));} ).
			// Y coordinate is the state's average loan amount
			attr('cy', function(d) { return chart.yAxis.scale(d.value);} ).
			attr('r', 10).
			on('mouseenter', function(d) {
                this.ctrl.bubbleHovered(d, true);
			}.bind(this)).
            on('mouseout', function(d) {
                this.ctrl.bubbleHovered(d, false);
            }.bind(this)).
			on('click', function(d) { this.ctrl.bubbleClicked(d); }.bind(this));
			
		// Announce that the view has finished loading
		this.flViewLoaded = true;
	} // end function drawChart(...)

	var spinner = drawSpinner(this.cView);

	// Wait for data to be loaded before drawing the chart
    waitfor(this, model, model.isDataLoaded, function() { 
    	spinner.remove(); 
    	drawChart.call(this);
    });
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

	var y_coord = y(d.value);
	var x_coord = x(model.mapStateIncome.get(d.key));

	// Draw the annotation lines
	var ann = d3c.append('g').attr('class', 'scatter-annotation annotation');
	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).
		transition().duration(500).
		attr('y2', (this.gui.chart.plot.BBox.h));

	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).
		transition().duration(500).attr('x2', 0);

	// Draw the bubble
	var bubble = ann.append('g').style('opacity', 0);
	bubble.append('rect').attr('x', x_coord-25).attr('y', y_coord-50).attr('width', 80).attr('height', 40).
		attr('rx', 3).attr('ry', 3);

	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-35).
		text('State:  ' + d.key);
	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-25).
		text('Income: ' + d3.format(",d")(model.mapStateIncome.get(d.key)));
	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-15).
		text('Loan:   ' + d3.format(",d")(d.value));

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
		return this.gui.chart.plot.d3c.select('#' + 'id-scatter-state-' + p.key);
	}
};

scatterView.hoverBubble = function(d, show) {
	var bubble = this.getState(d);

	bubble.classed('hovered', show);

	this.ctrl.handleDetails(bubble.datum(), show);
};


/******************************************************************************/


var chart_scatterCtrl = {
    view: scatterView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, show) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, show);
	},

	handleDetails: function(d, show) {
		if (show) {
			this.view.showDetails(d);
		} else {
			this.view.hideDetails();
		}
	},

	// # >>> Events from user's GUI actions

	bubbleHovered: function(d, show, callParent=true) {
		this.view.hoverBubble(d, show);

		if (callParent) {
		    // Push up this event to the parent controller so that other views can respond
		    this.parentCtrl.bubbleHovered(d.key, show);
    	}
	},

    bubbleClicked: function(d, callParent=true) {
		this.view.clickBubble(d);

		if (callParent) {
			this.parentCtrl.bubbleClicked(d.key);
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

	simulateBubbleHover: function(state, show) {
		var bubble = this.view.getState(state);

        this.bubbleHovered(bubble.datum(), show, false);
    },

	simulateBubbleClick: function(state) {
		var bubble = this.view.getState(state);

		this.bubbleClicked(bubble.datum(), false);
	},

	simulatePlotClick: function() {
		this.plotClicked(false);
	},
	
	isViewLoaded: function() {
		return this.view.isViewLoaded();
	},

	// # <<< Messages coming from the parent controller
};

/* EOF */
