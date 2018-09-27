/**
 * Runs all application tests.
 */

var gulp = require("gulp");
var gulpMocha = require("gulp-mocha");
var path = require("path");

var config = require("../config");

gulp.task("test", function() {
  return gulp
    .src(path.join(config.TEST_DIR, "**/*.js"))
    .pipe(
      gulpMocha({
        reporter: "spec"
      })
    )
    .once("end", () => {
      process.exit();
    });
});
