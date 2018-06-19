var app = angular.module('gcg-app', ['ngRoute']);
app.config(function($routeProvider){
    $routeProvider
    .when('/',{
        templateUrl: 'main.html'
    })
    .when('/settings',{
        templateUrl: 'settings.html'
    });
});
