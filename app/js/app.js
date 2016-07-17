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
app.controller("GameCtrl", ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
	// Holder for the next character to reduce loading times
	var next = {};
	// Gets character from Marvel API
	function getChar(game) {
		// Hold on game until character is pre-loaded
		if (game) {
			$scope.charLoaded = false;
		} else {
			$scope.charLoaded = true;
		}
		// Index of current character in Marvel API (1483 max)
		var charNum = Math.floor((Math.random() * 1483)) + 1;
		$http.get("http://gateway.marvel.com/v1/public/characters?ts=1&apikey=fef7d5ab447d43d61cbb442f9c76073f&hash=0151cc0f29d81edd53d5bc5e4ee1122b"
			+ "&limit=1&offset=" + charNum).then(function(results) {
			// Not a valid character without a name & description
			var char = results.data.data.results[0];
			if (char.thumbnail.path == "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available" ||
				char.description == "") {

				charNum = Math.floor((Math.random() * 1500)) + 1;
				if (game) {
					getChar(game);
				} else {
					getChar();
				}
			} else {
				var name = formatName(char.name);
				var desc = char.description;
				var img = char.thumbnail.path + "." + char.thumbnail.extension;
				$scope.charLoaded = true;
				// Prepares a game in advance if not first game
				if (game) {
					gameTransition(game, {name: name, desc: desc, img: img});
				} else {
					next.char = {name: name, desc: desc, img: img};
				}
			}
		});
	};

	// Marvel API returns names as strings with context to what series their from
	// Helper function that formats names into arrays (for game) and removes context (anything wrapped in parens)
	function formatName(charName) {
		// Example name: Cable (Ultimate)
		var name = charName.split("");
		var isContext = false;
		for (var i = 0; i < name.length; i++) {
			if (name[i] == "(" || isContext) {
				if (name[i - 1] == " ") {
					name[i - 1] = "";
				}
				isContext = true;
				name[i] = "";
			}
		}
		// Returns an array of letters of the name
		return name.join("").toUpperCase().split("");
	}
	
	// Takes in passed in game type and activates the selected game
	$scope.chooseGame = function(game) {
		if (game == "guess") {
			$scope.gameType = game;
			getChar('playGuess', false);
		} else if (game == "scramble") {
			$scope.gameType = game
			getChar('playScramble', false);
		}
	};

	// Transitions into game once character loads
	function gameTransition(game, character) {
		if (game == 'playGuess') {
			playGuess(character);
		} else {
			playScramble(character);
		}
	}

	// The guessing game logic
	var playGuess = function(character) {
		// Loads the next character in advance for less transition time
		getChar();

		$scope.character = character;
		$scope.roundWin = false;
		var name = character.name;
		var answer = name;
		var hint = [];
		var hints = Math.floor(name.length / 3);
		// Guarentees at least one hint
		if (hints == 0) {
			hints = 1;
		}
		// Produces hint string that the user sees when guessing
		for (var i = 0; i < name.length; i++) {
			var rand = Math.round(Math.random()); // 50% chance
			if (name[i] == "-" || name[i] == "." || name[i] == "," || name[i] == " ") {
				hint[i] = name[i];
			} else if (rand && hints != 0) { // Randomly adds the hints
				hints--;
				hint[i] = name[i];
			} else {
				hint[i] = "_";
			}
		}
		$scope.hint = hint.join(" ");

		$scope.guess = {};
		$scope.evalGuess = function(guess) {
			if (guess) {
				$scope.guess.letter = guess.toUpperCase();
				$timeout(function() {
					$scope.guess.letter = "";
					console.log($scope.guess.letter);
				}, 1000);
				for (var i = 0; i < answer.length; i++) {
					if (answer[i] == guess.toUpperCase()) {
						hint[i] = guess.toUpperCase();
					}
				}
				$scope.hint = hint.join(" ");
				if (_.isEqual(hint, answer)) {
					$scope.roundWin = true;
					$timeout(function() {
						$scope.roundWin = false;
						playGuess(next.char);
					}, 2000);
				}
			}
		};
	};

	var playScramble = function(character) {
		// Loads the next character in advance for less transition time
		getChar();

		$scope.character = character;
		$scope.roundWin = false;
		var name = character.name;
		var answer = name;
		var shuffled = _.shuffle(name);
		$scope.hint;
		
	};

}]);

// Controller for the leaderboard
app.controller("LeaderboardsCtrl", ["$scope", function($scope) {



}]);

