var mapStatesView = new View();

mapStatesView.gui = {
	/*icons: {
		'asc': {d3c: null},
		'desc': {d3c: null},
		'alpha': {d3c: null},
		'details': {d3c: null}
	},*/
	map: {
		body: {d3c:null, BBox: {x:null, y:null, w:null, h:null}}
	}
};

mapStatesView.create = function(canvas, ctrl, flShow=false)
{
	View.prototype.create.call(this, canvas, ctrl, 'mapStates');

	dbgRect(this.cView.d3c, 0, 0, this.cView.iw, this.cView.ih, 'green');

    this.show(flShow);

	function drawChart() {
        var map = this.gui.map.body;

        map.BBox = {x:0, y:0, w:this.cView.iw, h:this.cView.ih};

        map.d3c = this.cView.d3c.append('g').attr('class', 'map').
            attr('transform', 'translate(' + map.BBox.x + ', ' + map.BBox.y + ')');

		var active = d3.select(null);

		// Create a map zoomer
		var zoom = d3.zoom().scaleExtent([1,16]).on('zoom', zoomed);

		map.d3c.call(zoom).on('click', stopPropagation, true);

		function stopPropagation() {
			if (d3.event.defaultPrevented) d3.event.stopPropagation();
		}

        var proj = d3.geoAlbersUsa().scale(1).translate([0, 0]);
		var path = d3.geoPath().projection(proj);

        var stateClicked = function(viewCtrl) {

            return function stateClicked(d) {
            var stateAcro = model.mapFull2ShortStateName.get(d.properties.name);
            map.d3c.select('.map-annotation').remove();
            if (active.node() === this) {

                //viewCtrl.stateClicked(stateAcro, false);
                return resetZoom(viewCtrl);
            }

            if (active.node() != null) {
                active.classed("active", false);
                viewCtrl.stateClicked(model.mapFull2ShortStateName.get(active.datum().properties.name), false);
            }
            active = d3.select(this).classed("active", true);

            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(16, 0.9 / Math.max(dx / map.BBox.w, dy / map.BBox.h))),
                translate = [map.BBox.w / 2 -  x * scale, map.BBox.h / 2 -  y * scale];

            var transform = d3.zoomTransform(map.d3c).
                translate(translate[0], translate[1]).scale(scale);

            map.d3c.transition().duration(750).call(zoom.transform, transform);

            // Add annotation
            // Get the centroid of the state
            //var bbox = d3.select(this).node().getBBox();
            var cx = map.BBox.x + map.BBox.w/2;
            var cy = map.BBox.y + map.BBox.h/2;

            // We will draw on the chart body canvas
            var d3c = this.gui.map.body.d3c;

            // Create the annotation canvas
            var ann = d3c.append('g').attr('class', 'map-annotation annotation');

            // Draw the bubble
            var bubble = ann.append('g').style('opacity', 0);
            bubble.append('rect').attr('x', cx-40).attr('y', y_coord-15).attr('width', 80).attr('height', 30).
                attr('rx', 3).attr('ry', 3);

            bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-20).text('State:  ' + d.properties.State)
            bubble.append('text').attr('x', x_coord-20).attr('y', y_coord-10).text('Income: ' + 'Per capita income');

            bubble.transition().duration(500).style('opacity', 1);

            viewCtrl.stateClicked(stateAcro, true);
		};}(this.ctrl);

		// Create the map clip-path that coincides with the map's extents
		map.d3c.
			append('clipPath').attr('id', 'map-clipPath').
			append('rect').
			attr('x', 0).attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w);

		// Create a scale for quantizing the continuous data into a pallette of choropleth colors
        map.scale = d3.scaleQuantize()
            .domain([0, d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));



        // Find the bounds of the map and scale appropriately the projections
        // so that the map fills initially the whole viewport

        // First convert TopoJSON -> json
        var json = topojson.feature(model.topojsonUs, model.topojsonUs.objects.units);
        // Below for brevity: b=bounds, s=scale, t=translation
        var b = path.bounds(json),
            dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1],
            s = 0.95 / Math.max(dx / map.BBox.w, dy / map.BBox.h),
            t = [(map.BBox.w - s * (b[1][0] + b[0][0])) / 2,
                 (map.BBox.h - s * (b[1][1] + b[0][1])) / 2];

        proj.scale(s).translate(t);



		// Map border
        map.d3c.append('rect').attr('class', 'map-border').
			attr('x', 0).attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w).
			style('fill', 'none').style('pointer-events','all').
			on('click', resetZoom.bind(undefined, this.ctrl));

        // The canvas to contain the cartography mesh
        var carto = map.d3c.append('g').attr('class', 'states').
            attr('clip-path', 'url(#map-clipPath)').append('g');

        // Draw the states
        carto.selectAll('path').
            data(json.features/*, function(d) {
                // The key function
                return model.mapFull2ShortStateName.get(d.properties.name);
            }*/).
            enter().
            append('path').
            attr('class', function(d) {
                // This is the class determining the quantized color
				return map.scale(model.mapStateIncome.get(d.properties.name));
			}).
			classed('state', true).
            attr('id', function(d) {
                return 'id-map-state-' + model.mapFull2ShortStateName.get(d.properties.name);
            }).
            attr('d', path).
			on('mouseenter', function(d) {
                var stateAcro = model.mapFull2ShortStateName.get(d.properties.name);
				this.ctrl.mapHovered(stateAcro, true);
			}.bind(this)).
            on('mouseout', function(d) {
                var stateAcro = model.mapFull2ShortStateName.get(d.properties.name);
                this.ctrl.mapHovered(stateAcro, false);
            }.bind(this)).
			on('click', stateClicked/*.bind(undefined, this.ctrl)*/);


		function zoomed() {
			carto.style("stroke-width", 1.5 / d3.event.transform.k + "px").
				attr("transform", d3.event.transform);
		};

		function resetZoom(viewCtrl) {
			active.classed("active", false);
            if (active.node() != null) {
                var stateAcro = model.mapFull2ShortStateName.get(active.datum().properties.name);
                viewCtrl.stateClicked(stateAcro, false);
            }
            map.d3c.select('.map-annotation').remove();
            active = d3.select(null);
			map.d3c.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
		}

        /*map.d3c.append("path").
            datum(topojson.mesh(model.topojsonUs, model.topojsonUs.objects.units,
                function(a, b) { return true; })).
            attr("class", "states").
            attr("d", path);*/



    }

    // Wait for data to be loaded
    function waitfor(that, obj, checkfunc, callback) {
        while (checkfunc.call(obj) == false) {
            setTimeout(waitfor, 500, that, obj, checkfunc, callback);
			return;
        }
        drawChart.call(that);
    };

    waitfor(this, model, model.isDataLoaded, drawChart);
}; // end function mapStatesView.create(...)

mapStatesView.simulateMapHover = function(state, flShow) {
    var state = this.gui.map.body.d3c.select('#' + 'id-map-state-' + state);

    state.classed('hovered', flShow);
}

var chart_mapStatesCtrl = {
    view: mapStatesView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},

    mapHovered: function(state, flShow) {
        // Push up this event to the parent controller so that other views can respond
        this.parentCtrl.mapHovered(state, flShow);
    },

    simulateMapHover: function(state, flShow) {
        this.view.simulateMapHover(state, flShow);
    },

    stateClicked(state, flActive) {
        this.parentCtrl.mapStateClicked(state, flActive);
    }
};
