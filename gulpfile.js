const gulp = require('gulp');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify',{"debug":true});
const watchify = require('watchify');
const browserSync = require('browser-sync').create();
const babel = require('babelify');
const minify = require('gulp-babel-minify');

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
    let watcher = watchify(browserify('./js/main.js', watchify.args).transform(babel));
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
    return bundle(browserify('./js/main.js'));
});
gulp.task("minify", () =>
    gulp.src("./build/bundle.js")
        .pipe(minify({
            mangle: {
                keepClassName: true
            }
        }))
        .pipe(gulp.dest("./dist"))
);
gulp.task('compile',['build','minify']);

gulp.task('test',function () {
    browserSync.init({
        server: './',
        logFileChanges: false
    });
});

gulp.task('default',['watch']);