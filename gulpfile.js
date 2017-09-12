const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify',{"debug":true});
const watchify = require('watchify');
const browserSync = require('browser-sync').create();
const babel = require('babelify');


function bundle (bundler) {
    return bundler
        .bundle()
        .on('error', function (e) {
            gutil.log(e.message);
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.stream());
}

gulp.task('watch', function () {
    var watcher = watchify(browserify('./js/index.js', watchify.args).transform(babel));
    bundle(watcher);
    watcher.on('update', function () {
        bundle(watcher);
    });
    watcher.on('log', gutil.log);

    browserSync.init({
        server: './',
        logFileChanges: false
    });
});

gulp.task('build', function () {
    return bundle(browserify('./index.js'));
});

gulp.task('test',function () {
    browserSync.init({
        server: './',
        logFileChanges: false
    });
});

gulp.task('default',['watch']);