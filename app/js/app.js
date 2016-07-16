"use strict";

var app = angular.module("MarvelCards", ["ui.router", "ui.bootstrap", "firebase"]);

app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

	$stateProvider
	// The home page where the user signs in or signs up
	.state("home", {
		url: "/",
		templateUrl: "partials/home.html",
		controller: "HomeCtrl"
	})
	// The card page
	.state("cards", {
		url: "/cards",
		templateUrl: "partials/cards.html",
		controller: "CardsCtrl"
	})
	// The card details page
	.state("cards.details", {
		url: "/cards/details",
		templateUrl: "partials/details.html",
		controller: "DetailsCtrl"
	})
	// The card store page
	.state("cards.store", {
		url: "/cards/store",
		templateUrl: "partials/store.html",
		controller: "StoreCtrl"
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

}]);

app.controller('HomeCtrl', ['$scope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {

		var baseRef = firebase.database().ref();

		/* Authentication */
		var Auth = $firebaseAuth();
		$scope.newUser = {}; //for sign-in

		$scope.signUp = function() {

			// Create user
			Auth.$createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.password)
			.then(function(firebaseUser){ //first time log in
				console.log("signing up");
	    		$scope.userId = firebaseUser.uid; //save userId
				console.log(firebaseUser.uid);


				var userData = {handle:$scope.newUser.handle, avatar:$scope.newUser.avatar,};

				var myRef = baseRef.child('users/'+firebaseUser.uid); //create new entry in object
				myRef.set(userData); //save that data to the database;
			})
 			.catch(function(error) {
          		console.log(error);
        	});
		};

		$scope.signIn = function() {
			Auth.$signInWithEmailAndPassword($scope.newUser.email,$scope.newUser.password);
		};

		// any time auth state changes, add the user data to scope
		Auth.$onAuthStateChanged(function(firebaseUser) {
			if(firebaseUser){
				console.log('logged in');
				$scope.userId = firebaseUser.uid;
			}
			else {
				console.log('logged out');
				$scope.userId = undefined;
			}
		});

		$scope.signOut = function() {
			console.log('logging out');
			Auth.$signOut();
		};

		/* Data */
		var usersRef = baseRef.child('users');
		var whiteboardRef = baseRef.child('whiteboard');
		var chirpsRef = baseRef.child('chirps');

		// Create a firebaseObject of your users, and store this as part of $scope
		$scope.users = $firebaseObject(usersRef);		

		
}]);

app.controller("CardsCtrl", ["$scope", "CharService", function($scope, CharService) {

}]);

app.controller("DetailsCtrl", ["$scope", "CharService", function($scope, CharService) {

}]);

app.controller("StoreCtrl", ["$scope", "CharService", function($scope, CharService) {

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
