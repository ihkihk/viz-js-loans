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
		
        map.BBox = {x:0, y:20, w:this.cView.iw, h:this.cView.ih-20};

        map.d3c = this.cView.d3c.append('g').attr('class', 'map').
            attr('transform', 'translate(' + map.BBox.x + ', ' + map.BBox.y + ')');

		var active = d3.select(null);
		
		// Create a map zoomer
		var zoom = d3.zoom().scaleExtent([1,8]).on('zoom', zoomed);
		
		map.d3c.call(zoom).on('click', stopPropagation, true);
		
		function stopPropagation() {
			if (d3.event.defaultPrevented) d3.event.stopPropagation();
		}
		
		function stateClicked(d) {
		  if (active.node() === this) return resetZoom();
		  active.classed("active", false);
		  active = d3.select(this).classed("active", true);

		  var bounds = path.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / map.BBox.w, dy / map.BBox.h))),
			translate = [map.BBox.w / 2 -  x * scale, map.BBox.h / 2 -  y * scale];
			  
			var transform = d3.zoomTransform(map.d3c).
				translate(translate[0], translate[1]).scale(scale);

			map.d3c.transition().duration(750).call(zoom.transform, transform);
		}

		// Create the map clip-path that coincides with the map's extents
		map.d3c.
			append('clipPath').attr('id', 'map-clipPath').
			append('rect').
			attr('x', 0).attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w);
			
		// Create a scale for quantizing the continuous data into a pallette of choropleth colors
        map.scale = d3.scaleQuantize()
            .domain([0, d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

        //var proj = d3.geoAlbersUsa().scale(500).translate([map.BBox.w/2, map.BBox.h/2]);
		
		var proj = d3.geoAlbersUsa().scale(1).translate([0, 0]);
		var path = d3.geoPath().projection(proj);
		

		// Map border
        map.d3c.append('rect').attr('class', 'map-border').
			attr('x', 0).attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w).
			style('fill', 'none').style('pointer-events','all').
			on('click', resetZoom);
			
        var carto = map.d3c.append('g').attr('class', 'states').
            attr('clip-path', 'url(#map-clipPath)').append('g');
			
        carto.selectAll('path').
            data(topojson.feature(model.topojsonUs, model.topojsonUs.objects.units).features).
            enter().
            append('path').
            attr('class', function(d) { 
				return map.scale(model.mapStateIncome.get(d.properties.name)); 
			}).
			classed('state', true).
            attr('d', path).
			on('mousenter', function(d){ 
				console.log('On top of ' + d.properties.name); 
			}).
			on('click',stateClicked);
			

		function zoomed() {
			carto.style("stroke-width", 1.5 / d3.event.transform.k + "px").
				attr("transform", d3.event.transform);
		};
		
		function resetZoom() {
			active.classed("active", false);
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



var chart_mapStatesCtrl = {
    view: mapStatesView,
    parentCtrl: null,

    createView: function(d3c, parentCtrl, flShow) {
		this.parentCtrl = parentCtrl;
		this.view.create(d3c, this, flShow);
	},
};
