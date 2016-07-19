var storyView = new View();

storyView.butId = ['viz-story-button-1', 'viz-story-button-2', 'viz-story-button-3'];

storyView.gui = {
	btn: {
		bw: 162, bh: 100,
		w: null, h: null,
		m: {t: 0, b: 0, l: 0, r: 0},
		p: {t: 2, b: 2, l: 2, r: 2}
	},
	distBtn2Btn: 250,
 	distRibbon2Page: 10,
	pageViewCanvas: [
		{
			o: {x: null, y: null},
			d3c: null,
			size: {w: null, y: null}
		},
		{
		o: {x: null, y: null},
		d3c: null,
		size: {w: null, y: null}
		},
		{
		o: {x: null, y: null},
		d3c: null,
		size: {w: null, y: null}
		}
	],
	cRibbon: {
		o: {x: null, y: null},
		iw: null, ih: null,
		bw: null, bh: null,
		w: null, h: null,
		m: {t: 5, b: 5, l: 5, r: 5},
		p: {t: 0, b: 0, l: 0, r: 0},
		d3c: null,
		d3c_outer: null
	},
}; // end storyView.gui{...}

storyView.cView = {
	iw: null, ih: null,
	bt: null,
	bw: null, bh: null,
	w: null, w: null,
	m: {t: 10, b: 10, l: 10, r: 10},
	p: {t: 5, b: 5, l: 5, r: 5},
	d3c_outer: null,
	d3c: null
};

storyView.create = function(canvas, ctrl)
{
	View.prototype.create.call(this, canvas, ctrl, 'story');

	this.show(true);

	this.createButtonRibbon();
	this.createPages();
}; // end function create(...)

storyView.createButtonRibbon = function() {
	// # >>> Calculate geometries

	// Calculate BBox of a button
	this.gui.btn.w = this.gui.btn.bw + this.gui.btn.m.l + this.gui.btn.m.r;
 	this.gui.btn.h = this.gui.btn.bh + this.gui.btn.m.t + this.gui.btn.m.b;

	// Calculate BBox of the button ribbon
	this.gui.cRibbon.iw = 3 * this.gui.btn.w + 2 * this.gui.distBtn2Btn;
	this.gui.cRibbon.bw = this.gui.cRibbon.iw +
		this.gui.cRibbon.p.l + this.gui.cRibbon.p.r;
	this.gui.cRibbon.ih = this.gui.btn.h;
	this.gui.cRibbon.bh = this.gui.cRibbon.ih +
		this.gui.cRibbon.p.t + this.gui.cRibbon.p.b;
	this.gui.cRibbon.w = this.gui.cRibbon.bw +
		this.gui.cRibbon.m.l + this.gui.cRibbon.m.r;
	this.gui.cRibbon.h = this.gui.cRibbon.bh +
		this.gui.cRibbon.m.t + this.gui.cRibbon.m.b;

	// Calculate offset of the ribbon from the origin of the canvas
 	this.gui.cRibbon.o.x = (this.cView.iw - this.gui.cRibbon.w) / 2;
	this.gui.cRibbon.o.y = 0;

	// Calculate offsets of the buttons from the origin of the ribbon
	var btnDeltaX = this.gui.btn.w + this.gui.distBtn2Btn;
	var btnBBoxOrigins = [
		{x: 0 * btnDeltaX, y: 0},
		{x: 1 * btnDeltaX, y: 0},
		{x: 2 * btnDeltaX, y: 0}
	];

	var btnDrawOrigins = [
		{x: btnBBoxOrigins[0].x + this.gui.btn.m.l, y: btnBBoxOrigins[0].y + this.gui.btn.m.t},
		{x: btnBBoxOrigins[1].x + this.gui.btn.m.l, y: btnBBoxOrigins[1].y + this.gui.btn.m.t},
		{x: btnBBoxOrigins[2].x + this.gui.btn.m.l, y: btnBBoxOrigins[2].y + this.gui.btn.m.t},
	];

	// # <<< Calculate geometries

	// Create a canvas for the button ribbon
	this.gui.cRibbon.d3c_outer = this.cView.d3c.append('g').
		attr('class', 'brdbox-story-btn-ribbon').
		attr('transform', 'translate(' + (this.gui.cRibbon.o.x + this.gui.cRibbon.m.l) + ', ' +
			(this.gui.cRibbon.o.y + this.gui.cRibbon.m.t) + ')');

	this.gui.cRibbon.d3c = this.gui.cRibbon.d3c_outer.append('g').
		attr('class', 'content-story-btn-ribbon').
		attr('transform', 'translate(' + (this.gui.cRibbon.p.l) + ', ' +
			(this.gui.cRibbon.p.t) + ')');

	// # >>> Draw the buttons

	drawTextButton(this.gui.cRibbon.d3c,
		btnDrawOrigins[0].x, btnDrawOrigins[0].y, this.gui.btn.bw, this.gui.btn.bh,
		'Which state takes highest loans', 'story-button', this.butId[0],
		function() { this.ctrl.selectPage(0); }.bind(this));

	drawTextButton(this.gui.cRibbon.d3c,
		btnDrawOrigins[1].x, btnDrawOrigins[1].y, this.gui.btn.bw, this.gui.btn.bh,
		'Which profession takes highest loans', 'story-button', this.butId[1],
		function() { this.ctrl.selectPage(1); }.bind(this));

	drawTextButton(this.gui.cRibbon.d3c,
		btnDrawOrigins[2].x, btnDrawOrigins[2].y, this.gui.btn.bw, this.gui.btn.bh,
		'Which people default on their loans', 'story-button', this.butId[2],
		function() { this.ctrl.selectPage(2); }.bind(this));

	// # <<< Draw the buttons

	// >>> TODO: Remove this debug code
	dbgRect(this.cView.d3c, this.gui.cRibbon.o.x, this.gui.cRibbon.o.y, this.gui.cRibbon.w, this.gui.cRibbon.h);
	dbgRect(this.gui.cRibbon.d3c, btnBBoxOrigins[0].x, btnBBoxOrigins[0].y, this.gui.btn.w, this.gui.btn.h);
	dbgRect(this.gui.cRibbon.d3c, btnBBoxOrigins[1].x, btnBBoxOrigins[1].y, this.gui.btn.w, this.gui.btn.h);
	dbgRect(this.gui.cRibbon.d3c, btnBBoxOrigins[2].x, btnBBoxOrigins[2].y, this.gui.btn.w, this.gui.btn.h);
	// <<< end remove

}; // end function createButtonRibbon(...)

storyView.setButtonState = function(butNo, flState) {
	this.butId.forEach(function(b) { d3.select("#" + b).classed('clicked', false); });

	d3.select("#" + this.butId[butNo]).classed('clicked', flState);
};

storyView.createPages = function() {

	this.gui.pageViewCanvas[0].o.y = this.gui.cRibbon.o.y + this.gui.cRibbon.h + this.gui.distRibbon2Page;
	this.gui.pageViewCanvas[0].o.x = 0;

	// Calculate the story page view BBox
	this.gui.pageViewCanvas[0].size.w = this.cView.iw;
	this.gui.pageViewCanvas[0].size.h = this.cView.ih - this.gui.pageViewCanvas[0].o.y;

	// Copy the same calculations to the rest of the pageCanvases
	this.gui.pageViewCanvas[1].size = this.gui.pageViewCanvas[0].size;
	this.gui.pageViewCanvas[2].size = this.gui.pageViewCanvas[0].size;
	this.gui.pageViewCanvas[1].o = this.gui.pageViewCanvas[0].o;
	this.gui.pageViewCanvas[2].o = this.gui.pageViewCanvas[0].o;

	// Create a canvas that will house the overlapping story pages
	this.gui.pageViewCanvas[0].d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.pageViewCanvas[0].o.x+','+this.gui.pageViewCanvas[0].o.y+')');
	this.gui.pageViewCanvas[1].d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.pageViewCanvas[1].o.x+','+this.gui.pageViewCanvas[1].o.y+')');
	this.gui.pageViewCanvas[2].d3c = this.cView.d3c.append('g').
		attr('transform', 'translate('+this.gui.pageViewCanvas[2].o.x+','+this.gui.pageViewCanvas[2].o.y+')');

	this.ctrl.pageCtrl[0].createView(this.gui.pageViewCanvas[0], this.ctrl, flShow=false);
	this.ctrl.pageCtrl[1].createView(this.gui.pageViewCanvas[1], this.ctrl, flShow=false);
	this.ctrl.pageCtrl[2].createView(this.gui.pageViewCanvas[2], this.ctrl, flShow=false);

	this.ctrl.configPages();
};


/******************************************************************************/


var storyCtrl = {
	view: storyView,
	pageCtrl: [page0Ctrl, page1Ctrl, page2Ctrl],
	parentCtrl: null,
	currentPage: null,

	selectPage: function(pageNo) {
		this.currentPage = pageNo;
		this.pageCtrl.forEach(function(p) { p.show(false); });
		this.pageCtrl[pageNo].show(true);
		this.view.setButtonState(pageNo, true);
	},


	configPages: function() {
		this.selectPage(0);
	},

	createView: function(canvas, parentCtrl) {
		this.parentCtrl = parentCtrl;
		this.view.create(canvas, this);
	}
};
