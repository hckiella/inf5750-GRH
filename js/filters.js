'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('exact', function () {
	  return function (inUnits, searchText) {
		    var outUnits = new Array();
		    console.log(inUnits);
		    for (var i = 0; i < inUnits.length; i++) {
		    	var unit = inUnits[i];
		    	if(unit.name.substring(0, searchText.length).toLowerCase() === searchText.toLowerCase()) {
		    		outUnits.push(unit);
		      }
		    }
		    return outUnits;
		  };
		})
