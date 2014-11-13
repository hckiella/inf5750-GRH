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
		
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits.jsonp?callback=JSON_CALLBACK&level=2");
	}
	OrgUnits.getOrgUnitsByLevel = function(level) {
		return $http.jsonp("http://inf5750-6.uio.no/api/organisationUnits.jsonp?callback=JSON_CALLBACK" + "&level="+level);
	}
	OrgUnits.getSingleOrgUnit = function(href) {
		return $http.jsonp(href+".jsonp?callback=JSON_CALLBACK");
	}
	return OrgUnits;
}]);

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
