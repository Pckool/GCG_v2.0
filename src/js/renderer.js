const app = angular.module('gcg-app', ['ngRoute', 'ngAnimate']);
app.config(function($routeProvider){
    $routeProvider
    .when('/',{
        templateUrl: 'home.html',
        controller: 'homeController'
    })
    .when('/settings',{
        templateUrl: 'settings.html',
        controller: 'settingsController'
    })
    .otherwise({
        template: '<h2>You have broken the app and went somewhere you weren\'t supposed to!</h2>' +
        '<p>Please restart or click the button below.</p> <button href="#/!">Go to Home</button>'
    });
});
