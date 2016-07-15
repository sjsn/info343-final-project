"use strict";

var app = angular.module("MarvelCards", ["ui.router", "ui.bootstrap"]);

app.config("$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

	$stateProvider
	// The home page where the user signs in or signs up
	.state("home", {
		url: "/"
		templateUrl: "partials/home.html",
		controller: "HomeCtrl"
	})
	// The game page
	.state("game", {
		url: "/game",
		templateUrl: "partials/game.html",
		controller: "GameCtrl"
	})
	// The leaderboard page
	.state("leaderboards", {
		url: "/leaderboards",
		templateUrl: "partials/leaderboards.html",
		controller: "LeaderboardsCtrl"
	});

});

app.controller("HomeCtrl", ["$scope", "UserService", "CharService", function($scope, UserService, CharService) {



}]);


// Controller for the game
app.controller("GameCtrl", ["$scope", "UserService", "CharService", function($scope, UserService, CharService) {



}]);

// Controller for the leaderboard
app.controller("LeaderboardsCtrl", ["$scope", "UserService", "CharService", function($scope, UserService, CharService) {



}]);

// A service to keep track of all possible characters in the game.
// Loads on initial page load to reduce laggy loads / number of API calls while using app
app.factory("CharService", ["$http", function($http) {

	var service = {};

	// Instantiates the characters array in the service 
	$http.get("http://gateway.marvel.com/v1/public/characters?ts=1&apikey=fef7d5ab447d43d61cbb442f9c76073f&hash=0151cc0f29d81edd53d5bc5e4ee1122b")
	.success(function(results) {
		// An array of character information. 
		// Name is .name, description is .description, image is .thumbnail.path + "" + .thumbnail.extension
		service.characters = results.data.results;
	});

	return service;


}]);
