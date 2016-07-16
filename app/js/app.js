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

app.controller('HomeCtrl', ['$scope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', "$http",
	function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http) {

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

app.controller("CardsCtrl", ["$scope", function($scope) {

}]);

app.controller("DetailsCtrl", ["$scope", function($scope) {

}]);

app.controller("StoreCtrl", ["$scope", "CharService", function($scope, CharService) {

}]);

// Controller for the game
app.controller("GameCtrl", ["$scope", "UserService", "$http", function($scope, UserService, $http) {

	// Index of current character in Marvel API
	var charNum = Math.floor((Math.random() * 1500)) + 1;
	var character;
	// Gets character from Marvel API
	var getChar = function() {
		$http.get("http://gateway.marvel.com/v1/public/characters?ts=1&apikey=fef7d5ab447d43d61cbb442f9c76073f&hash=0151cc0f29d81edd53d5bc5e4ee1122b"
			+ "&limit=1&offset=" + charNum).success(function(results) {
			if (results.data.results[0].thumbnail.path == "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available") {
			charNum = Math.floor((Math.random() * 1500)) + 1;
				getChar();
			} else {
				character = results.data.results[0];
				console.log(character);
			}
		});
	};

	getChar();

}]);

// Controller for the leaderboard
app.controller("LeaderboardsCtrl", ["$scope", "UserService", function($scope, UserService) {



}]);

// // A service to keep track of all possible characters in the game.
// // Loads on initial page load to reduce laggy loads / number of API calls while using app
// app.factory("CharService", ["$http", function($http) {

// 	var service = {};

// 	// Instantiates the characters array in the service 
// 	service.characters = [];
// 	for (var i = 0; i < 10; i++) {
// 		$http.get("http://gateway.marvel.com/v1/public/characters?ts=1&apikey=fef7d5ab447d43d61cbb442f9c76073f&hash=0151cc0f29d81edd53d5bc5e4ee1122b"
// 			+ "&limit=100&offset=" + (i * 100))
// 		.success(function(results) {
// 			// An array of character information. 
// 			// Name is .name, description is .description, image is .thumbnail.path + "." + .thumbnail.extension
// 			_(results.data.results).forEach(function(character) {
// 				// Only add characters with a thumbnail available
// 				if (character.thumbnail.path != "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available") {
// 					service.characters.push(character);
// 				}
// 			});
// 			console.log(service.characters);
// 		});
// 	}


// 	return service;


// }]);
