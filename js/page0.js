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
}
page0View.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'page');

	dbgRect(this.cView.d3c, 0, 0, this.cView.iw, this.cView.ih, 'green');

	// Create the scatter plot
	this.gui.scatterCanvas.size.w = this.cView.iw/2;
	this.gui.scatterCanvas.size.h = this.cView.ih/2;

	this.gui.barchartCanvas.size.w = this.cView.iw/2;
	this.gui.barchartCanvas.size.h = this.cView.ih;

	this.gui.mapCanvas.size.w = this.cView.iw/2;
	this.gui.mapCanvas.size.h = this.cView.ih/2;

	this.gui.barchartCanvas.o.x = 0;
	this.gui.barchartCanvas.o.y = 0;
	this.gui.mapCanvas.o.x = this.gui.barchartCanvas.size.w;
	this.gui.mapCanvas.o.y = 0;
	this.gui.scatterCanvas.o.x = this.gui.barchartCanvas.size.w;
	this.gui.scatterCanvas.o.y = this.gui.mapCanvas.size.w;

	this.gui.barchartCanvas.d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.barchartCanvas.o.x+','+this.gui.barchartCanvas.o.y+')');

	this.gui.mapCanvas.d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.mapCanvas.o.x+','+this.gui.mapCanvas.o.y+')');

	this.gui.scatterCanvas.d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.scatterCanvas.o.x+','+this.gui.scatterCanvas.o.y+')');

	this.ctrl.barchartCtrl.createView(this.gui.barchartCanvas, this.ctrl, flShow=true);
	this.ctrl.mapCtrl.createView(this.gui.mapCanvas, this.ctrl, flShow=true);
	//this.ctrl.scatterCtrl.createView(this.gui.barchartCanvas, this.ctrl, flShow=true);

	this.show(flShow);
}; // end function create(...)

var page0Ctrl = {
	view : page0View,
	barchartCtrl: chart_barStatesCtrl,
	mapCtrl: chart_mapStatesCtrl,
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
	}
};
