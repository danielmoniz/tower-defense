// 'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var babel = require('gulp-babel');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var babelify = require('babelify');
var fs = require('fs');
var exit = require('gulp-exit');
var watch = require('gulp-watch');

var packageJSON = JSON.parse(fs.readFileSync('./package.json'));
var clientOpts = {
  entries: ['./src/js/index.js'],
  debug: true,
  paths: packageJSON.jest.moduleDirectories,
}
var clientDest = './public/javascripts';

function getB(customOpts) {
  // add custom browserify options here
  var opts = assign({}, watchify.args, customOpts);
  var b = watchify(browserify(opts));
  b.transform(babelify); // configuration from .babelrc

  b.on('update', bundle.bind(null, b, clientDest)); // on any dep update, runs the bundler
  b.on('log', gutil.log); // output build logs to terminal

  return b
}

gulp.task('build:client', function() {
  var b = getB(clientOpts)
  var bundledCode = bundle(b, clientDest);
  bundledCode.pipe(exit())
});

gulp.task('watch:client', function() {
  var b = getB(clientOpts)
  bundle(b, clientDest)
});

gulp.task('build:server', function() {
  return gulp.src("src/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'))
});

gulp.task('watch:server', function() {
  return watch("./src/js/**/*.js", { ignoreInitial: false })
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'))
});


gulp.task('build', ['build:client', 'build:server']);
gulp.task('watch', ['watch:client', 'watch:server']);

gulp.task('default', ['build']);

function bundle(b, dest) {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('index.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest(dest));
}
