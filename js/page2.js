"use strict";

/* global View */

var page2View = new View();

page2View.create = function(canvas, ctrl, show=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'page');

	this.cView.d3c.append('text').attr('transform', 'translate(150,200)').text('Page2');

	this.show(show);
}; // end function create(...)

var page2Ctrl = {
	view : page2View,
	parentCtrl: null,
	pageShown: null,

	createView: function(d3c, parentCtrl, show) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, show);
		this.pageShown = show;
	},

	show: function(show)
	{
		this.pageShown = show;
		this.view.show(show);
		View.prototype.show.call(this.view, show);
	}
};

/* EOF */
