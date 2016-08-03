"use strict";

/* global d3 */

var model = {
    topojsonUs: null,
    mapStateIncome: d3.map(),
    mapStateName2Full: d3.map(),
	mapStateName2Acro: d3.map(),
    tblStatesIncome: null,
	tblLoanIncome: [],
    flDataLoaded: false,

    loadStatesTable: function(dataArray) {
        console.log("model.loadStatesTable called!");
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
        this.mapStateName2Full.set(r['State'], r['StateFull']);
        this.mapStateName2Acro.set(r['StateFull'], r['State']);
		
		this.tblLoanIncome.push({
			name: r.State,
			income: r['Per capita income'],
			loan: r['Per capita income'] + Math.random()*100,
		});
				
		return r;
    }
};

/* EOF */
