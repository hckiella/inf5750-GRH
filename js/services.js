'use strict';

/* It has become considered better practise to separate services into
 different files. Not like it's done here. See angular-seed for an example
 of how it's done (this is based on angular-seed one year ago.
 */

/* Services */

var myAppServices = angular.module('myApp.services', ['ngResource']);

myAppServices.factory("OrgUnits", ['$http', function($http) {
	var OrgUnits = {};
			
	OrgUnits.getOrgUnits = function() {		
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits.jsonp?callback=JSON_CALLBACK&level=2&fields=id,name,href");
	}
	
	OrgUnits.getAllOrgUnits = function() {
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits.jsonp?callback=JSON_CALLBACK&fields=name,href&paging=false");
	}
	
	OrgUnits.getOrgUnitsByLevel = function(level) {
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits.jsonp?callback=JSON_CALLBACK" + "&level=" + level);
	}
	OrgUnits.getSingleOrgUnit = function(href) {
		return $http.jsonp(href+".jsonp?callback=JSON_CALLBACK").success(function(response) {
			OrgUnits.currOrgUnit = response;
		});
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


myAppServices.factory("MapService", function ($resource) {
    var MapService = {};
    var markers = new Array();
    var srLatLng = new google.maps.LatLng(8.460555,-11.779889);
	
	MapService.clearMap = function() {
    	while(markers.length > 0) {
    		markers[0].setMap(null);
    		markers.splice(0, 1);
    	}
    	
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
    	
    }
    
    MapService.showSingleUnit = function(orgUnit) {    	
    	var coordinates = JSON.parse(orgUnit.coordinates);
    	var myLatlng = new google.maps.LatLng(coordinates[1], coordinates[0]);
    	var marker = new google.maps.Marker({
    		position : myLatlng,
    		map : MapService.map,
    		title : orgUnit.name
    	});
    	markers.push(marker);
    }
    
    MapService.showCoordinates = function(orgUnit) {
		if(markers.length > 0) {
			MapService.clearMap();
		}

		var markerBounds = new google.maps.LatLngBounds();

		var stringCoords, arrCoords, resCoords;
		arrCoords = orgUnit.coordinates.split("],[");
		for (var j = 0; j < arrCoords.length; j++) {
			resCoords = arrCoords[j].split(",");

			for (var k = 0; k < 2; k++) {
				resCoords[k] = resCoords[k].replace(/((\[)|(\]))/g, "")
			}

			var myLatlng = new google.maps.LatLng(resCoords[1], resCoords[0]);
			var marker = new google.maps.Marker({position: myLatlng, map: MapService.map, title: orgUnit.name + "-" + j});

			markers.push(marker);

			markerBounds.extend(myLatlng);
		}
		MapService.map.fitBounds(markerBounds);
	}
    
    MapService.addMarker = function(orgUnit) {
    	console.log(MapService.addMarker);
    }
    
    return MapService;
});


myAppServices.factory("MeService", function ($resource) {
    return $resource(
        dhisAPI+'/api/me',
        {
            // If you're passing variables, for example into the URL
            // they would be here and then as :varName in the URL
        },
        {
            // If you want to implement special functions, you'd
            // put them here.
        }
    );
});

myAppServices.factory("ProfileService", function ($resource) {
    return $resource(
            dhisAPI+'/api/me/profile',
        {
            // If you're passing variables, for example into the URL
            // they would be here and then as :varName in the URL
        },
        {
            // If you want to implement special functions, you'd
            // put them here.
        }
    );
});



myAppServices.factory("UserSettingService", function ($resource) {
    return $resource(
            dhisAPI+'/api/userSettings/exampleapp.usersetting',
        {
            // If you're passing variables, for example into the URL
            // they would be here and then as :varName in the URL
        },
        {
            // If you want to implement special functions, you'd
            // put them here. In this case, the content type cannot be
            // JSON, so we need to change it to text/plain
            save: {
                method:'POST',
                isArray:false,
                headers: {'Content-Type': 'text/plain'}}
        }
    );
});
