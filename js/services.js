'use strict';

/* It has become considered better practise to separate services into
 different files. Not like it's done here. See angular-seed for an example
 of how it's done (this is based on angular-seed one year ago.
 */

/* Services */

var myAppServices = angular.module('myApp.services', ['ngResource']);

myAppServices.factory("OrgUnits", ['$http', function($http) {
	var OrgUnits = {};

	OrgUnits.getAllOrgUnits = function() {
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits.jsonp?callback=JSON_CALLBACK&fields=name,id&paging=false");
	}

	OrgUnits.getCurrOrgUnit = function(id) {
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits/" + id +".jsonp?callback=JSON_CALLBACK").success(function(response) {
			OrgUnits.currOrgUnit = response;
		});
	}

	OrgUnits.getOrgUnit = function(id) {
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits/" + id + ".jsonp?callback=JSON_CALLBACK");
	}

	OrgUnits.geoCall = function(argument) {
		return $http.get("http://inf5750-6.uio.no/api/geoFeatures.json" + argument);
	}

	OrgUnits.saveOrgUnit = function(newOrgUnit) {
		return $http({
			url: "http://inf5750-6.uio.no/api/organisationUnits",
			dataType: "json",
			method: "POST",
			data: JSON.stringify(newOrgUnit),
			headers: {
				"Content-Type": "application/json"
			}
		}).success(function(response) {
			OrgUnits.lastStatus = response.status;
			console.log(response);
		});
	}

	OrgUnits.updateOrgUnit = function(orgUnit) {
		console.log("orgUnits.update");
		return $http({
			url: "http://inf5750-6.uio.no/api/organisationUnits/" + orgUnit.id,
			dataType: "json",
			method: "PUT",
			data: JSON.stringify(orgUnit),
			headers: {
				"Content-Type": "application/json"
			}
		}).success(function(response) {
			console.log("update-success");
		});
	}

	OrgUnits.deleteOrgUnit = function(orgUnit) {
		var url = "http://inf5750-6.uio.no/api/organisationUnits/" + orgUnit.id;
		console.log(url);

		for(var i = 0; i < orgUnit.organisationUnitGroups.length; i++) {
			console.log(orgUnit.organisationUnitGroups[i].name + " " + orgUnit.organisationUnitGroups[i].id);
		}

		console.log("Parent: " + orgUnit.parent.id);

		/*return $http({
		 url: "http://inf5750-6.uio.no/api/organisationUnits/" + orgUnit.id,
		 method: "DELETE"
		 }).success(function(response) {
		 console.log("success");
		 });*/
	}

	OrgUnits.apiDelete = function(url) {
		return $http({
			url: url,
			method: "DELETE"
		}).success(function(response) {
			console.log("success");
		});
	}

	return OrgUnits;
}]);


myAppServices.factory("MapService", ['OrgUnits', function (OrgUnits) {
	var MapService = {};
	var markers = new Array();
	var boundary;
	var srLatLng = new google.maps.LatLng(8.460555,-11.779889);

	MapService.clearMap = function() {
		while(markers.length > 0) {
			markers[0].setMap(null);
			markers.splice(0, 1);
		}

		if(boundary) {
			boundary.setMap(null);
		}
		console.log("clearmap");
	}

	MapService.resetCenter = function() {
		MapService.map.setZoom(7);
		MapService.map.setCenter(srLatLng);
	}

	MapService.showMap = function(mapName) {
		var mapOptions = {
			zoom: 7,
			center: srLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		}
		MapService.map = new google.maps.Map(document.getElementById(mapName), mapOptions);
		console.log("showMap");
	}

	MapService.showCoords = function(orgUnit, callback) {
		if(orgUnit.level == 1) {
			MapService.clearMap();
			MapService.resetCenter();
		}

		else {
			if (orgUnit.coordinates) { //else if
				if (orgUnit.level == 4) {
					console.log(orgUnit.coordinates);
					//MapService.clearMap();
					showSingleUnit(orgUnit);
				}

				else {
					MapService.clearMap();
					showBoundary(orgUnit);
				}
			}

			if (orgUnit.level != 4) {
				OrgUnits.geoCall("?ou=ou:LEVEL-4;" + orgUnit.id).then(function (response) {
					MapService.geoUnits = response.data;
					if (MapService.geoUnits) {
						showUnits(MapService.geoUnits, callback);
					}
				});
			}
		}
	}

	function showSingleUnit(orgUnit) {
		MapService.clearMap();

		var markerBounds = new google.maps.LatLngBounds();
		var coordinates = JSON.parse(orgUnit.coordinates);
		var myLatlng = new google.maps.LatLng(coordinates[1], coordinates[0]);
		var marker = new google.maps.Marker({
			position : myLatlng,
			map : MapService.map,
			title : orgUnit.name
		});
		markers.push(marker);
		markerBounds.extend(myLatlng);
		MapService.map.fitBounds(markerBounds);
	}




	function showBoundary(orgUnit) {
		console.log(orgUnit.name);

		var boundaryCoords = new Array();

		var markerBounds = new google.maps.LatLngBounds();

		var stringCoords, arrCoords, resCoords;
		arrCoords = orgUnit.coordinates.split("],[");
		console.log(arrCoords.length);
		for (var j = 0; j < arrCoords.length; j++) {
			resCoords = arrCoords[j].split(",");

			for (var k = 0; k < 2; k++) {
				resCoords[k] = resCoords[k].replace(/((\[)|(\]))/g, "")
			}

			var myLatlng = new google.maps.LatLng(resCoords[1], resCoords[0]);
			boundaryCoords.push(myLatlng)
			markerBounds.extend(myLatlng);
		}

		MapService.map.fitBounds(markerBounds);

		boundary = new google.maps.Polygon({
			paths: boundaryCoords,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35
		});

		boundary.setMap(MapService.map);
	}


	function showUnits(orgUnits, callback) {
		for(var i = 0; i < orgUnits.length; i++) {
			var coordinates = JSON.parse(orgUnits[i].co);

			var myLatlng = new google.maps.LatLng(coordinates[1], coordinates[0]);
			var marker = new google.maps.Marker({position: myLatlng, map: MapService.map, title: orgUnits[i].na});

			if(callback != null) {
				google.maps.event.addListener(marker, 'click', function (id) {
					callback(id);
				}.bind(this, orgUnits[i].id));
			}

			markers.push(marker);
		}
	}

	MapService.addMarker = function(orgUnit) {
		console.log(MapService.addMarker);
	}

	return MapService;
}]);


myAppServices.factory("NavService", function ($resource) {
	var NavService = {};
	NavService.naviArray = new Array(4);

	NavService.createNaviArray = function(orgUnit) {
		NavService.naviArray[orgUnit.level - 1] = orgUnit;

		for (var i = NavService.naviArray.length - 1; i >= orgUnit.level; i--) {
			NavService.naviArray[i] = null;
		}


		/*
		 if (orgUnit.level != 1) {
		 if (NavService.naviArray[orgUnit.level-2].id != orgUnit.parent.id) {
		 var level = orgUnit.level;
		 while (level > 0) {
		 console.log("feil parent");
		 level--;
		 }
		 }

		 }
		 */
	}

	return NavService;
});