"use strict";

/* global d3, getElementPropertyPx */

function View() {
	// The View's canvas
	this.canvas = {
		// A d3-selected SVG primitve that can be used as a canvas (e.g. <g>)
		d3c: null,
		// Size of the canvas in user units (width, height).
		// This is also the view's BBox
		size: {w: null, h: null}
	};

	// The View's parameters as a container
	this.cView = {
		iw: null, ih: null,
		bt: null,
		bw: null, bh: null,
		w: null, h: null,
		m: {t: 2, b: 2, l: 2, r: 2},
		p: {t: 5, b: 5, l: 5, r: 5},
		d3c_outer: null,
		d3c: null
	};

	// The View's GUI
	this.gui = null;

	// Controller of the view
	this.ctrl = null;
}

	// Function for creating the view
View.prototype.create = function(canvas, ctrl, name) {
	this.ctrl = ctrl;

	this.canvas = canvas;

	// Set the view to invisible by default
	this.canvas.d3c.attr('class', 'bbox-' + name).style('opacity', 0);

	// Calculate view geometry
	this.cView.bw = this.canvas.size.w - this.cView.m.l - this.cView.m.r;
	this.cView.bh = this.canvas.size.h - this.cView.m.t - this.cView.m.b;

	this.cView.d3c_outer = this.canvas.d3c.append('g').
		attr('transform', 'translate(' + this.cView.m.l + ', ' +
			this.cView.m.t + ')').attr('class', 'brdbox-' + name);

	// Add background-color
	this.cView.d3c_outer.append('rect').attr('class', 'bkgrnd-' + name).
		attr('x', 0).attr('y', 0).attr('width', this.cView.bw).attr('height', this.cView.bh);

	// Add border
	var border = this.cView.d3c_outer.append('rect').style('fill', 'none').attr('class', 'border-' + name);
	var hasBorder = getComputedStyle(border.nodes()[0])['stroke'] != 'none';
	if (hasBorder) {
		this.cView.bt = getElementPropertyPx(border.nodes()[0], 'stroke-width');
	} else
		this.cView.bt = 0;

	this.cView.iw = this.cView.bw - 2*this.cView.bt - this.cView.p.l - this.cView.p.r;
	this.cView.ih = this.cView.bh - 2*this.cView.bt - this.cView.p.t - this.cView.p.b;

	if (hasBorder) {
		border.attr('x', this.cView.bt/2).attr('y', this.cView.bt/2).
			attr('width', this.cView.bw-this.cView.bt).attr('height', this.cView.bh-this.cView.bt);
	} else {
		border.remove();
	}

	this.cView.d3c = this.cView.d3c_outer.append('g').
		attr('transform', 'translate(' + (this.cView.p.l + this.cView.bt) + ', ' +
			(this.cView.p.t + this.cView.bt) + ')').attr('class', 'content-' + name);
};

// Function for showing or hiding the view
View.prototype.show = function(flShow, flAnim=true)
{
	var state = flShow ? 1 : 0;
	var dspl = flShow ? 'block' : 'none';
	var animDuration = flAnim ? 1000 : 0;

	if (flShow) {
		this.canvas.d3c.style('display', dspl).transition().duration(animDuration).style('opacity', state);
	} else {
		this.canvas.d3c.transition().duration(animDuration).style('opacity', state).on('end', function() { d3.select(this).style('display', dspl); });
	}
};

/* EOF */
