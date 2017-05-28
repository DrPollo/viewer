const gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const browserSync = require('browser-sync').create();
var babel = require('babelify');


function bundle (bundler) {
    return bundler
        .bundle()
        .on('error', function (e) {
            gutil.log(e.message);
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./js'))
        .pipe(browserSync.stream());
}

gulp.task('watch', function () {
    var watcher = watchify(browserify('./index.js', watchify.args).transform(babel));
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

gulp.task('js', function () {
    return bundle(browserify('./index.js'));
});

gulp.task('default',['watch']);

//
// function compile(watch) {
//     var bundler = watchify(browserify('./index.js', { debug: true }).transform(babel));
//
//     function rebundle() {
//         bundler.bundle()
//             .on('error', function(err) { console.error(err); this.emit('end'); })
//             .pipe(source('bundle.js'))
//             .pipe(buffer())
//             .pipe(sourcemaps.init({ loadMaps: true }))
//             .pipe(sourcemaps.write('./'))
//             .pipe(gulp.dest('./js'));
//     }
//
//     if (watch) {
//         bundler.on('update', function() {
//             console.log('-> bundling...');
//             rebundle();
//         });
//     }
//
//     rebundle();
// }
//
// function watch() {
//     return compile(true);
// };
//
// gulp.task('build', function() { return compile(); });
// gulp.task('watch', function() { return watch(); });
//
// gulp.task('default', ['watch']);