/*******************************************************************************
 * @file        Auxiliary functions used by the SVG viz engine
 * @name        drawPrimitives.js
 * @project     DATAN P6
 * @author      Ivailo Kassamakov (c) 2016
 * Created:     15-Jul-2016
 * Last change:
 * Notes:
 ******************************************************************************/

"use strict";

/* global d3 */

/**
 * d3 event listener.
 * @callback d3evtcb
 * @param {Object} d     - Event target's d3 datum
 * @param {number} i     - d3 selection index
 * @param {Object} nodes - d3 selection group
 * @this DOMElement
 */
 
/**
 * Draw SVG clickable button with a centered & wrapped text inside.
 *
 * @arg {d3c} parent - d3-selected object to contain the button
 * @arg {number} x   - SVG x-coord in user space (i.e. px) of the upper right corner
 * @arg {number} y   - SVG y-coord in user space (i.e. px) of the upper right corner
 * @arg {number} w   - SVG length (width) in user space (i.e. px)
 * @arg {number} h   - SVG length (height) in user space (i.e. px)
 * @arg {string} txt - Text to be contained by the button (without newlines!)
 * @arg {string} cls - CSS class name for the button
 * @arg {string} id  - HTML ID attribute for the button
 * @arg {d3evtcb} cb - callback to call when the button is clicked
 * @arg {number} [rx=30] - SVG length (border rounding radius) in user space (i.e. px)
 * @arg {number} [ry=30] - SVG length (border rounding radius) in user space (i.e. px) 
 *
 * @returns None
 * 
 * @version 1.0.0
 * 
 * @note
 *    The text inside of the button will be automatically wrapped.
 *    The button can be styled by CSS-selecting ".<cls> rect" and ".<cls> text"
 */
function drawTextButton(parent, x, y, w, h, txt, cls, id, callback, rx=30, ry=30) {
	// Create a group to contain both the rect and text elements
	var btn1 = parent.append('g').attr('class', cls).attr('id', id).
		attr('transform', 'translate(' + [x, y] + ')');

	// Draw button rectangle
	btn1.append('rect').attr('width', w).attr('height', h).
		attr('rx', rx).attr('ry', ry).on('click', callback);

	// Draw button text
	btn1.append('text').attr('x', w/2).attr('y', h/2).attr('dy', 0.8).
		style('alignment-baseline', 'middle').style('text-anchor', 'middle').
		text(txt).call(textWrap, w);
} // end function drawTextButton(...)


/**
 * Wrap a text string to fit in a given width.
 *
 * @arg {d3c} text     - A d3-selection of 1+ SVG text elements to be changed
 * @arg {number} width - SVG length in user space (i.e. px) specifying the max
 *     width of the resulting text paragraph
 * 
 * @return None
 * 
 * @version 1.0.0
 * 
 * @note
 *    Adapted from https://bl.ocks.org/mbostock/7555321
 *    The split lines will create "tspan" elements inside of the original "text" element.
 *    The split lines will inherit the alignment of the parent "text" element.
 *    The resulting paragraph will be centered vertically around the "text-anchor" of
 *        the original "text" element.
 */
function textWrap(text, width) {
	text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
			y = text.attr("y"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", width/2).
				attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", width/2).attr("y", y).
					attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}

		// Move the text-anchor of the resulting paragraph back to the 
		// text-anchor of the initial one-line text
		var em_in_px = getElementPropertyPx(text.nodes()[0], 'fontSize');
		text.attr('transform', 'translate(0, ' + 
			(-(lineNumber * lineHeight + dy)/2 * em_in_px) + ')');
	});
} // end function textWrap(...)


/**
 * Draw a loading icon (spinner)
 * 
 * @arg {View~cView} cView - View object to contain the spinner
 * 
 * @return {d3c} The spinner's d3 canvas
 * 
 * @note The spinner is centered in the view
 */
function drawSpinner(cView) {
		
	var spinner = {
		BBox: { w: 100, h: 150, x: cView.iw/2 - 50, y: cView.ih/2 - 50 },
		d3c: null
	};
	
	/*this.cView.d3c.append('image').attr('href', 'icons/spinner.svg').
		attr('width', 50).attr('height', 50);*/
	
	/*this.cView.d3c.append('rect').attr('x', 20).
		attr('y', 20).attr('width', 40).attr('height', 40).
		attr('class', 'spinner');*/
		
	// Create the spinner canvas
	spinner.d3c = cView.d3c.append('g').
		attr('class', 'spinner-canvas').
		attr('transform', 'translate(' + [spinner.BBox.x, spinner.BBox.y] + ')');
		
	// Create the spinner itself
	spinner.d3c.append('circle').attr('class', 'spinner').
		attr('cx', spinner.BBox.w/2).attr('cy', (spinner.BBox.h-50)/2).
		attr('r', spinner.BBox.w/2);
		
	// Create the loading text
	spinner.d3c.append('text').attr('x', spinner.BBox.w/2).attr('y', spinner.BBox.h-50).
		text("Loading data...").attr('class', 'spinner-text');
		
	return spinner.d3c;
} // end function drawSpinner(...)


/**
 * Query a CSS property of a given element that is measured in px.
 *
 * @arg {Element} elem - DOM Element (e.g. SVGElement or HTMLElement, etc.) to query
 * @arg {String} prop  - Name of the CSS property (e.g. 'width', 'fontSize', etc.)
 * 
 * @return {Number} The numeric value of the queried property.
 * 
 * @note
 *    Only properties that are in px units are supported, i.e. getComputedStyle()
 *        returns strings like "15px" for them.
 */
function getElementPropertyPx(elem, prop) {
	return Number(getComputedStyle(elem)[prop].match(/(\d*(\.\d*)?)px/)[1]);
} // end function getElementPropertyPx(...)


/**
 * Draw a simple transparent rectangle to visualize an element's border
 * 
 * @arg {d3c} parent - d3-selected canvas to draw upon
 * @arg {number} x   - SVG x-coord in user space (i.e. px) of the upper right corner
 * @arg {number} y   - SVG y-coord in user space (i.e. px) of the upper right corner
 * @arg {number} w   - SVG length (width) in user space (i.e. px)
 * @arg {number} h   - SVG length (height) in user space (i.e. px)
 * @arg {string} [color='red'] - Color for the rectangle's outline
 * @arg {string} [cls='dbg-rect'] - CSS class name for the rectangle
 * 
 * @return None
 */
function dbgRect(d3c, x, y, w, h, color='red', cls='dbg-rect') {
	d3c.append('rect').attr('width', w).attr('height', h).
		attr('x', x).attr('y', y).attr('class', cls).
        style('fill', 'none').style('stroke', color);
} // end function dbgRect(...)

/* EOF */
