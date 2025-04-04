// gulpfile.mjs

import gulp from "gulp";
import * as sass from "sass";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import browserSyncLib from "browser-sync";

const browserSync = browserSyncLib.create();
const scss = gulpSass(sass);

export function compileSCSS() {
  return gulp
    .src("scss/main.scss") // <--- Path to your main.scss
    .pipe(sourcemaps.init())
    .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
}

function watchFiles() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  gulp.watch("scss/**/*.scss", compileSCSS);
  gulp.watch("*.html").on("change", browserSync.reload);
  gulp.watch("*.js").on("change", browserSync.reload);
}

export default gulp.series(compileSCSS, watchFiles);
