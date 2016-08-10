"use strict";

/* global View */

var page1View = new View();

page1View.create = function(canvas, ctrl, show=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'page');

	this.cView.d3c.append('text').attr('transform', 'translate(150,100)').text('Page1');

	this.show(show);
}; // end function create(...)

var page1Ctrl = {
	view : page1View,
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
		View.prototype.show.call(this.view, show);
	}
};

/* EOF */
