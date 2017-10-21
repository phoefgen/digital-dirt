// function reference: https://markgoodyear.com/2014/01/getting-started-with-gulp/

// To install requirements: `npm install gulp-ruby-sass gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del gulp-pug pug --save-dev`


/*****************************************************************************/
// setup env.

var gulp = require('gulp'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  del = require('del'),
  browserSync = require('browser-sync').create();
pug = require('gulp-pug');

/*****************************************************************************/
// Setup workflow tasks

gulp.task('styles', function () {
  return sass('src/styles/*.scss', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('scripts', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/assets/img'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('markup', function () {
  return gulp.src('src/html/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('dist/assets/html'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'pug task complete' }));
});

gulp.task('clean', function () {
  return del(['dist/assets/html', 'dist/assets/css', 'dist/assets/js', 'dist/assets/img']);
});


/*****************************************************************************/
// Helper Functions.


gulp.task('default', ['clean'], function () {
  gulp.start('styles', 'markup', 'scripts', 'images', 'watch');
});

gulp.task('watch', function () {
  // Setup watcher.
  browserSync.init({
    server: "./dist/assets/html",
    index: "index.html"
  });

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch pug files
  gulp.watch('src/html/*.pug', ['markup']);

});
