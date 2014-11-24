'use strict';

/* Controllers */

/*  It has become considered better practise to separate controllers into
    different files. Not like it's done here. See angular-seed for an example
    of how it's done (this is based on angular-seed one year ago.

    Note that when you get an object from a $resource, this object
    automatically gets some $get/$save methods that can use if you want to
    update or save the object again onto the server.

    See: https://docs.angularjs.org/api/ngResource/service/$resource for info
*/


angular.module('myApp.controllers', []).
    controller('MyCtrl1', ['$scope', 'OrgUnits', function ($scope, OrgUnits) {
    	$scope.currentUnit = null;
    	
    	var markers = new Array();
    	var srLatLng = new google.maps.LatLng(8.460555,-11.779889);
    	
    	getAllOrgUnits();
    	getFilterInput();
    	getOrgUnits();
    	
    	//if($scope.searchText === null)
    		
    	
    	showMap();
    	    	    	    	
    	$scope.getOrgUnitsByLevel = function(level) {
        	getOrgUnitsByLevel(level);
        }
    	$scope.data = function(orgUnit) {
    		getSingleOrgUnit(orgUnit.href);
    	}
    	
    	$scope.clearFilter = function() {
    		$scope.searchText = null;
    	}
    	
    	$scope.clearMap = function() {
    		
        	for(var i = 0; i < markers.length; i++) {
        		markers[i].setMap(null);
        		markers.splice(i, 1);        	
        	}
        	
            $scope.map.setZoom(7);
            $scope.map.setCenter(srLatLng);
        }       
    	
    	function getFilterInput() {
    		$scope.searchText = document.getElementById('searchText');
        	console.log($scope.searchText);        	
    	}
    	
        function getOrgUnits() {
        	OrgUnits.getOrgUnits().then(function(response) {
        		$scope.orgUnits = response.data.organisationUnits;
        	});
        }
        
        function getAllOrgUnits() {
        	OrgUnits.getAllOrgUnits().then(function(response) {
        		$scope.allUnits = response.data.organisationUnits;
        		$scope.currentUnits = $scope.allUnits.slice();
        		console.log(response.data);
        	});
        }
        
        function getOrgUnitsByLevel(level) {
        	OrgUnits.getOrgUnitsByLevel(level).then(function(response) {
        		$scope.orgUnits = response.data.organisationUnits;
        	});
        }
        
        function getSingleOrgUnit(href) {
        	console.log(href);
        	OrgUnits.getSingleOrgUnit(href).then(function(response) {
        		       		
        		if($scope.singleOrgUnit == null) {
        			
        		}
        		
        		else {
        				if($scope.singleOrgUnit.level !=4) {
        					$scope.previousOrgUnit = $scope.singleOrgUnit;
        				}
        				else {
        					$scope.previousOrgUnit = $scope.singleOrgUnit.parent.parent;
        				}
        		}
        		
        		$scope.singleOrgUnit = response.data;
        		if($scope.singleOrgUnit.level != 4)
        			$scope.orgUnits = response.data.children;
        		$scope.clearFilter();
        		        		
        		if($scope.singleOrgUnit.level && $scope.singleOrgUnit.level == 4) {
                	if($scope.singleOrgUnit.coordinates)
                		showSingleUnit();
        		}
         		console.log(response.data);  
        		
        	});
        }
        
        $scope.deleteOrgUnit = function(orgUnit) {
        	OrgUnits.deleteOrgUnit(orgUnit).then(function(){
        		if(OrgUnits.lastStatus == "SUCCESS") {
        			alert("Unit successfully deleted")
        		}
        		else {
        			alert("Error while trying to delete unit")
        		}
        	});        	
        }
              
        function showMap() {
        	var mapOptions = {
        		zoom: 7,
                center: srLatLng,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            }        
        	$scope.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        	
        }
        
        function showSingleUnit() {    	
        	var coordinates = JSON.parse($scope.singleOrgUnit.coordinates);
        	var myLatlng = new google.maps.LatLng(coordinates[1], coordinates[0]);
        	var marker = new google.maps.Marker({
        		position : myLatlng,
        		map : $scope.map,
        		title : $scope.singleOrgUnit.name
        	});
        	markers.push(marker);
        }       
        
    }])
    .controller('MyCtrl2', ['$scope', 'OrgUnits', function ($scope, OrgUnits) {
    	$scope.newOrgUnit = {};    	
    	var mapShown = false;
    	
    	$scope.parentSet = false;
    	    
    	OrgUnits.getOrgUnits().then(function(response) {
    		$scope.orgUnits = response.data.organisationUnits;
    		
    		
    	});
    	
    	
    	$scope.setParent = function(parent) {
    		$scope.parentSet = true;
    	}
    	
    	$scope.resetParent = function() {
    		$scope.parentSet = false;
    		
    	}
    	
    	$scope.getSingleOrgUnit = function(href) {
    		OrgUnits.getSingleOrgUnit(href).then(function(response) {
    			$scope.orgUnits = response.data.children;
    			$scope.newOrgUnit.parent = response.data;
          	});
          }
    	
    	
    	
    	$scope.showMap = function() {
    		if(!mapShown) {
    			var srLatLng = new google.maps.LatLng(8.460555,-11.779889);
    		
    			var mapOptions = {
    					zoom: 7,
    					center: srLatLng,
    					mapTypeId: google.maps.MapTypeId.TERRAIN
    			}        
    			$scope.map = new google.maps.Map(document.getElementById('map-canvas-save'), mapOptions);
    			mapShown = true;
    		}    		
    	}
    	
    	$scope.saveOrgUnit = function(newOrgUnit) {
    		OrgUnits.saveOrgUnit(newOrgUnit).then(function() {
    			if(OrgUnits.lastStatus == "SUCCESS") {
        			alert("Unit successfully saved ")
        		}
        		else {
        			alert("Error while trying to save unit")
        		}
        		$scope.newOrgUnit = {};        			
    		});    		
    	}
    	
    	$scope.getLocation = function() {
    		if (Modernizr.geolocation) {
    			navigator.geolocation
    					.getCurrentPosition(locationFound, locationError);
    		} else {
    			alert("Error retrieving location (Modernizr.geolocation not present)");
    		}
    	}

    	function locationFound(position) {
    		$scope.$apply(function() {
    			$scope.newOrgUnit.latitude = position.coords.latitude;
        		$scope.newOrgUnit.longitude = position.coords.longitude;
    		});
    	}

    	function locationError(error) {
    		alert("Undefined error while retrieving location");
    	}
    	
    	$scope.resetForm = function() {
    		$scope.newOrgUnit = {};		
    	}
    	


    }])
    .controller('MyCtrl9', ['$scope', 'AddUnitService', function ($scope, AddUnitService) {

        $scope.userSetting = UserSettingService.get(function () {
            console.log("$scope.userSetting="+JSON.stringify($scope.userSetting));
        });

        $scope.saveSetting = function () {
            console.log('Saving setting:'+JSON.stringify($scope.userSetting));
            $scope.userSetting.$save({}, function() {
                alert("Data saved successfully.");
            });
        }

        $scope.refreshSetting = function () {
            $scope.userSettingFetched = UserSettingService.get(function () {
                $scope.earlierSetting = $scope.userSettingFetched.value;
            });
        }

    }])
    .controller('MyCtrl3', ['$scope', function ($scope) {
        console.log('Ctrl3');

        $scope.location = {lat: 0.602118, lng: 30.160217};

        $scope.center = {
            lat: 0.577400,
            lng: 30.201073,
            zoom: 10
        };

        $scope.markers = new Array();

        $scope.addMarkers = function () {
            console.log('Ctrl3 Add markers');
            $scope.markers.push({
                lat: $scope.location.lat,
                lng: $scope.location.lng,
                message: "My Added Marker"
            });

        };

        $scope.$on("leafletDirectiveMap.click", function (event, args) {
            var leafEvent = args.leafletEvent;
            console.log('Ctrl3 adding marker at lat=' + leafEvent.latlng.lat + ', lng=' + leafEvent.latlng.lng);
            $scope.location.lng = leafEvent.latlng.lng;
            $scope.location.lat = leafEvent.latlng.lat;

            $scope.markers.push({
                lat: leafEvent.latlng.lat,
                lng: leafEvent.latlng.lng,
                message: "My Added Marker"
            });
        });

        $scope.removeMarkers = function () {
            console.log('Ctrl3 remove markers');
            $scope.markers = new Array();
        }

        // Add an initial marker
        $scope.markers.push({
            lat: $scope.location.lat,
            lng: $scope.location.lng,
            focus: true,
            message: "A draggable marker",
            draggable: true
        });

        $scope.removeOsmLayer = function() {
            delete this.layers.baselayers.osm;
            delete this.layers.baselayers.googleTerrain;
            delete this.layers.baselayers.googleRoadmap;
            delete this.layers.baselayers.googleHybrid;
            this.layers.baselayers.cycle = {
                name: 'OpenCycleMap',
                type: 'xyz',
                url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                layerOptions: {
                    subdomains: ['a', 'b', 'c'],
                    attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    continuousWorld: true
                }
            };
        };

        $scope.addOsmLayer = function() {
            delete this.layers.baselayers.cycle;
            delete this.layers.baselayers.googleTerrain;
            delete this.layers.baselayers.googleRoadmap;
            delete this.layers.baselayers.googleHybrid;
            this.layers.baselayers.osm = {
                name: 'OpenStreetMap',
                type: 'xyz',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                layerOptions: {
                    subdomains: ['a', 'b', 'c'],
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    continuousWorld: true
                }
            };
        };

        $scope.showGoogleLayers = function() {
            delete this.layers.baselayers.cycle;
            delete this.layers.baselayers.osm;
            this.layers.baselayers = {
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                },
                googleHybrid: {
                    name: 'Google Hybrid',
                    layerType: 'HYBRID',
                    type: 'google'
                },
                googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                }
            };
        };

        angular.extend($scope, {
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            continuousWorld: true
                        }
                    },
                    cycle: {
                        name: 'OpenCycleMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            continuousWorld: true
                        }
                    },
                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google'
                    },
                    googleHybrid: {
                        name: 'Google Hybrid',
                        layerType: 'HYBRID',
                        type: 'google'
                    },
                    googleRoadmap: {
                        name: 'Google Streets',
                        layerType: 'ROADMAP',
                        type: 'google'
                    }/*,
                    landscape: {
                        name: 'Landscape',
                        type: 'xyz',
                        url: 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            attribution: '&copy; <a href="http://www.thunderforest.com/about/">Thunderforest</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            continuousWorld: true
                        }
                    },
                    cloudmade1: {
                        name: 'Cloudmade Night Commander',
                        type: 'xyz',
                        url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
                        layerParams: {
                            key: '007b9471b4c74da4a6ec7ff43552b16f',
                            styleId: 999
                        },
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            continuousWorld: true
                        }
                    },
                    cloudmade2: {
                        name: 'Cloudmade Tourist',
                        type: 'xyz',
                        url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
                        layerParams: {
                            key: '007b9471b4c74da4a6ec7ff43552b16f',
                            styleId: 7
                        },
                        layerOptions: {
                            subdomains: ['a', 'b', 'c'],
                            continuousWorld: true
                        }
                    }*/
                }
            }
        });
    }]);

