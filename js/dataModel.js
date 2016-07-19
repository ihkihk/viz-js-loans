"use strict";

var model = {
    topojsonUs: null,
    mapStateIncome: d3.map(),
    mapFull2ShortStateName: d3.map(),
    tblStatesIncome: null,
    flDataLoaded: false,

    loadStatesTable: function(dataArray) {
        console.log("model.loadStatesTable called!")
        this.topojsonUs = dataArray[0];
        this.tblStatesIncome = dataArray[1];
        this.flDataLoaded = true;
    },

    isDataLoaded: function() {
        return this.flDataLoaded != false;
    },

    processIncomeData: function(d) {
        var r = {};

        // Convert numeric string to number
		r['Rank'] = +d['Rank'];
		// Remove the leading '$' and the thousands comma like in "$123,456"
		r['Per capita income'] = +d['Per capita income'].replace(/[$,]/g, "");
        r['State'] = d['State'];
        r['StateFull'] = d['StateFull'];

        this.mapStateIncome.set(r['StateFull'], r['Per capita income']);
        this.mapFull2ShortStateName.set(r['StateFull'], r['State']);

		return r;
    }
};

/* EOF */
