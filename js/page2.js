"use strict";

/* global View */

var page2View = new View();

page2View.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'page');

	this.cView.d3c.append('text').attr('transform', 'translate(150,200)').text('Page2');

	this.show(flShow);
}; // end function create(...)

var page2Ctrl = {
	view : page2View,
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
		this.view.show(flShow);
		View.prototype.show.call(this.view, flShow);
	}
};

/* EOF */
