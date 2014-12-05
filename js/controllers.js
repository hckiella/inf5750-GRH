'use strict';

angular.module('myApp.controllers', []).
    controller('MyCtrl1', ['$scope', 'OrgUnits', 'MapService', 'NavService', function ($scope, OrgUnits, MapService, NavService) {
        
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
        

        $scope.hideShowTable = function() {

            $scope.showTable = !$scope.showTable;

            if($scope.test2)
                $scope.test2 = !$scope.test2;
            
            if(!$scope.showTable)
                $scope.detailsButtonTekst = "Hide details";
            else
                $scope.detailsButtonTekst = "Show details";
            
            if($scope.test2)
            	$scope.test2= !$scope.test2;
            
            if($scope.test2 == true)
                $scope.editButtonTekst = "Cancel";
            else
                $scope.editButtonTekst = "Edit";
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

        /* old controller 3 */
        $scope.editButtonTekst = "Edit";
        $scope.edit = false;

        $scope.test2 = false;

        $scope.editOrgUnit = function() {

            $scope.test2= !$scope.test2;
            $scope.edit = !$scope.edit;
            
            if($scope.test2 == true)
                $scope.editButtonTekst = "Cancel";
            else
                $scope.editButtonTekst = "Edit";
        }
        $scope.navigateReset = function() {
        	
        	$scope.showTable = true;
        	$scope.edit = false;
        	$scope.test2 = false;
        	$scope.editButtonTekst = "Edit";
        	$scope.detailsButtonTekst = "Show details";
        }

        $scope.updateOrgUnit = function() {
            console.log("scope.update");
            $scope.newOrgUnit = jQuery.extend(true, {}, $scope.currOrgUnit);
            console.log($scope.newOrgUnit);
            console.log($scope.newOrgUnit.active);
            //$scope.newOrgUnit.active = (bool)$scope.newOrgUnit.active;
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
                console.log("Have to delete " + orgUnit.id + " from " + orgUnit.organisationUnitGroups[i].name + "s members");
                console.log(groupsUrl + orgUnit.organisationUnitGroups[i].id + "/" + "organisationUnits/" + orgUnit.id);
                OrgUnits.apiDelete(groupsUrl + orgUnit.organisationUnitGroups[i].id + "/" + "organisationUnits/" + orgUnit.id);
            }

            OrgUnits.apiDelete(unitUrl);
            $scope.currOrgUnit = null;
        }


    }])
    .controller('MyCtrl2', ['$scope', 'OrgUnits', 'MapService', function ($scope, OrgUnits, MapService) {
        $scope.newOrgUnit = {};
        var mapShown = false;

        $scope.parentSet = false;

        $scope.newOrgUnit.parent = OrgUnits.currOrgUnit;

        $scope.setParent = function(parent) {
            $scope.parentSet = true;
        }

        $scope.resetParent = function() {
            $scope.parentSet = false;

        }

        $scope.getCurrOrgUnit = function(id) {
            OrgUnits.getCurrOrgUnit(id).then(function(response) {
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