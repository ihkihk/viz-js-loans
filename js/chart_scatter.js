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
			on('click', function(d) { this.ctrl.chartClicked(); }.bind(this));

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
			attr('r', 10).
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

	this.deactivateBubbles();

	// Toggle the active state of the currently clicked state
	d.active = !d.active;

	// Toggle the active/inactive hilite of the state
	this.toggleBubbleHilite(d, d.active);

};

scatterView.deactivateBubbles = function() {
	this.gui.chart.body.d3c.selectAll('.bubble.active').classed('active', false);
};

scatterView.getBubbleStatus = function(d) {
	return !(d.active == undefined ||
		d.active == false);
};

scatterView.toggleBubbleHilite = function(d, flActivate) {
	var bubble = this.auxSelectState(d);

	bubble.classed('active', flActivate);
};

scatterView.showDetails = function(state) {
	// Select the bubble for the given state
	var datum = this.cView.d3c.selectAll('.bubble').filter(function(d) {
		return d.name == state;
	}).datum();

	// Delete any previous annotation
	this.hideDetails();

	// We will draw on the chart body canvas
	var d3c = this.gui.chart.body.d3c;

	// Obtain the tip of the bar
	var y = this.gui.chart.yAxis.scale;
	var x = this.gui.chart.xAxis.scale;

	y_coord = y(datum.loan);
	x_coord = x(datum.income);

	// Draw the annotation lines
	var ann = d3c.append('g').attr('class', 'scatter-annotation annotation');
	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).transition().duration(500).attr('y2', (this.gui.chart.body.BBox.h));

	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).transition().duration(500).attr('x2', 0);

	// Draw the bubble
	var bubble = ann.append('g').style('opacity', 0);
	bubble.append('rect').attr('x', x_coord-25).attr('y', y_coord-35).attr('width', 80).attr('height', 30).
		attr('rx', 3).attr('ry', 3);

	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-20).text('State:  ' + datum.name)
	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-10).text('Income: ' + datum.income);

	bubble.transition().duration(500).style('opacity', 1);
}; // end function scatterView.showDetails(...)

scatterView.hideDetails = function() {
	this.gui.chart.body.d3c.select('.scatter-annotation').remove();
}; // end function scatterView.hideDetails(...)

scatterView.auxSelectState = function(p) {
	var filter = null;

	if (p instanceof String || typeof(p) === "string") {
		// The state is specified by name, e.g. "CA"

		// If name is full, first convert to acro
		if (p.length > 2) p = model.mapStateName2Acro.get(p);

		filter = function(d) { return d.name == p; };
	} else {
		// The state is specified e.g. via its datum Object
		filter = function(d) { return d.name == p.name; }
	}

	return this.gui.chart.body.d3c.selectAll('.bubble').filter(filter);
};

scatterView.simulateChartHover = function(state, flShow) {
	var bubble = this.gui.chart.body.d3c.select('#' + 'id-scatter-state-' + state);

	bubble.classed('hovered', flShow);

	this.ctrl.handleDetails(state, flShow);
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

    bubbleHovered: function(state, flShow) {
        // Push up this event to the parent controller so that other views can respond
        this.parentCtrl.bubbleHovered(state, flShow);

		this.handleDetails(state, flShow);
    },

	handleDetails: function(state, flShow) {
		if (flShow) {
			this.view.showDetails(state);
		} else {
			this.view.hideDetails();
		}
	},

    simulateBubbleHover: function(state, flShow) {
        this.view.simulateChartHover(state, flShow);
    },

    bubbleClicked: function(d) {
		this.view.clickBubble(d);
		var flActive = this.view.getBubbleStatus(d);

		this.notifyOtherCtrlBubbleClicked(d, flActive);
    },

	notifyOtherCtrlBubbleClicked: function(d, flActive) {
		this.parentCtrl.bubbleClicked(d.name, flActive);
	},

	simulateBubbleClick: function(state, flActivate) {
		var bubble = this.view.auxSelectState(state);

		this.view.clickBubble(bubble.datum());
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
