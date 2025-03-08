const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const webp = require('imagemin-webp');

// Компиляция SCSS
function compileSass() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
}

// Оптимизация изображений
function optimizeImages() {
  return gulp.src('src/icons/*.{png,jpg,jpeg}')
    .pipe(
      imagemin([
        pngquant({ quality: [0.6, 0.8] }),
        mozjpeg({ quality: 80 }),
        webp({ quality: 80 }),
      ])
    )
    .pipe(gulp.dest('dist/icons'));
}

// Слежение за изменениями
function watch() {
  gulp.watch('src/scss/**/*.scss', compileSass);
  gulp.watch('src/icons/*.{png,jpg,jpeg}', optimizeImages);
}

exports.default = gulp.series(compileSass, optimizeImages, watch);