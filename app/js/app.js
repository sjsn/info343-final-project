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
		url: "/details",
		templateUrl: "partials/details.html",
		controller: "DetailsCtrl"
	})
	// The card store page
	.state("cards.store", {
		url: "/store",
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




}]);

app.controller("CardsCtrl", ["$scope", function($scope) {

}]);

app.controller("DetailsCtrl", ["$scope", function($scope) {

}]);

app.controller("StoreCtrl", ["$scope", function($scope) {

}]);

// Controller for the game
app.controller("GameCtrl", ["$scope", "$http", function($scope, $http) {

	// Gets character from Marvel API
	function getChar() {
		// Index of current character in Marvel API (1483 max)
		var charNum = Math.floor((Math.random() * 1483)) + 1;
		$http.get("http://gateway.marvel.com/v1/public/characters?ts=1&apikey=fef7d5ab447d43d61cbb442f9c76073f&hash=0151cc0f29d81edd53d5bc5e4ee1122b"
			+ "&limit=1&offset=" + charNum).success(function(results) {
			// Not a valid character without a name & description
			if (results.data.results[0].thumbnail.path == "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available" ||
				results.data.results[0].description == "") {
			charNum = Math.floor((Math.random() * 1500)) + 1;
				getChar();
			} else {
				var name = formatName(results.data.results[0].name);
				var desc = results.data.results[0].description;
				var img = results.data.results[0].thumbnail.path + "." + results.data.results[0].thumbnail.extension;
				return {name: name, desc: desc, img: img};
			}
		});
	};

	// Marvel API returns names as strings with context to what series their from
	// Helper function that formats names into arrays (for game) and removes context (anything wrapped in parens)
	function formatName(name) {
		// Example name: Cable (Ultimate)
		var name = name.split("");
		var isContext = false;
		for (var i = 0; i < name.length; i++) {
			if (name[i] == "(" || isContext) {
				name[i] = "";
			}
		}
		// Returns an array of letters of the name
		return name.join("").split("");
	}
	
	$scope.chooseGame = function(game) {
		if (game == "guess") {
			$scope.gameType = "Guess the Character!";
		} else if (game == "scramble") {
			$scope.gameType = "Character Scramble!"
		}
	};

}]);

// Controller for the leaderboard
app.controller("LeaderboardsCtrl", ["$scope", function($scope) {



}]);

