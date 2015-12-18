/**
 * Created by Shahzad on 6/05/2015.
 */

(function(){

    'use strict';

    angular.module('titleToolBox')
        .controller('ManageReportsOrderReportCtrl', ManageReportsOrderReportCtrl );

    ManageReportsOrderReportCtrl.$inject = ['$scope', '$controller', 'manageFactory', '$timeout'];

    function ManageReportsOrderReportCtrl( $scope, $controller, manageFactory, $timeout ) {

        /*Extend baseCtrl*/
        $controller('BaseCtrl', {$scope: $scope});

        /*VM functions*/
        $scope.resetForm = resetForm;
        $scope.searchCounties = searchCounties;
        $scope.lookupAddress = lookupAddress;
        $scope.lookupOwner = lookupOwner;
        $scope.lookupAPN = lookupAPN;
        $scope.openShowResultModal = manageFactory.openShowResultModal;
        $scope.showButton = '';
        /*VM properties*/
        $scope.currentPage = 1;
        $scope.lookupAddressObj = { results: [] };
        $scope.lookupOwnerObj = { results: [] };
        $scope.lookupAPNObj = {
            results: []
            //results: [{"SA_PARCEL_NBR_PRIMARY":"02316616","state_county_fips":"06059","USE_CODE_STD":"RSFR","SA_PROPERTY_ID":"38582540","SITE_ADDRESS":"116 18TH ST","SA_SITE_UNIT_VAL":"","SA_SITE_CITY":"HUNTINGTON BEACH","SA_SITE_STATE":"CA","SA_SITE_ZIP":"92648","SA_OWNER_1":"MARSHALL,RYAN DIXON & WENDY","SA_OWNER_2":""},{"SA_PARCEL_NBR_PRIMARY":"08626205","state_county_fips":"06059","USE_CODE_STD":"RSFR","SA_PROPERTY_ID":"38648220","SITE_ADDRESS":"12121 CHIANTI DR","SA_SITE_UNIT_VAL":"","SA_SITE_CITY":"LOS ALAMITOS","SA_SITE_STATE":"CA","SA_SITE_ZIP":"90720","SA_OWNER_1":"MARSHALL,RYAN & KELLY","SA_OWNER_2":""}]
        };
        $scope.accordionStates = [true, false, false];



        /*functions declarations*/
        //to reset a form
        function resetForm( form ) {

            switch( form.$name ) {
                case 'lookupAddressForm':
                    $scope.lookupAddressObj = { results: [] };
                    $scope.showButton = '';
                    //$scope.autocomplete = '';
                    break;
                case 'lookupOwnerForm':
                    $scope.lookupOwnerObj = { results: [] };
                    $scope.showButton = '';
                    break;
                case 'lookupAPNForm':
                    $scope.lookupAPNObj = { results: [] };
                    $scope.showButton = '';
                    break;
            }

            //resets form validation and interaction state
            form.$setPristine();
            form.$setUntouched();
        }

        //search counties with fips
        function searchCounties( lookupObjName, countyName ) {
            //resets previous search results
            $scope[lookupObjName].counties = [];

            if( countyName.length < 3 ) {
                return;
            }

            //console.log(countyName);
            $scope[lookupObjName].sendingCounty = true;

            manageFactory.autocompleteFips( countyName )
                .then(function( counties ) {
                    $scope[lookupObjName].counties = counties;
                    $scope[lookupObjName].sendingCounty = false;
                }, function() {
                    $scope[lookupObjName].sendingCounty = false;
                    //...
                });
        }

        

        //to lookup an address for given details
        function lookupAddress( lookupAddressForm ) {

            //handle form submission with invalid data
            if ( !$scope.lookupAddressObj.data || !Object.keys( $scope.lookupAddressObj.data || {} ).length ) {

                $scope.lookupAddressObj.status = {
                    type : 'error',
                    //message : 'Please fill in the required fields, or search for the property <br/> using the map or the general address search box.'
                    message : 'city & state or zip code required'
                };

                return;
            }

            //resets last attempt results.
            $scope.lookupAddressObj.status = {};

            //setting formSending flag to true.
            $scope.lookupAddressObj.sending = true;

            manageFactory.searchAddressOwnerParcel('address', $scope.lookupAddressObj.data )
                .then(function( resp ) {

                    $scope.lookupAddressObj.status = {
                        type : 'success',
                        message : resp.message
                    };

                    $timeout(function(){
                        $scope.lookupAddressObj.status = {
                            message : ''
                        }
                    }, 3000);

                    $scope.showButton = 'address';
                    $scope.lookupAddressObj.results = resp.results;
                    $scope.lookupAddressObj.sending = false;

                }, function( reason ) {

                    $scope.lookupAddressObj.status = {
                        type : 'error',
                        message : reason
                    };

                    $scope.showButton = '';
                    $scope.lookupAddressObj.sending = false;

                });
        }

        //to lookup an owner for given details
        function lookupOwner( lookupOwnerForm ) {

            //handle form submission with invalid data
            if ( lookupOwnerForm.$invalid ) {

                $scope.lookupOwnerObj.status = {
                    type : 'error',
                    message : 'please correct the red marked fields first.'
                };

                return;
            }

            //resets last attempt results.
            $scope.lookupOwnerObj.status = {};

            //setting formSending flag to true.
            $scope.lookupOwnerObj.sending = true;

            manageFactory.searchAddressOwnerParcel('owner', $scope.lookupOwnerObj.data )
                .then(function( resp ) {

                    $scope.lookupOwnerObj.status = {
                        type : 'success',
                        message : resp.message
                    };

                    $timeout(function(){
                        $scope.lookupOwnerObj.status = {
                            message : ''
                        }
                    }, 3000);

                    $scope.showButton = 'owner';
                    $scope.lookupOwnerObj.results = resp.results;
                    $scope.lookupOwnerObj.sending = false;

                }, function( reason ) {

                    $scope.lookupOwnerObj.status = {
                        type : 'error',
                        message : reason
                    };

                    $scope.showButton = '';
                    $scope.lookupOwnerObj.sending = false;

                });
        }

        //to lookup APN for given details
        function lookupAPN( lookupAPNForm ) {

            //handle form submission with invalid data
            if ( lookupAPNForm.$invalid ) {

                $scope.lookupAPNObj.status = {
                    type: 'error',
                    message: 'please correct the red marked fields first.'
                };

                return;
            }
            //resets last attempt results.
            $scope.lookupAPNObj.status = {};

            //setting formSending flag to true.
            $scope.lookupAPNObj.sending = true;

            manageFactory.searchAddressOwnerParcel('APN', $scope.lookupAPNObj.data )
                .then(function( resp ) {

                    $scope.lookupAPNObj.status = {
                        type : 'success',
                        message : resp.message
                    };

                    $timeout(function(){
                        $scope.lookupAPNObj.status = {
                            message : ''
                        }
                    }, 3000);

                    $scope.showButton = 'APN';
                    $scope.lookupAPNObj.results = resp.results;
                    $scope.lookupAPNObj.sending = false;

                }, function( reason ) {

                    $scope.lookupAPNObj.status = {
                        type : 'error',
                        message : reason
                    };

                    $scope.showButton = '';
                    $scope.lookupAPNObj.sending = false;

                });
        }
    }

})();
