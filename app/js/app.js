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
	.state("account", {
		url: "/account",
		templateUrl: "partials/account.html",
		controller: "AccountCtrl"
	})
	// The card page
	.state("cards", {
		url: "/cards",
		templateUrl: "partials/cards.html",
		controller: "CardsCtrl"
	})
	// The card details page
	.state("details", {
		url: "/cards/:id",
		templateUrl: "partials/details.html",
		controller: "DetailsCtrl"
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

	$urlRouterProvider.otherwise("/");

}]);

app.controller('HomeCtrl', ['$scope', 'FirebaseService',
	function($scope, FirebaseService) {

		$scope.newUser = {}; //for sign-in
		$scope.signUp = function() {
			var user = {name: $scope.newUser.handle, email:$scope.newUser.email, password: $scope.newUser.password};
			console.log(user);
			FirebaseService.createUser(user);
		};
		$scope.signIn = function() {
			var user = {name: $scope.newUser.handle, email:$scope.newUser.email, password: $scope.newUser.password};
			FirebaseService.authorize(user);
		};

		$scope.signOut = function() {
			FirebaseService.signOut();
		};

}]);

app.controller("AccountCtrl", ["$scope", 'FirebaseService',
	function($scope, FirebaseService) {

	$scope.currentUser = FirebaseService.currentUser; 
	$scope.changeUser = {}; 

	$scope.changeAccount = function() {
		var updateUser = {name: $scope.changeUser.newhandle, email:$scope.changeUser.email, password:$scope.changeUser.password};
		console.log($scope.currentUser);
		console.log($scope.changeUser);
		FirebaseService.updateUsername(updateUser.name);
/*
		var userRef = baseRef.child($scope.currentUser.currhandle);
		userRef.update({
			"handle":$scope.changeUser.newhandle,
			"password":$scope.changeUser.password,
			"email":$scope.changeUser.email
		});
		console.log(userRef);
*/	
	};
	

}]);

app.controller("CameraCtrl", ["$scope",function($scope) {
	'use strict';

	//wait for document to load
	
	window.onload = function() {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		var localMediaStream;
		var video = document.querySelector('video');
		var canvas = document.querySelector('canvas');
		var brush = canvas.getContext('2d');

		document.querySelector('#record').addEventListener('click',function(){

			navigator.getUserMedia({video:{mandatory:{
				maxWidth:300, maxHeight:300}}}, 
				function(mediaStream) {
					localMediaStream = mediaStream;
					video.src = window.URL.createObjectURL(mediaStream);
				}, function(err) {
				console.log(err)
			});

		})

		document.querySelector('#stop').addEventListener('click',function() {
			video.pause();

		//get all tracks from the stream
			var tracks = localMediaStream.getTracks();
			tracks.forEach(function(track){
				track.stop(); //stop each track
			});
		})

		var masks = ["img/ironman.jpg", "img/batman.jpg"];

		document.querySelector('#selfie').addEventListener('click',function() {
			function buttonChoose(){	
				var value = document.getElementById('maskChoice');
				if(value.checked){
					return "img/ironman.jpg";
				} else{
					return "img/batman.jpg";
				}		
			}

			canvas.width = 300;
			canvas.height = 300;

			var maskImage = document.getElementById("mask");
			document.getElementById('mask').src = buttonChoose();
			console.log(maskImage);
			brush.drawImage(video, 0, 0);
			brush.drawImage(maskImage, 80,80);
			
		});
		document.querySelector('#save').addEventListener('click',function() {
			var snapshot = canvas.toDataURL('image/png');
			var link = document.createElement('a');
			link.href = snapshot;
			link.download = 'my-selfie.png';
			link.click();    
		});

	};
	
}])

// Controller for the cards grid
app.controller('CardsCtrl', ['$scope', '$http', 'FirebaseService', "$timeout", function($scope, $http, FirebaseService, $timeout) {
	if (FirebaseService.getUser()) { // Loads cards immediately if webpage started somewhere else
		$scope.chars = FirebaseService.getCards(); 
	} else { // Gives the cards a little while to load if page starts on cards
		$scope.loading = true;
		$timeout(function() {
			$scope.chars = FirebaseService.getCards();
			$scope.loading = false;
		}, 1000);
	}
}]);

// Controller for the "details" section of a card
app.controller('DetailsCtrl', ['$scope', '$http', '$stateParams', 'FirebaseService', function($scope, $http, $stateParams, FirebaseService) {
	$scope.loading = true;
	var theIndex = -1;
	$scope.thisChar = {};
	FirebaseService.getCards().$loaded().then(function(cards) {
		var i = 0;
		_.forEach(cards, function(card) {
			if (card.id == $stateParams.id) {
				console.log(card.id);
				theIndex = i;
				console.log(i);
			}
			i++;
		});
		$scope.thisChar.card = cards[theIndex];
		console.log($scope.thisChar);
		$scope.loading = false;
	});
}]);



// Controller for the games
app.controller("GameCtrl", ["$scope", "$http", "$timeout", "FirebaseService", function($scope, $http, $timeout, FirebaseService) {
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

		// test hash: 35482198cd607298376e396b611751e6
		// test key: 52bc1f9f7dd809c3b85c35bc6c107953
		// real hash: 0151cc0f29d81edd53d5bc5e4ee1122b
		// real key: fef7d5ab447d43d61cbb442f9c76073f

		// Index of current character in Marvel API (1483 max)
		var charNum = Math.floor((Math.random() * 1483)) + 1;
		$http.get("http://gateway.marvel.com/v1/public/characters?ts=1&apikey=52bc1f9f7dd809c3b85c35bc6c107953&hash=35482198cd607298376e396b611751e6"
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
				var fullName = char.name;
				var id = char.id;
				$scope.charLoaded = true;
				// Prepares a game in advance if not first game
				if (game) {
					gameTransition(game, {id: id, name: name, desc: desc, img: img, fullName: fullName});
				} else {
					next.char = {id: id, name: name, desc: desc, img: img, fullName:fullName};
				}
			}
		}, function() { // runs again when promise fails to load
			console.log("fail");
			if (game) {
				getChar(game);
			} else {
				getChar();
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
		var theCard = character;
		$scope.character = character;
		$scope.roundWin = false;
		var name = character.name;
		var answer = name;
		console.log(answer);
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
				}, 500);
				for (var i = 0; i < answer.length; i++) {
					if (answer[i] == guess.toUpperCase()) {
						hint[i] = guess.toUpperCase();
					}
				}
				$scope.hint = hint.join(" ");
				if (_.isEqual(hint, answer)) {
					$scope.roundWin = true;
					FirebaseService.updateCards(theCard);
					FirebaseService.updateTotalPoints(10);
					$timeout(function() {
						$scope.roundWin = false;
						playGuess(next.char);
					}, 2000);
					// FirebaseService.addCard();
				}
			}
		};
	};

	/******

	TO DO:
	- Fix for characters with spaces/dashes in name
	- Add cursor:point for unclicked
	- Add changecolor for clicked
	- Fix styles for everything else

	******/
	// The Scramble game logic
	var playScramble = function(character) {
		// Loads the next character in advance for less transition time
		getChar();

		$scope.character = character;
		// Variable tracking when board is cleared
		$scope.clear = false;
		$scope.roundWin = false;
		var answer = character.name;
		console.log("answer: " + answer);
		var shuffled = _.shuffle(answer);
		// Keeps special chararcters in same spot after shuffle
		for (var i = 0; i < answer.length; i++) {
			// If current index is special char
			if (shuffled[i] == "-" || shuffled[i] == "." || shuffled[i] == "," || shuffled[i] == "/" || shuffled[i] == " ") {
				shuffled.splice(i, 1); // Remove it
			}
			if (answer[i] == "-" || answer[i] == "." || answer[i] == "," || answer[i] == " ") {
				shuffled.splice(i, 0, answer[i]); // Insert it into the array at the appropriate index
			}
		}
		$scope.hint = [];
		$scope.guessBoard = [];
		console.log("reshuffled: " + shuffled);
		// Produces the scrambled up hint
		for (var i = 0; i < answer.length; i++) {
			if (answer[i] == "-" || answer[i] == "." || answer[i] == "," || answer[i] == "/" ||  answer[i] == " ") {
				if (answer[i] == " ") {
					// Replaces spaces with tabs for readability
					$scope.guessBoard.push("[ ]");
					$scope.hint.push({letter: "[ ]", index: i, guessable: false});
					console.log("space");
				} else {
					$scope.guessBoard.push(answer[i]);
					$scope.hint.push({letter: answer[i], index: i, guessable: false});
					console.log(answer[i]);
				}
			} else {
				$scope.hint.push({letter: shuffled[i], index: i, guessable: true});
				$scope.guessBoard.push("_");
			}
		}
		// Saved for board clears
		var curBoard = _.cloneDeep($scope.guessBoard, 1);
		var permBoard = _.cloneDeep($scope.guessBoard, 1);
		var curHint = _.cloneDeep($scope.hint, 1);
		var permHint = _.cloneDeep($scope.hint, 1);

		$scope.incorrect = false;
		$scope.guess = {};
		$scope.guess.word = "";

		var boardIndex = 0;
		$scope.chooseLetter = function(letter, index) {
			if ($scope.hint[index].guessable) {
				if ($scope.guessBoard[boardIndex] == "-" || 
					$scope.guessBoard[boardIndex] == "." || 
					$scope.guessBoard[boardIndex] == "," ||
					$scope.guessBoard[boardIndex] == "/" || 
					$scope.guessBoard[boardIndex] == "[ ]") {

					boardIndex++;
				} else {
					$scope.hint[index].guessable = false;
					$scope.guessBoard[boardIndex] = letter;
					boardIndex++;
				}
			}
			if (boardIndex == $scope.hint.length) {
				evalGuess($scope.guessBoard.join(""));
			}
		};

		// Check to see if shuffled guess matches answer index
		function evalGuess(guess) {
			if (guess) {
				console.log("checkWin");
				$scope.guess.word = guess.toUpperCase();
				$timeout(function() {
					$scope.guess.word = "";
					$scope.notGuess = true;
				}, 500);
				guess = guess.toUpperCase().split("");
				if (_.isEqual(guess, answer)) {
					$scope.roundWin = true;
					FirebaseService.updateCards($scope.character);
					FirebaseService.updateTotalPoints(10);
					$scope.incorrect = false;
					$timeout(function() {
						$scope.roundWin = false;
						playScramble(next.char);
					}, 2000);
				} else {
					$scope.incorrect = true;
					clearBoard();
					boardIndex = 0;
				}
			}
		};

		// Resets game board on failed guess
		function clearBoard() {
			$scope.clear = true;
			// Keep answer up for one second, then redraw
			$timeout(function() {
				for (var i = 0; i < $scope.guessBoard.length; i++) {
					console.log(curBoard[i]);
					$scope.guessBoard[i] = curBoard[i];
					console.log(curHint[i]);
					$scope.hint[i] = curHint[i];
				}
				curBoard = _.cloneDeep(permBoard, 1);
				curHint = _.cloneDeep(permHint, 1);
				$scope.clear = false;				
			}, 1000);
		}
	};

	// Takes the user back to the "choose game" menu
	$scope.goBack = function() {
		$scope.gameType = "";
	};

	// Skips the current character
	$scope.skipChar = function(gameType) {
		$scope.charLoaded = false;
		$scope.chooseGame(gameType);
	};

}]);

// Controller for the leaderboard
app.controller("LeaderboardsCtrl", ["$scope", "FirebaseService", function($scope, FirebaseService) {
	// Default ordering is total points
	$scope.order = 'totalPoints';

	$scope.loading = true;
	FirebaseService.getUsers().$loaded().then(function(users) {
		$scope.users = users;
		$scope.loading = false;
		console.log(users);
	});

	// Searches for user inputted username
	/* Haven't decided if loading all at once or pages */
	$scope.searchFor = function(username) {
		// Loop through total users testing each username against passed in username
	}


}]);

// Service for all interactions with Firebase
app.factory("FirebaseService", ["$firebaseAuth", "$firebaseObject", "$firebaseArray", function($firebaseAuth, $firebaseObject, $firebaseArray) {

	var service = {};
	var baseRef = firebase.database().ref();
	var userID;
	var currUserObj;
	var currUserRef;
	var Auth = $firebaseAuth();
	var usersRef = baseRef.child('users');
	var cardsRef;
	var cardsArray;
	/*
		Structure:

		var obj = $firebaseObject( reference to firbase database );
		obj.thing-to-update = newValue;
		obj.save().then( function() {
			Do something to let user know the value successfully updated
		}, function() {
			Do something to alert user that it failed
		});
	*/

	// any time auth state changes, add the user data to scope
	Auth.$onAuthStateChanged(function(firebaseUser) {
		if(firebaseUser){
			console.log('logged in');
			userID = firebaseUser.uid;
			currUserRef = usersRef.child(""+userID);
			currUserObj = $firebaseObject(currUserRef);
			cardsRef = currUserRef.child("cards");
			cardsArray = $firebaseArray(cardsRef);
		}
		else {
			console.log('logged out');
			userID = undefined;
		}
	});

	service.getUser = function() {
		return currUserObj;
	};

	// Takes in a user object and adds them to the firebase authorizor
	service.createUser = function(user) {
		service.currentUser = user;
		
		/* Authentication */
		
		// Create user
		Auth.$createUserWithEmailAndPassword(user.email, user.password)
		.then(function(firebaseUser){ //first time log in
			console.log("signing up");
	    	userID = firebaseUser.uid; //save userId
			var userData = {handle: user.name, thumbnail: "", totalPoints: 0};
			currUserRef = baseRef.child('users/'+firebaseUser.uid); //create new entry in object
			currUserRef.set(userData); //save that data to the database;
			currUserObj = $firebaseObject(currUserRef);
		})
 		.catch(function(error) {
      		console.log(error);
    	});
	};

	// Signs user in with credentials stored in passed in user object
	service.authorize = function(user) {
		Auth.$signInWithEmailAndPassword(user.email, user.password);
	};

	// Signs user out
	service.signOut = function() {
		service.currentUser = "";
		console.log('logging out');
		Auth.$signOut();
	};

	// Takes in newUsername string and updates it on firebase
	service.updateUsername = function(newUsername) {
		currUserObj.handle = newUsername;
		currUserObj.$save().then(function() {
			console.log('success');
		}, function() {
			console.log('error');
		})
	};

	// Takes in newThumbnail string(?) and updates it on firebase	
	service.updateThumbnail = function(newThumbnail) {
		currUserObj.thumbnail = newThumbnail;
		currUserObj.$save().then(function() {
			console.log('success');
		}, function() {
			console.log('error');
		})
	};

	// Takes in newTotal int and updates it on firebase
	service.updateTotalPoints = function(points) {
		currUserObj.totalPoints = currUserObj.totalPoints + points;
		currUserObj.$save().then(function() {
			console.log(currUserObj.totalPoints);
			console.log("success");
		}, function(e) {
			console.log(e);
		});
	};

	service.getTotalPoints = function() {
		return currUserObj.totalPoints;
	}

	// Takes in newCard object and updates it on firebase
	// newCard structure: {name, thumbnail, description}
	service.updateCards = function(newCard) {
		cardsRef = currUserRef.child('cards');
		cardsArray = $firebaseArray(cardsRef);
		cardsArray.$add(newCard);
	};

	// Returns an array of card objects
	service.getCards = function() {
		cardsRef = currUserRef.child("cards");
		cardsArray = $firebaseArray(cardsRef);
		return cardsArray;
	};

	service.getUsers = function() {
		return $firebaseArray(usersRef);
	};

	service.updateLeaders = function(user) {

	};

	return service;

}]);

/*
User firebase structure
[
	{
		"handle": "",
		"thumbnail": "",
		"totalPointns": "",
		"cards": [
			{"id" = "",
			 "name" = "",
			 "thumbnail" = "",
			 "description" = ""}
		]

	}
]

*/
