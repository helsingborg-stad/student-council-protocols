// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var terser = require('gulp-terser');
var notifier = require('node-notifier');

//Dependecies required to compile ES6 Scripts
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var es = require('event-stream');

// Compile Our Sass
gulp.task('sass-dist', function() {
    gulp.src('source/sass/student-council-protocols.scss')
            .pipe(plumber())
            .pipe(sass())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({suffix: '.min'}))
            .pipe(cssnano())
            .pipe(gulp.dest('dist/css'));
});

gulp.task('sass-dev', function() {
    gulp.src('source/sass/student-council-protocols.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
        .pipe(rename({suffix: '.dev'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('sass', function() {
    var filePath = 'source/sass/';
    var files = ['archive-filtering.scss'];

    var tasks = files.map(function(entry) {
        return gulp
            .src(filePath + entry)
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(
                sass().on('error', function(err) {
                    console.log(err.message);
                    notifier.notify({
                        title: 'SASS Compile Error',
                        message: err.message,
                    });
                })
            )
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist/css'))
            .pipe(cleanCSS({ debug: true }))
            .pipe(gulp.dest('dist/.tmp/css'));
    });

    return es.merge.apply(null, tasks);
});

// Concatenate & Minify JS
gulp.task('scripts-dist', function() {
    gulp.src([
            'source/js/front/**/*.js',
        ])
        .pipe(concat('student-council-protocols.dev.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename('student-council-protocols.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));

    var filePath = 'source/js/';
    var files = ['Module/Event/Index.js'];
    
    var tasks = files.map(function(entry) {
        return (
            browserify({
                entries: [filePath + entry],
                debug: true,
            })
                .transform([babelify])
                .bundle()
                .on('error', function(err) {
                    console.log(err.message);
    
                    notifier.notify({
                        title: 'Compile Error',
                        message: err.message,
                    });
    
                    this.emit('end');
                })
                .pipe(source(entry)) // Converts To Vinyl Stream
                .pipe(buffer()) // Converts Vinyl Stream To Vinyl Buffer
                // Gulp Plugins Here!
                .pipe(sourcemaps.init())
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('dist/js'))
                .pipe(terser())
                .pipe(gulp.dest('dist/.tmp/js'))
        );
    });
    
    return es.merge.apply(null, tasks);
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('source/js/**/*.js', ['scripts-dist']);
    gulp.watch('source/sass/**/*.scss', ['sass-dist', 'sass-dev']);
});

// Default Task
gulp.task('default', ['sass-dist', 'sass-dev', 'scripts-dist', 'watch']);
