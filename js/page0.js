"use strict";

/* global View, dbgRect, chart_barStatesCtrl, chart_mapStatesCtrl, chart_scatterCtrl */

var page0View = new View();

page0View.gui = {
	barchartCanvas : {
		o: {x: null, y:null},
		size: {w: null, h:null},
		d3c: null
	},
	mapCanvas: {
		o: {x: null, y:null},
		size: {w: null, h:null},
		d3c: null
	},
	scatterCanvas: {
		o: {x: null, y:null},
		size: {w: null, h:null},
		d3c: null
	}
};

page0View.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'page');

	this.gui.barchartCanvas.size.w = this.cView.iw/2;
	this.gui.barchartCanvas.size.h = this.cView.ih;

	this.gui.mapCanvas.size.w = this.cView.iw/2;
	this.gui.mapCanvas.size.h = this.cView.ih/2;

	this.gui.scatterCanvas.size.w = this.cView.iw/2;
	this.gui.scatterCanvas.size.h = this.cView.ih/2;

	this.gui.barchartCanvas.o.x = 0;
	this.gui.barchartCanvas.o.y = 0;
	this.gui.mapCanvas.o.x = this.gui.barchartCanvas.size.w;
	this.gui.mapCanvas.o.y = 0;
	this.gui.scatterCanvas.o.x = this.gui.barchartCanvas.size.w;
	this.gui.scatterCanvas.o.y = this.gui.mapCanvas.size.h;

	this.gui.barchartCanvas.d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.barchartCanvas.o.x+','+this.gui.barchartCanvas.o.y+')');

	this.gui.mapCanvas.d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.mapCanvas.o.x+','+this.gui.mapCanvas.o.y+')');

	this.gui.scatterCanvas.d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.scatterCanvas.o.x+','+this.gui.scatterCanvas.o.y+')');

	this.ctrl.barchartCtrl.createView(this.gui.barchartCanvas, this.ctrl, flShow=true);
	this.ctrl.mapCtrl.createView(this.gui.mapCanvas, this.ctrl, flShow=true);
	this.ctrl.scatterCtrl.createView(this.gui.scatterCanvas, this.ctrl, flShow=true);

	this.show(flShow);
}; // end function create(...)


/******************************************************************************/


var page0Ctrl = {
	view : page0View,
	barchartCtrl: chart_barStatesCtrl,
	mapCtrl: chart_mapStatesCtrl,
	scatterCtrl: chart_scatterCtrl,
	parentCtrl: null,
	pageShown: null,

	createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
		this.pageShown = flShow;
	},

	show: function(flShow)
	{
		this.pageShown = flShow;
		View.prototype.show.call(this.view, flShow);
	},

	barHovered: function(state, flShow) {
		this.mapCtrl.simulateMapHover(state, flShow);
		this.scatterCtrl.simulateBubbleHover(state, flShow);
	},

	bubbleHovered: function(state, flShow) {
		this.mapCtrl.simulateMapHover(state, flShow);
		this.barchartCtrl.simulateBarHover(state, flShow);
	},

	mapHovered: function(state, flShow) {
		this.barchartCtrl.simulateBarHover(state, flShow);
		this.scatterCtrl.simulateBubbleHover(state, flShow);
	},

	mapStateClicked: function(state) {
		this.barchartCtrl.simulateBarClick(state);
		this.scatterCtrl.simulateBubbleClick(state);
	},

	mapAllDeactivated: function() {
		this.barchartCtrl.simulatePlotClick();
		this.scatterCtrl.simulatePlotClick();
	},

	barClicked: function(state) {
		this.mapCtrl.simulateStateClick(state);
		this.scatterCtrl.simulateBubbleClick(state);
	},

	barAllDeactivated: function() {
		this.mapCtrl.simulateMapClick();
		this.scatterCtrl.simulatePlotClick();
	},

	bubbleClicked: function(state) {
		this.mapCtrl.simulateStateClick(state);
		this.barchartCtrl.simulateBarClick(state);
	},

	scatterAllDeactivated: function() {
		this.mapCtrl.simulateMapClick();
		this.barchartCtrl.simulatePlotClick();
	},
};

/* EOF */
