"use strict";

/* global d3 */

var model = {
    topojsonUs: null,
    mapStateIncome: d3.map(),
    mapStateName2Full: d3.map(),
	mapStateName2Acro: d3.map(),
    tblStatesIncome: null,
    tblProsperLoans: null,
	tblLoanIncome: [], // FIXME: Remove this shim data
    tblLoanState: null,
    flDataLoaded: false,
	lsrl: null, // Least-Squares Regression Line params

    loadDataTables: function(dataArray) {
        this.topojsonUs = dataArray[0];
        this.tblStatesIncome = dataArray[1];
		this.tblProsperLoans = dataArray[2];
        this.flDataLoaded = true;

		// Calculating average loan per state:
		this.tblLoanState = d3.nest().
            // Aggregate by state
            key(function(d) { return d.BorrowerState; }).
            // Find the average loan original amount by state
            rollup(function(leaves) {
                return d3.sum(leaves, function(d) {
                    return +d.LoanOriginalAmount;
                }) / leaves.length; }).
            entries(this.tblProsperLoans);
			
		// Remove the entry for non-specified state
		this.tblLoanState = this.tblLoanState.filter(function(d) { return d.key != ""; });
		
		// Calculate linear regression fit for the Income-Loan data
		var yArray = this.tblLoanState.map(function(d) { return d.value; });
		var xArray = this.mapStateIncome.values();
		
		this.lsrl = this.computeRegressionLine(xArray, yArray);
    },

    isDataLoaded: function() {
        return this.flDataLoaded;
    },

    processIncomeDataRow: function(d) {
        var r = {};

        // Convert numeric string to number
		r['Rank'] = +d['Rank'];
		// Remove the leading '$' and the thousands comma like in "$123,456"
		r['Per capita income'] = +d['Per capita income'].replace(/[$,]/g, "");
        r['State'] = d['State'];
        r['StateFull'] = d['StateFull'];

        this.mapStateIncome.set(r['State'], r['Per capita income']);
        this.mapStateName2Full.set(r['State'], r['StateFull']);
        this.mapStateName2Acro.set(r['StateFull'], r['State']);

        // FIXME: Remove this shim
		this.tblLoanIncome.push({
			name: r.State,
			income: r['Per capita income'],
			loan: r['Per capita income'] + Math.random()*100,
		});

		return r;
    },

    processProsperDataRow: function(d) {
        var r = {};

        r = d;
        r.LoanOriginalAmount = +d.LoanOriginalAmount;
		
		return r;
    },
	
	computeRegressionLine: function(xArray, yArray) {
		var xxArray, xyArray=[];
		var a, b, sumX, sumY, sumXY, sumXX;
		
		xxArray = xArray.map(function(d) { return d*d; });

		for (var i = 0; i < xArray.length; i++) {
			xyArray.push(xArray[i] * yArray[i]);
		}
		
		sumX = d3.sum(xArray);
		sumY = d3.sum(yArray);
		sumXX = d3.sum(xxArray);
		sumXY = d3.sum(xyArray);
		
		a = (sumY * sumXX - sumX * sumXY) / (xArray.length * sumXX - sumX * sumX);
		b = (xArray.length * sumXY - sumX * sumY) / (xArray.length * sumXX - sumX * sumX);
		
		return {slope: b, intercept: a};
	},
	
	getLSRLslope: function() { return this.lsrl.slope; },
	
	getLSRLintercept: function() { return this.lsrl.intercept; },
};

/* EOF */
