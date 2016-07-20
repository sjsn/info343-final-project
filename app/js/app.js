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
	.state("signin", {
		url: "/signin",
		templateUrl: "partials/signin.html",
		controller: "SigninCtrl"
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

		$scope.auth = FirebaseService.auth();
		$scope.auth.$onAuthStateChanged(function(firebaseUser) {
			if (firebaseUser) {
				var uid = firebaseUser.uid;
				$scope.user = FirebaseService.obj(FirebaseService.users(uid));
			}
		});

		$scope.useShield = function() {
			$scope.user.thumbnail = "img/small-shield.png";
			$scope.default = true;
		};

		$scope.checkClass = function() {
			if ($scope.user.thumbnail != "img/small-shield.png") {
				document.getElementById("smallPic").height = "55";
				return "prof-pic";
			} else {
				return "default";
			}
		};

}]);

app.controller("SigninCtrl", ["$scope", "FirebaseService", "$state",
	function($scope, FirebaseService, $state) {

		$scope.auth = FirebaseService.auth();
		$scope.auth.$onAuthStateChanged(function(firebaseUser) {
			if (firebaseUser) {
				var uid = firebaseUser.uid;
				$scope.user = FirebaseService.obj(FirebaseService.users(uid));
			}
		});
		

		$scope.newUser = {}; //for sign-in
		$scope.signUp = function() {
			var user = {name: $scope.newUser.handle, email:$scope.newUser.email, password: $scope.newUser.password};
			FirebaseService.createUser(user);
			$state.go("home")
		};
		$scope.signIn = function() {
			var user = {name: $scope.newUser.handle, email:$scope.newUser.email, password: $scope.newUser.password};
			FirebaseService.authorize(user);
			$state.go("home");
		};

}]);

app.controller("AccountCtrl", ["$scope", 'FirebaseService', "$state",
	function($scope, FirebaseService, $state) {

	// Gets the current user
	$scope.currentUser = FirebaseService.currentUser; 
	$scope.changeUser = {}; 

	// Alters the account settings
	$scope.changeAccount = function() {
		var updateUser = {name: $scope.changeUser.newhandle, email:$scope.changeUser.email, password:$scope.changeUser.password};
		FirebaseService.updateUsername(updateUser.name);	
	};

	// Signs the user out on button click
	$scope.signOut = function() {
		console.log("signout");
		FirebaseService.signOut();
		// Redirects the user to homepage
		$state.go("home");
	};

}]);

app.controller("CameraCtrl", ["$scope", 'FirebaseService', "$interval", 
	function($scope, FirebaseService, $interval) {

	//wait for document to load
	
	window.onload = function() {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		var localMediaStream;
		var video = document.querySelector('video');
		var canvas = document.querySelector('canvas');
		var brush = canvas.getContext('2d');
		$scope.cameraOn = false;
		

		document.querySelector('#record').addEventListener('click',function(){

			navigator.getUserMedia({video:{mandatory:{
				maxWidth:300, maxHeight:300}}}, 
				function(mediaStream) {
					localMediaStream = mediaStream;
					video.src = window.URL.createObjectURL(mediaStream);
					$scope.$apply(function() {
						$scope.cameraOn = true;
					});
				}, function(err) {
				console.log(err)
			});
			console.log($scope.theMask);
			// Redraws the canvas every 20 milliseconds to keep it "live" with what the user
			// sees on the video stream. Illiminates the need for 2 views of the same thing
			$interval(function() {
				canvas.width = video.clientWidth;
				canvas.height = video.clientHeight;
				brush.drawImage(video, 0, 0);
				var drawMask = document.getElementById('mask');
				brush.drawImage(drawMask, 75, 25);
			}, 20);

		})

		$scope.theMask = {};
		document.querySelector('#iron').addEventListener('click',function() {
			$scope.theMask.mask = "img/ironman.jpg";
		});
		document.querySelector('#bat').addEventListener('click',function() {
			$scope.theMask.mask = "img/batman.jpg"
		});
		document.querySelector('#spider').addEventListener('click',function() {
			$scope.theMask.mask = "img/spiderman.jpg"
		});
		

		$scope.delete = function() {
			brush.fillStyle = "#FFFFFF";
			brush.clearRect(0, 0, canvas.width, canvas.height);

			// Redraws the canvas every 20 milliseconds to keep it "live" with what the user
			// sees on the video stream. Illiminates the need for 2 views of the same thing
			$interval(function() {
				canvas.width = video.clientWidth;
				canvas.height = video.clientHeight;
				brush.drawImage(video, 0, 0);
				// brush.drawImage($scope.theMask, 80, 80);
			}, 20);

			navigator.getUserMedia({video:{mandatory:{
				maxWidth:300, maxHeight:300}}}, 
				function(mediaStream) {
					localMediaStream = mediaStream;
					video.src = window.URL.createObjectURL(mediaStream);
					$scope.$apply(function() {
						$scope.cameraOn = true;
					});
				}, function(err) {
				console.log(err)
			});

		}


		// Initiates a countdown to let the user know when the picture is taken
		// Stops video feed when picture is taken
		$scope.countDown = function() {
			$scope.count = 3;
			var timer = $interval(function() {
				$scope.count--;
				if ($scope.count == -1) {
					var tracks = localMediaStream.getTracks();
					video.pause();
					tracks.forEach(function(track){
						track.stop(); //stop each track
					});
					$interval.cancel(timer);
					timer = null;
					$scope.count = null;
				}
			}, 1000);
		};

		$scope.save = function() {

			var snapshot = canvas.toBlob(function(blob) {
				var image = new Image();
				image.src = blob;
				FirebaseService.updateThumbnail(blob);
			});

		};

	};
	
}])

// Controller for the cards grid
app.controller('CardsCtrl', ['$scope', '$http', 'FirebaseService', "$timeout", function($scope, $http, FirebaseService, $timeout) {
	// Instantiates the loading bar to true
	$scope.loading = true;
 	// Gets the users card collection when Firebase verifies that they're signed in
	$scope.auth = FirebaseService.auth();
	$scope.auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			$scope.chars = FirebaseService.arr(FirebaseService.getCards());
			$scope.loading = false; // Turns off loading icon when everything is good
		}
	});

}]);

// Controller for the "details" section of a card
app.controller('DetailsCtrl', ['$scope', '$http', '$stateParams', 'FirebaseService', function($scope, $http, $stateParams, FirebaseService) {
	// Instantiates the page with load icon on
	$scope.loading = true;

	// Gets the id of the current card to reference
	var theIndex = -1;
	$scope.thisChar = {};
	FirebaseService.arr(FirebaseService.getCards()).$loaded().then(function(cards) {
		var i = 0;
		_.forEach(cards, function(card) {
			if (card.id == $stateParams.id) {
				theIndex = i;
			}
			i++;
		});
		$scope.thisChar.card = cards[theIndex];
		$scope.loading = false; // Turns off the loading icon
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
		console.log(next);
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
				$scope.guess.letter = "";
				for (var i = 0; i < answer.length; i++) {
					if (answer[i] == guess.toUpperCase()) {
						hint[i] = guess.toUpperCase();
					}
				}
				$scope.hint = hint.join(" ");
				if (_.isEqual(hint, answer)) {
					$scope.roundWin = true;
					// Not currently working
					FirebaseService.updateCards(theCard);
					console.log($scope.isNew);
					FirebaseService.updateTotalPoints(10);
					$timeout(function() {
						$scope.roundWin = false;
						playGuess(next.char);
						$scope.isNew = "";
					}, 2000);
					// FirebaseService.addCard();
				}
			}
		};
	};

	// The Scramble game logic
	var playScramble = function(character) {
		// Loads the next character in advance for less transition time
		getChar();

		$scope.character = character;
		var theCard = character;
		// Variable tracking when board is cleared
		$scope.clear = false;
		$scope.roundWin = false;
		var answer = character.name;
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
		// Produces the scrambled up hint
		for (var i = 0; i < answer.length; i++) {
			if (answer[i] == "-" || answer[i] == "." || answer[i] == "," || answer[i] == "/" ||  answer[i] == " ") {
				if (answer[i] == " ") {
					// Replaces spaces with tabs for readability
					$scope.guessBoard.push("[ ]");
					$scope.hint.push({letter: "[ ]", index: i, guessable: false});
				} else {
					$scope.guessBoard.push(answer[i]);
					$scope.hint.push({letter: answer[i], index: i, guessable: false});
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
			$scope.guessed = letter;
			console.log($scope.guessed);
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
				$scope.guess.word = guess.toUpperCase();
				$timeout(function() {
					$scope.guess.word = "";
					$scope.notGuess = true;
				}, 500);
				guess = guess.toUpperCase().split("");
				if (_.isEqual(guess, answer)) {
					$scope.roundWin = true;
					// Not currently working
					FirebaseService.updateCards(theCard);
					FirebaseService.updateTotalPoints(10);
					$scope.incorrect = false;
					$timeout(function() {
						$scope.roundWin = false;
						$scope.isNew = "";
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
					$scope.guessBoard[i] = curBoard[i];
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
	$scope.order = '-totalPoints';

	// Helper object that allows for getting # of cards since Firebase stores arrays as objects in objects
	$scope.utils = {
		keys: Object.keys
	};

	// Gets list of all users as an array
	$scope.loading = true;
	FirebaseService.getUsers().$loaded().then(function(users) {
		$scope.users = users;
		$scope.loading = false;
	});

	// Gets the users pic taking in their handle
	$scope.userImg = function(handle) {
		FirebaseService.getUsersThumbnails(handle).$loaded().then(function(url) {
			return url;
		});
	};

	// Helper function to determine if user has any cards or not
	$scope.hasCards = function(cards) {
		return cards === undefined;
	};


}]);

// Service for all interactions with Firebase
app.factory("FirebaseService", ["$firebaseAuth", "$firebaseObject", "$firebaseArray", function($firebaseAuth, $firebaseObject, $firebaseArray) {

	var service = {};
	var baseRef = firebase.database().ref();
	var usersRef = baseRef.child('users');
	var storageRef = firebase.storage().ref();
	var userID;
	var currUserObj;
	var currUserRef;
	var Auth = $firebaseAuth();
	var cardsRef;
	var cardsArray;

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

	// Gives access to firebase authorization to determine if a user is signed in or
	// not from any page
	service.auth = function() {
		return $firebaseAuth();
	};

	// Gives acces to reference to the user on firebase
	service.users = function(uid) {
		return usersRef.child(""+uid);
	};

	// Converts the passed in reference to a usable firebase object
	service.obj = function(ref) {
		return $firebaseObject(ref);
	};

	// Converts the passed in reference to a usable firebase array
	service.arr = function(ref) {
		return $firebaseArray(ref);
	};

	// Returns a usable object version of the user
	service.getUser = function() {
		return currUserObj;
	};

	// Returns firebase array (object of objects) containing all the registered users
	service.getUsers = function() {
		return $firebaseArray(usersRef);
	};

	// Takes in newThumbnail img, pushes it to FirebaseStorage and saves its URL to the user in the database
	// Only need to call this when a new image is added, otherwise we get image from user object
	service.updateThumbnail = function(newThumbnail) {
		// Adds the newThumbnail to Firebase Storage
		var storeImg = storageRef.child('images/' + currUserObj.handle).put(newThumbnail).then(function() {
			// Then gets the URL of that new image
			storageRef.child("images/" + currUserObj.handle).getDownloadURL().then(
				// Then puts that URL into the user object in the database to be referenced later
				function(url) {
					currUserObj.thumbnail = url;
					currUserObj.$save().then(
						function() {
							console.log("success");
						},
						function(e) {
							console.log(e);
						}
					);	
				}
			);
		});
	};

	// Takes in a user object and adds them to the firebase authorizor
	service.createUser = function(user) {
		service.currentUser = user;
		
		// Create user
		Auth.$createUserWithEmailAndPassword(user.email, user.password)
		.then(function(firebaseUser) { //first time log in
			console.log("signing up");
	    	userID = firebaseUser.uid; //save userId
			var userData = {handle: user.name, thumbnail: "", totalPoints: 0, cards: {}};
			currUserRef = baseRef.child('users/'+firebaseUser.uid); //create new entry in object
			currUserRef.set(userData); //save that data to the database
			currUserObj = $firebaseObject(currUserRef); // get that object for later use
		})
 		.catch(function(error) {
      		alert(error.message);
    	});
	};

	// Signs user in with credentials stored in passed in user object
	service.authorize = function(user) {
		Auth.$signInWithEmailAndPassword(user.email, user.password)
		.catch(function(error) {
			alert(error.message);
		});
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

	// Returns the total number of points a user has
	service.getTotalPoints = function() {
		return currUserObj.totalPoints;
	};

	// Takes in newCard object and updates it on firebase
	// newCard structure: {name, thumbnail, description}
	service.updateCards = function(newCard) {
		cardsRef = currUserRef.child('cards');
		$firebaseArray(cardsRef).$loaded().then(function(array) {
			cardsArray = array;
			var isNew = true;
			_(cardsArray).forEach(function(card) {
				if (card.id == newCard.id) {
					isNew = false;
				}
			});
			if (isNew) {
				cardsArray.$add(newCard);
			}
			return isNew;
		});
	};

	// Returns a reference to the users card
	service.getCards = function() {
		return currUserRef.child("cards");
	};

	return service;

}]);
