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
		body: {d3c:null, BBox: {x:null, y:null, w:null, h:null}}
	}
};

chartStatesView.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'chartBarStates');

	dbgRect(this.cView.d3c, 0, 0, this.cView.iw, this.cView.ih, 'green');

    this.show(flShow);

	function drawChart() {
		// Y-axis
		var yAxis = this.gui.chart.yAxis;
		yAxis.BBox = {x:0, y:40, h:this.cView.ih-40-40, w:40};
		yAxis.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + (yAxis.BBox.x + yAxis.BBox.w) + ',' + yAxis.BBox.y + ')').attr('class', 'axis y-axis');
		/*yAxis.d3c.append('line').attr('x1', yAxis.BBox.w).attr('x2', yAxis.BBox.w).
			attr('y1', 0).attr('y2', yAxis.BBox.h);*/
		yAxis.scale = d3.scaleBand().rangeRound([0, yAxis.BBox.h]).paddingInner(0.2).paddingOuter(0);
		yAxis.scale.domain(model.tblStatesIncome.map(function(d) { return d['State']; }));
		yAxis.gen = d3.axisLeft().scale(yAxis.scale);
		yAxis.d3c.call(yAxis.gen);

		// X-axis
		var xAxis = this.gui.chart.xAxis;
		xAxis.BBox = {x:yAxis.BBox.w, y:yAxis.BBox.y+yAxis.BBox.h, h:this.cView.ih-yAxis.BBox.h,
			w:this.cView.iw-yAxis.BBox.w-40};
		xAxis.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + xAxis.BBox.x + ',' + xAxis.BBox.y + ')').attr('class', 'axis x-axis');
		/*xAxis.d3c.append('line').attr('x1', 0).attr('x2', xAxis.BBox.w).
			attr('y1', 0).attr('y2', 0);*/
		xAxis.scale = d3.scaleLinear().range([0, xAxis.BBox.w]);
		xAxis.scale.domain([0, d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})]);
		xAxis.gen = d3.axisBottom().scale(xAxis.scale);
		xAxis.d3c.call(xAxis.gen);

		// Draw an invisible rectangle under the chart whose clicking will deactivate
		// any activated bar


		// Draw the chart itself
		var body = this.gui.chart.body;
		body.BBox = {x: yAxis.BBox.w, y: yAxis.BBox.y, h: yAxis.BBox.h, w: xAxis.BBox.w};
		body.d3c = this.cView.d3c.append('g').attr('transform', 'translate(' + body.BBox.x + ',' + body.BBox.y + ')').attr('class', 'chart chart-bar');

		body.d3c.append('rect').attr('x', 0).attr('y', 0).
			attr('width', body.BBox.w).attr('height', body.BBox.h).
			style('visibility', 'hidden').
			style('pointer-events', 'all').
			on('click', function() { this.ctrl.bodyClicked();}.bind(this));

		body.d3c.selectAll(".bar").data(model.tblStatesIncome).enter().
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

		// This is really needed (I don't understand why), but without it
		// the bars get activated on click and then immediately lose
		// their active status
		body.d3c.on('click', stopPropagation, true);

		function stopPropagation() {
			if (d3.event.defaultPrevented) d3.event.stopPropagation();
		}

		// Put axis titles
		xAxis.d3c.append('text').
			attr('transform', 'translate(' + xAxis.BBox.w/2 + ',' + (xAxis.BBox.h/2-15)+ ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.71em').
			style('fill', 'black').
			attr('class', 'title').
			style('text-anchor', 'middle').text('Per-capita income [$]');

		yAxis.d3c.append('text').
			attr('transform', 'translate(' + (-5) + ',' + (5)+ ')').
			attr('x', 0).attr('y', 0).
			attr('dy', '0.5em').
			attr('class', 'title').
			style('fill', 'black').
			style('text-anchor', 'end').text('State');

		// Put icons
		var icon = {};
		icon.BBox = {x:100, y:20, w:15, h:15};

		this.gui.icons['asc'].d3c = this.cView.d3c.append('image').
			attr('x', icon.BBox.x).attr('y', icon.BBox.y).
			attr('class', 'icon').attr('display', 'none').
			attr('width', icon.BBox.w).attr('height', icon.BBox.h).
			attr('href','icons/sort-ascending.svg').
			on('click', function() { this.ctrl.iconSortAscClicked();}.bind(this));

		this.gui.icons['desc'].d3c = this.cView.d3c.append('image').
			attr('x', icon.BBox.x).attr('y', icon.BBox.y).
			attr('class', 'icon').attr('display', 'none').
			attr('width', icon.BBox.w).attr('height', icon.BBox.h).
			attr('href','icons/sort-descending.svg').
			on('click', function() { this.ctrl.iconSortDescClicked();}.bind(this));

		this.gui.icons['alpha'].d3c = this.cView.d3c.append('image').
			attr('x', icon.BBox.x).attr('y', icon.BBox.y).
			attr('class', 'icon').attr('display', 'none').
			attr('width', icon.BBox.w).attr('height', icon.BBox.h).
			attr('href','icons/sort-alpha.svg').
			on('click', function() { this.ctrl.iconSortAlphaClicked();}.bind(this));

		var icon1 = {};
		icon1.BBox = {x:icon.BBox.x+50, y:icon.BBox.y, w:icon.BBox.w, h:icon.BBox.h};
		this.gui.icons['details'].d3c = this.cView.d3c.append('image').
			attr('x', icon1.BBox.x).attr('y', icon1.BBox.y).
			attr('class', 'icon-inactive').
			attr('width', icon1.BBox.w).attr('height', icon1.BBox.h).
			attr('href','icons/information-button.svg').
			on('click', function() { this.ctrl.iconDetailsClicked();}.bind(this));


		// Show the info first in descending sort (highest amount at the top)
		this.ctrl.iconSortDescClicked();

		// Show details by default
		this.ctrl.iconDetailsClicked();
	};

    // Wait for data to be loaded
    function waitfor(that, obj, checkfunc, callback) {
        while (checkfunc.call(obj) == false) {
            setTimeout(waitfor, 500, that, obj, checkfunc, callback);
			return;
        }
        drawChart.call(that);
    };

    waitfor(this, model, model.isDataLoaded, drawChart);
}; // end function chartStatesView.create(...)

chartStatesView.showSortIcon = function(name) {
	['asc', 'desc', 'alpha'].forEach(function (i) {
		this.gui.icons[i].d3c.attr('display', 'none');
	}.bind(this));
	this.gui.icons[name].d3c.attr('display', 'block');
};

chartStatesView.sort = function(sort) {
	var y = this.gui.chart.yAxis,
		d3c = this.cView.d3c,
		body_d3c = this.gui.chart.body.d3c,
		yAxis_d3c = this.gui.chart.yAxis.d3c;

	var sorter = null;
	switch(sort) {
		case 'asc':
			sorter = function(a, b) { return a['Per capita income'] - b['Per capita income']; }
			break;
		case 'desc':
			sorter = function(a, b) { return b['Per capita income'] - a['Per capita income']; }
			break;
		case 'alpha':
			sorter = function(a, b) { return d3.ascending(a.State, b.State); }
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

chartStatesView.showDetails = function(datum) {
	// Select the bar containing datum
	var bar = this.cView.d3c.selectAll('.bar').filter(function(d) {
		return d.State == datum.State;
	});

	// Delete any previous annotation
	this.hideDetails();

	// We will draw on the chart body canvas
	var d3c = this.gui.chart.body.d3c;

	// Obtain the tip of the bar
	var y = this.gui.chart.yAxis.scale;
	var x = this.gui.chart.xAxis.scale;

	y_coord = y(datum.State);
	x_coord = x(datum['Per capita income']);

	// Draw the annotation line
	var ann = d3c.append('g').attr('class', 'bar-annotation annotation');
	ann.append('line').attr('x1', x_coord).attr('y1', y_coord).
		attr('x2', x_coord).attr('y2', y_coord).transition().duration(500).attr('y2', (this.gui.chart.body.BBox.h));

	// Draw the bubble
	var bubble = ann.append('g').style('opacity', 0);
	bubble.append('rect').attr('x', x_coord-25).attr('y', y_coord-35).attr('width', 80).attr('height', 30).
		attr('rx', 3).attr('ry', 3);

	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-20).text('State:  ' + datum.State)
	bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-10).text('Income: ' + datum['Per capita income']);

	bubble.transition().duration(500).style('opacity', 1);
}; // end function chartStatesView.showDetails(...)

chartStatesView.hideDetails = function() {
	this.gui.chart.body.d3c.select('.bar-annotation').remove();
}; // end function chartStatesView.hideDetails(...)

chartStatesView.simulateBarHover = function(state, flShow) {
    var bar = this.gui.chart.body.d3c.select('#' + 'id-bar-state-' + state);

    bar.classed('hovered', flShow);

	this.ctrl.handleDetails(bar.datum(), flShow);
}; // end function chartStatesView.simulateBarHover(...)

chartStatesView.simulateBarClick = function(state, flShow) {
	var bar = this.auxSelectBar(state);

	bar.classed('active', flShow);
};

chartStatesView.clickBar = function(d) {

	if (d.active == undefined) {
		d.active = false;
	}

	this.deactivateBar();

	// Toggle the active state of the currently clicked bar
	d.active = !d.active;

	// Toggle the active/inactive hilite of the bar
	this.toggleBarHilite(d, d.active);
};

chartStatesView.deactivateBar = function() {
	var active = this.gui.chart.body.d3c.select(".active");

	if (active.node() != null) {
		this.toggleBarHilite(active.datum(), flActivate=false);
		this.ctrl.notifyOtherCtrlBarClicked(active.datum(), false);
	}
};

chartStatesView.getBarStatus = function(d) {
	return d.active;
}

chartStatesView.toggleBarHilite = function(d, flActivate) {
	var bar = this.auxSelectBar(d);

	bar.classed('active', flActivate);
}

chartStatesView.auxSelectBar = function(d) {
	if (d instanceof String || typeof(d) === "string") {
		return this.gui.chart.body.d3c.select('#' + 'id-bar-state-' + d);
	} else {
		return this.gui.chart.body.d3c.select('#' + 'id-bar-state-' + d.State);
	}
};

/******************************************************************************/


var chart_barStatesCtrl = {
    view: chartStatesView,
    parentCtrl: null,
	sort: null,
	details: false,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},

	iconSortDescClicked: function() {
		this.sort = 'desc';
		this.view.sort('desc');
		this.view.showSortIcon('asc');
	},

	iconSortAscClicked: function() {
		this.sort = 'asc';
		this.view.sort('asc');
		this.view.showSortIcon('alpha');
	},

	iconSortAlphaClicked: function() {
		this.sort = 'alpha';
		this.view.sort('alpha');
		this.view.showSortIcon('desc');
	},

	iconDetailsClicked: function() {
		this.details = !this.details;

		this.view.gui.icons['details'].d3c.classed('icon-active', this.details);
		this.view.gui.icons['details'].d3c.classed('icon-inactive', !this.details);
	},

	barHovered: function(d, flShow) {
		// Propagate event to the parent controller so that other views can respond too
		this.parentCtrl.barHovered(d.State, flShow);

		this.handleDetails(d, flShow);
	},

	handleDetails: function(d, flShow) {
		if (flShow && this.details) {
			this.view.showDetails(d);
		} else {
			this.view.hideDetails();
		}
	},

	barClicked: function(d) {
		this.view.clickBar(d);
		var flActive = this.view.getBarStatus(d);

		this.notifyOtherCtrlBarClicked(d, flActive);
	},

	notifyOtherCtrlBarClicked: function(d, flActive) {
		this.parentCtrl.barStateClicked(d.State, flActive);
	},

	bodyClicked: function() {
		this.view.deactivateBar();

		this.parentCtrl.barAllDeactivated();
	},

	simulateBarHover: function(state, flShow) {
		// Something has been hilited in another view - respond here too
		this.view.simulateBarHover(state, flShow);
	},

	simulateBarClick: function(state, flShow) {
		// Something has been hilited in another view - respond here too
		this.view.simulateBarClick(state, flShow);
	},

	simulateBodyClick: function() {
		this.view.deactivateBar();
	}

}; // end var chart_barStatesCtrl
