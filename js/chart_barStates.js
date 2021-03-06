"use strict";

/* global d3, View, waitfor, model, drawSpinner */

var chartStatesView = new View();

chartStatesView.gui = {
	icons: {
		'asc': {d3c: null},
		'desc': {d3c: null},
		'alpha': {d3c: null},
		'details': {d3c: null}
	},

	chart: {
		xAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		yAxis: {d3c: null, BBox: {x:null, y:null, w:null, h:null}, scale:null},
		plot: {d3c:null, BBox: {x:null, y:null, w:null, h:null}}
	}
};

chartStatesView.create = function(canvas, ctrl, show=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'chartBarStates');

    this.show(show);

	function drawChart() {
		// Y-axis
		var yAxis = this.gui.chart.yAxis;
		yAxis.BBox = {x:0, y:40, h:this.cView.ih-40-40, w:40};
		yAxis.d3c = this.cView.d3c.append('g').
			attr('transform', 'translate(' + [yAxis.BBox.x + yAxis.BBox.w, yAxis.BBox.y] + ')').
			attr('class', 'axis y-axis');
		yAxis.scale = d3.scaleBand().rangeRound([0, yAxis.BBox.h]).paddingInner(0.2).paddingOuter(0);
		yAxis.scale.domain(model.tblStatesIncome.map(function(d) { return d['State']; }));
		yAxis.gen = d3.axisLeft().scale(yAxis.scale);
		yAxis.d3c.call(yAxis.gen);

		// X-axis
		var xAxis = this.gui.chart.xAxis;
		xAxis.BBox = {x:yAxis.BBox.w, y:yAxis.BBox.y+yAxis.BBox.h, h:this.cView.ih-yAxis.BBox.h,
			w:this.cView.iw-yAxis.BBox.w-40};
		xAxis.d3c = this.cView.d3c.append('g').
			attr('transform', 'translate(' + [xAxis.BBox.x, xAxis.BBox.y] + ')').
			attr('class', 'axis x-axis');
		xAxis.scale = d3.scaleLinear().range([0, xAxis.BBox.w]);
		xAxis.scale.domain([0, d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})]);
		xAxis.gen = d3.axisBottom().scale(xAxis.scale);
		xAxis.d3c.call(xAxis.gen);

		// Draw an invisible rectangle under the chart whose clicking will deactivate
		// any activated bar


		// Draw the chart itself
		var plot = this.gui.chart.plot;
		plot.BBox = {x: yAxis.BBox.w, y: yAxis.BBox.y, h: yAxis.BBox.h, w: xAxis.BBox.w};
		plot.d3c = this.cView.d3c.append('g').
			attr('transform', 'translate(' + [plot.BBox.x, plot.BBox.y] + ')').
			attr('class', 'chart chart-bar');

		plot.d3c.append('rect').attr('x', 0).attr('y', 0).
			attr('width', plot.BBox.w).attr('height', plot.BBox.h).
			style('visibility', 'hidden').
			style('pointer-events', 'all').
			on('click', function() { this.ctrl.plotClicked();}.bind(this));

		plot.d3c.selectAll(".bar").
			data(model.tblStatesIncome).
			enter().
			datum(function(d) { d.active = false; return d; }).
			append('rect').attr('class', 'bar').
			attr('y', function(d) { return yAxis.scale(d['State']); } ).
			attr('height', yAxis.scale.bandwidth()).
			attr('x', 0).
			attr('width', function(d) { return xAxis.scale(d['Per capita income']);}).
			attr('id', function(d) { return 'id-bar-state-' + d['State']; }).
			on('mouseenter', function(d) {
				this.ctrl.barHovered(d, true); }.bind(this)).
			on('mouseout', function(d) {
				this.ctrl.barHovered(d, false); }.bind(this)).
			on('click', function(d) {
				this.ctrl.barClicked(d); }.bind(this));

		// Put axis titles
		xAxis.d3c.append('text').
			attr('transform', 'translate(' + [xAxis.BBox.w/2, xAxis.BBox.h/2-15] + ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.71em').
			style('fill', 'black').
			attr('class', 'title').
			style('text-anchor', 'middle').text('Per-capita income [$]');

		yAxis.d3c.append('text').
			attr('transform', 'translate(' + [-5,5] + ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.5em').
			attr('class', 'title').
			style('fill', 'black').
			style('text-anchor', 'end').text('State');

		// Put icons
		var icon = {};
		icon.BBox = {x:60, y:20, w:15, h:15};

		this.gui.icons['asc'].d3c = this.cView.d3c.append('image').
			attr('x', icon.BBox.x).attr('y', icon.BBox.y).
			attr('class', 'icon').attr('display', 'none').
			attr('width', icon.BBox.w).attr('height', icon.BBox.h).
			attr('href','icons/sort-ascending.svg').
			on('click', function() {
				this.ctrl.hideIconTooltip();
				this.ctrl.iconSortAscClicked();
			}.bind(this)).
			on('mouseenter', function() { 
				this.ctrl.showIconTooltip('sortIncr', d3.event, icon.BBox.x, icon.BBox.y);
			}.bind(this)).
			on('mouseout', function() { this.ctrl.hideIconTooltip(); }.bind(this));

		this.gui.icons['desc'].d3c = this.cView.d3c.append('image').
			attr('x', icon.BBox.x).attr('y', icon.BBox.y).
			attr('class', 'icon').attr('display', 'none').
			attr('width', icon.BBox.w).attr('height', icon.BBox.h).
			attr('href','icons/sort-descending.svg').
			on('click', function() {
				this.ctrl.hideIconTooltip();
				this.ctrl.iconSortDescClicked();
			}.bind(this)).
			on('mouseenter', function() { 
				this.ctrl.showIconTooltip('sortDecr', d3.event, icon.BBox.x, icon.BBox.y);
			}.bind(this)).
			on('mouseout', function() { this.ctrl.hideIconTooltip(); }.bind(this));

		this.gui.icons['alpha'].d3c = this.cView.d3c.append('image').
			attr('x', icon.BBox.x).attr('y', icon.BBox.y).
			attr('class', 'icon').attr('display', 'none').
			attr('width', icon.BBox.w).attr('height', icon.BBox.h).
			attr('href','icons/sort-alpha.svg').
			on('click', function() { 
				this.ctrl.hideIconTooltip();
				this.ctrl.iconSortAlphaClicked();
			}.bind(this)).
			on('mouseenter', function() { 
				this.ctrl.showIconTooltip('sortAlpha', d3.event, icon.BBox.x, icon.BBox.y);
			}.bind(this)).
			on('mouseout', function() { this.ctrl.hideIconTooltip(); }.bind(this));

		var icon1 = {};
		icon1.BBox = {x:icon.BBox.x+30, y:icon.BBox.y, w:icon.BBox.w, h:icon.BBox.h};
		this.gui.icons['details'].d3c = this.cView.d3c.append('image').
			attr('x', icon1.BBox.x).attr('y', icon1.BBox.y).
			attr('class', 'icon-inactive').
			attr('width', icon1.BBox.w).attr('height', icon1.BBox.h).
			attr('href','icons/information-button.svg').
			on('click', function() { 
				this.ctrl.hideIconTooltip();
				this.ctrl.iconDetailsClicked();
			}.bind(this)).
			on('mouseenter', function() { 
				this.ctrl.showIconTooltip('details', d3.event, icon1.BBox.x, icon1.BBox.y);
			}.bind(this)).
			on('mouseout', function() { this.ctrl.hideIconTooltip(); }.bind(this));


		// Show the info first in descending sort (highest amount at the top)
		this.ctrl.iconSortDescClicked();

		// Show details by default
		this.ctrl.iconDetailsClicked();
		
		// Chart title
		this.cView.d3c.append('text').attr('class', 'chart-title').
			attr('x', this.cView.iw/2).attr('y', 20).
			style('text-anchor', 'middle').
			text('US states\' per-capita incomes');
		
		// Announce that the view has finished loading
		this.flViewLoaded = true;
	} // end function drawChart(...)

	var spinner = drawSpinner(this.cView);

	// Wait for data to be loaded before drawing the chart
    waitfor(this, model, model.isDataLoaded, function() { 
    	spinner.remove(); 
    	drawChart.call(this);
    });
}; // end function chartStatesView.create(...)

chartStatesView.showSortIcon = function(name) {
	['asc', 'desc', 'alpha'].forEach(function (i) {
		this.gui.icons[i].d3c.attr('display', 'none');
	}.bind(this));
	this.gui.icons[name].d3c.attr('display', 'block');
};

chartStatesView.sort = function(sort) {
	var y = this.gui.chart.yAxis,
		d3c = this.cView.d3c;

	var sorter = null;
	switch(sort) {
		case 'asc':
			sorter = function(a, b) { return a['Per capita income'] - b['Per capita income']; };
			break;
		case 'desc':
			sorter = function(a, b) { return b['Per capita income'] - a['Per capita income']; };
			break;
		case 'alpha':
			sorter = function(a, b) { return d3.ascending(a.State, b.State); };
			break;
		default:
			throw('Invalid sort');
	}

	var y0 = y.scale.domain(model.tblStatesIncome.sort(sorter).
		map(function(d) { return d.State;})).copy();

	var transition = d3c.transition().duration(500),
		delay = function(d, i) { return i * 20; };

	transition.selectAll('.bar').delay(delay).
		attr('y', function(d) { return y0(d.State); });

	transition.select('.y-axis').call(y.gen).selectAll('g').delay(delay);
}; // end function chartStatesView.sort(...)

chartStatesView.showDetails = function(d) {
	// Delete any previous annotation
	this.hideDetails();

	// We will draw on the chart plot canvas
	var d3c = this.gui.chart.plot.d3c;

	// Obtain the tip of the bar
	var y = this.gui.chart.yAxis.scale;
	var x = this.gui.chart.xAxis.scale;

	var y_coord = y(d.State);
	var x_coord = x(d['Per capita income']);

	// Draw the annotation line
	var ann = d3c.append('g').attr('class', 'bar-annotation annotation');
	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).transition().duration(500).attr('y2', (this.gui.chart.plot.BBox.h));

	// Draw the bubble
	var bubble = ann.append('g').style('opacity', 0);
	bubble.append('rect').attr('x', x_coord-25).attr('y', y_coord-35).
		attr('width', 80).attr('height', 30).
		attr('rx', 3).attr('ry', 3);

	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-20).
		text('State:  ' + d.State);
	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-10).
		text('Income: ' + d3.format(",d")(d['Per capita income']));

	bubble.transition().duration(500).style('opacity', 1);
}; // end function chartStatesView.showDetails(...)

chartStatesView.hideDetails = function() {
	this.gui.chart.plot.d3c.select('.bar-annotation').remove();
}; // end function chartStatesView.hideDetails(...)

chartStatesView.hoverBar = function(d, show) {
    var bar = this.getBar(d);

    bar.classed('hovered', show);

	this.ctrl.handleDetails(bar.datum(), show);
}; // end function chartStatesView.hoverBar(...)

chartStatesView.clickBar = function(d) {
	// If the clicked bar is not the currently active one - deactivate all
	if (d.active == false)
		this.deactivateAll();

	// Toggle the active state of the currently clicked bar
	d.active = !d.active;

	// Toggle the active/inactive hilite of the bar
	this.hiliteBar(d);
};

chartStatesView.deactivateAll = function() {
	var bar = this.gui.chart.plot.d3c.select(".active");

	if (bar.node() != null) {
		var d = bar.datum();
		d.active = false;
		this.hiliteBar(d);
	}
};


chartStatesView.hiliteBar = function(d) {
	var bar = this.getBar(d);

	bar.classed('active', d.active);
};

chartStatesView.getBar = function(d) {
	if (d instanceof String || typeof(d) === "string") {
		return this.gui.chart.plot.d3c.select('#' + 'id-bar-state-' + d);
	} else {
		return this.gui.chart.plot.d3c.select('#' + 'id-bar-state-' + d.State);
	}
};


/******************************************************************************/


var chart_barStatesCtrl = {
    view: chartStatesView,
    parentCtrl: null,
	sortType: null,
	showDetails: false,

    createView: function(d3c, parentCtrl, show) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, show);
	},

	// # >>> Icon-related events

	iconSortDescClicked: function() {
		this.sortType = 'desc';
		this.view.sort('desc');
		this.view.showSortIcon('asc');
	},

	iconSortAscClicked: function() {
		this.sortType = 'asc';
		this.view.sort('asc');
		this.view.showSortIcon('alpha');
	},

	iconSortAlphaClicked: function() {
		this.sortType = 'alpha';
		this.view.sort('alpha');
		this.view.showSortIcon('desc');
	},

	iconDetailsClicked: function() {
		this.showDetails = !this.showDetails;

		this.view.gui.icons['details'].d3c.classed('icon-active', this.showDetails);
		this.view.gui.icons['details'].d3c.classed('icon-inactive', !this.showDetails);
	},
	
	showIconTooltip: function(name, ev, targetX, targetY) {
		var txt = {'details': 'Toggle details',
				   'sortAlpha': 'Sort alphabetically',
				   'sortDecr': 'Sort decreasing',
				   'sortIncr': 'Sort increasing'};
		
		var tt = this.view.cView.d3c.append('g').attr('class', 'tooltip').
			attr('transform', 'translate(' + [targetX - 5, targetY - 25] + ')').
			style('opacity', 0);
			
		tt.transition().delay(700).duration(300).style('opacity', 1);
			
		var ttText = tt.append('text').attr('x', 5).attr('y', 5).
			text(txt[name]);
			
		var textWidth = getElementPropertyPx(ttText.node(), 'width');
		var textHeight = getElementPropertyPx(ttText.node(), 'height');
		textWidth = ttText.node().textLength.baseVal.value;
		
		ttText.attr('y', textHeight/2 + 5);

		tt.insert('rect', ':first-child').attr('x', 0).attr('y', 0).
			attr('rx', 3).attr('ry', 3).
			attr('width', textWidth + 10).attr('height', textHeight + 10);
			

	},
	
	hideIconTooltip: function() {
		this.view.cView.d3c.selectAll('.tooltip').remove();
	},

	// # <<< Icon related events

	handleDetails: function(d, show) {
		if (show && this.showDetails) {
			this.view.showDetails(d);
		} else {
			this.view.hideDetails();
		}
	},

	// # >>> Events from user's GUI actions

	barHovered: function(d, show, callParent=true) {
		this.view.hoverBar(d, show);

		if (callParent)
			// Propagate event to the parent controller so that other views can respond too
			this.parentCtrl.barHovered(d.State, show);
	},

	barClicked: function(d, callParent=true) {
		this.view.clickBar(d);

		if (callParent) {
			this.parentCtrl.barClicked(d.State);
		}
	},

	plotClicked: function(callParent=true) {
		this.view.deactivateAll();

		if (callParent)
			this.parentCtrl.barAllDeactivated();
	},

	// # <<< Events from user's GUI actions

	// # >>> Messages coming from the parent controller

	simulateBarHover: function(state, show) {
		// Something has been hilited in another view - respond here too
		var bar = this.view.getBar(state);
		this.barHovered(bar.datum(), show, false);
	},

	simulateBarClick: function(state, callParent=false) {
		// Something has been clicked in another view - respond here too
		var bar = this.view.getBar(state);
		this.barClicked(bar.datum(), callParent);
	},

	simulatePlotClick: function() {
		this.plotClicked(false);
	},
	
	isViewLoaded: function() {
		return this.view.isViewLoaded();
	}

	// # <<< Messages coming from the parent controller

}; // end var chart_barStatesCtrl

/* EOF */
