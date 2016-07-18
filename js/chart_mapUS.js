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
        console.log('Data loaded for mapStatesView');
        var map = this.gui.map.body;
        map.BBox = {x:0, y:20, w:this.cView.iw, h:this.cView.ih-20};

        map.d3c = this.cView.d3c.append('g').attr('class', 'map').
            attr('transform', 'translate(' + map.BBox.x + ', ' + map.BBox.y + ')');


        map.d3c.append('rect').attr('class', 'map-border').attr('x', 0).
            attr('y', 0).attr('height', map.BBox.h).attr('width', map.BBox.w).style('fill', 'none').
            attr('id','map-border');

        map.scale = d3.scaleQuantize()
            .domain([0, d3.max(model.tblStatesIncome, function(d) { return d['Per capita income'];})])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

        var proj = d3.geoAlbersUsa().
            scale(1600).translate([map.BBox.w/2, map.BBox.h/2]);

        var path = d3.geoPath().projection(proj);

        map.d3c.append('g').attr('class', 'states').
            attr('clip-path', 'polygon(0 0, '+map.BBox.w+' 0, '+map.BBox.w+' '+ map.BBox.h+', 0 ' +map.BBox.h+')').
            /*style('-webkit-clip-path', 'url(#map-border)').*/
            selectAll('path').
            data(topojson.feature(model.topojsonUs, model.topojsonUs.objects.units).features).
            enter().
            append('path').
            attr('class', function(d) { return map.scale(model.mapStateIncome.get(d.properties.name)); }).
            attr('d', path).on('mouseover', function(d){ console.log('On top of ' + d.properties.name); });

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
