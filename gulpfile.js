"use strict";

/*

	Install dependencies found in package.json (gulp & browser-sync),
	then run 'gulp watch' to spin up server that auto-syncs on save

*/

var gulp = require("gulp");
var sync = require("browser-sync").create();

// Pipes all files from app to the server
gulp.task("build", function() {
	var stream = gulp.src(["app/**/**"])
	.pipe(sync.reload({
		stream: true
	}));
	return stream;
});

// Creates webpage from build folder
gulp.task("sync", function() {
	sync.init({
		server: {
			baseDir: "app"
		}
	});
});

// Makes the watch function wait until the server spins up and the
// other functions are ready to start
gulp.task("watch", ["sync", "build"], function() {
	gulp.watch(["app/**/**"], ["build"]);
});
