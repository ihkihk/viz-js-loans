"use strict";

var model = {
    tblStatesIncome: null,
    flDataLoaded: false,

    loadStatesTable: function(data) {
        console.log("model.loadStatesTable called!")
        this.tblStatesIncome = data;
        this.flDataLoaded = true;
    },

    isDataLoaded: function() {
        return this.flDataLoaded != false;
    }
};

/* EOF */
