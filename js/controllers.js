'use strict';

angular.module('myApp.controllers', []).
    controller('MyCtrl1', ['$scope', 'OrgUnits', 'MapService', 'NavService', function ($scope, OrgUnits, MapService, NavService) {

        console.log(dhisAPI);
        
    	$scope.currOrgUnit = OrgUnits.currOrgUnit;

        $scope.showTable = true;
        $scope.detailsButtonTekst = "Show details";

        var markers = new Array();
        var srLatLng = new google.maps.LatLng(8.460555,-11.779889);
        MapService.showMap("map-canvas");

        // hardcoded to get Sierra Leone as first org unit in hierarchy - change
        if(!$scope.currOrgUnit)  {
            getSingleOrgUnit("ImspTQPwCqd");
        }

        else {
            NavService.createNaviArray($scope.currOrgUnit);
            MapService.showCoords($scope.currOrgUnit, getSingleOrgUnit);
        }

        $scope.naviArray = NavService.naviArray;

        getAllOrgUnits();
        getFilterInput();

        $scope.data = function(orgUnit) {
            getSingleOrgUnit(orgUnit.id);
        }

        $scope.clearFilter = function() {
            $scope.searchText = null;
        }

        $scope.clearMap = function() {
            MapService.clearMap();
        }

        function getFilterInput() {
            $scope.searchText = document.getElementById('searchText');
        }

        function getAllOrgUnits() {
            OrgUnits.getAllOrgUnits().then(function(response) {
                $scope.allUnits = response.data.organisationUnits;
                $scope.currentUnits = $scope.allUnits.slice();
            });
        }

        function getSingleOrgUnit(id) {
            OrgUnits.getCurrOrgUnit(id).then(function() {


                if ($scope.currOrgUnit) {
                    if ($scope.currOrgUnit.level != 4) {
                        $scope.previousOrgUnit = $scope.currOrgUnit;
                    }

                    else {
                        $scope.previousOrgUnit = $scope.currOrgUnit.parent;
                    }
                }

                $scope.currOrgUnit = OrgUnits.currOrgUnit;
                NavService.createNaviArray($scope.currOrgUnit);
                $scope.clearFilter();

                MapService.showCoords($scope.currOrgUnit, getSingleOrgUnit);
            });
        }



        $scope.editButtonTekst = "Edit";
        $scope.edit = false;

        $scope.test2 = false;

        $scope.hideShowTable = function() {
            $scope.showTable = !$scope.showTable;

            if($scope.test2)
                $scope.test2 = !$scope.test2;

            if(!$scope.showTable)
                $scope.detailsButtonTekst = "Hide details";
            else
                $scope.detailsButtonTekst = "Show details";

            if($scope.test2 == true)
                $scope.editButtonTekst = "Cancel";
            else
                $scope.editButtonTekst = "Edit";
        }

        $scope.editOrgUnit = function() {

            $scope.test2= !$scope.test2;
            $scope.edit = !$scope.edit;
            
            if($scope.test2 == true) {
                $scope.editButtonTekst = "Cancel";

                $scope.newOrgUnit = jQuery.extend(true, {}, $scope.currOrgUnit);

                if(($scope.newOrgUnit.coordinates) && ($scope.currOrgUnit.level == 4)) {
                    var coordinates = JSON.parse($scope.newOrgUnit.coordinates);
                    $scope.newOrgUnit.latitude = coordinates[1];
                    $scope.newOrgUnit.longitude = coordinates[0];
                }
            }
            else
                $scope.editButtonTekst = "Edit";
        }
        $scope.navigateReset = function() {
        	
        	$scope.showTable = true;
            $scope.test2 = false;
        	$scope.edit = false;
        	$scope.editButtonTekst = "Edit";
        	$scope.detailsButtonTekst = "Show details";
        }

        $scope.updateOrgUnit = function() {
            if(($scope.newOrgUnit.latitude) && ($scope.newOrgUnit.longitude) && ($scope.currOrgUnit.level == 4)) {
                $scope.newOrgUnit.coordinates = "[" + $scope.newOrgUnit.longitude + "," + $scope.newOrgUnit.latitude + "]";
            }

            OrgUnits.updateOrgUnit($scope.newOrgUnit);
            $scope.currOrgUnit = $scope.newOrgUnit;
            $scope.newOrgUnit = null;
            $scope.edit = false;
        }

        $scope.cancelUpdate = function() {
            $scope.currOrgUnit = $scope.newOrgUnit;
            $scope.newOrgUnit = null;
            $scope.edit = false;
        }


        $scope.deleteOrgUnit = function(orgUnit) {
            var groupsUrl = "http://inf5750-6.uio.no/api/organisationUnitGroups/";
            var unitUrl = "http://inf5750-6.uio.no/api/organisationUnits/" + orgUnit.id;

            // manually delete references from organisationUnitGroups as a workaround
            for(var i = 0; i < orgUnit.organisationUnitGroups.length; i++) {
                OrgUnits.apiDelete(groupsUrl + orgUnit.organisationUnitGroups[i].id + "/" + "organisationUnits/" + orgUnit.id);
            }

            OrgUnits.apiDelete(unitUrl);
            $scope.currOrgUnit = null;
        }


        $scope.getLocation = function () {
            MapService.getLocation(locationFound);
        }

        function locationFound(position) {
            $scope.latitude = position.coords.latitude;
            $scope.longitude = position.coords.longitude;
        }

    }])
    .controller('MyCtrl2', ['$scope', 'OrgUnits', 'MapService', function ($scope, OrgUnits, MapService) {
        var mapShown = false;

        $scope.newOrgUnit = {};
        $scope.newOrgUnit.parent = OrgUnits.currOrgUnit;
        $scope.parentSet = false;

        $scope.setParent = function() {
            $scope.parentSet = true;
        }

        $scope.resetParent = function() {
            $scope.parentSet = false;

        }

        $scope.getOrgUnit = function(id) {
            OrgUnits.getOrgUnit(id).then(function(response) {
                $scope.orgUnits = response.data.children;
                $scope.newOrgUnit.parent = response.data;
            });
        }

        $scope.showMap = function() {
            MapService.showMap("map-canvas-save");
            mapShown = true;
        }

        $scope.closeMap = function() {
            MapService.clearMap();
            mapShown = false;
        }

        $scope.saveOrgUnit = function(newOrgUnit) {
            if(newOrgUnit.longitude && newOrgUnit.latitude) {
                newOrgUnit.coordinates = "[" + newOrgUnit.longitude + ","  + newOrgUnit.latitude + "]";
            }
            OrgUnits.saveOrgUnit(newOrgUnit).then(function() {
                if(OrgUnits.lastStatus == "SUCCESS") {
                    alert("Unit successfully saved ");
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

    }]);