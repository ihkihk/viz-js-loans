"use strict";

/* global storyCtrl, d3, model */

var mainCtrl = {
    storyCtrl: storyCtrl,

    viewport: {
        padding: 10,
        d3c: null
    },

    storyViewCanvas: {
        d3c: null,
        // Note: story_width and story_height are in golder ratio
        size: {w: 1300, h: 800}
    },

    init: function(parent_div) {
        this.createViewport(parent_div);

        this.storyViewCanvas.d3c = this.viewport.d3c.
            append('g').
            // Move the coordinate origin to consider the margins around the story view
            attr('transform', 'translate(' + this.viewport.padding +
                ', ' + this.viewport.padding + ')');

        this.storyCtrl.createView(this.storyViewCanvas, this);
    },

    createViewport: function(parent_div) {
        this.viewport.d3c  = d3.select(parent_div).
            append('svg').
            attr('class', 'viz-viewport').
            attr('width', this.storyViewCanvas.size.w + 2 * this.viewport.padding).
            attr('height', this.storyViewCanvas.size.h + 2 * this.viewport.padding);

        this.viewport.d3c.append('rect').
            attr('class', 'bkgrnd-viz').
            attr('x', this.viewport.padding).
            attr('y', this.viewport.padding).
            attr('width', this.storyViewCanvas.size.w).
            attr('height', this.storyViewCanvas.size.h).
            attr('rx', '10px').
            attr('ry', '10px');
    }, // end function createCanvas(...)

    dataReady: function(error, data) {
        if (error) throw error;

        model.loadDataTables(data);
    }
};

/* EOF */
