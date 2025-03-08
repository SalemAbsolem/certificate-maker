import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import webp from 'imagemin-webp';

const sass = gulpSass(dartSass);

// Компиляция SCSS
export function compileSass() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
}

// Оптимизация изображений
export function optimizeImages() {
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
export function watch() {
  gulp.watch('src/scss/**/*.scss', compileSass);
  gulp.watch('src/icons/*.{png,jpg,jpeg}', optimizeImages);
}

// Задача по умолчанию
export default gulp.series(compileSass, optimizeImages, watch);
