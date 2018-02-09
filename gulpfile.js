const del          = require('del')
const gulp         = require('gulp')
const rev          = require('gulp-rev')
const csso         = require('gulp-csso')
const uglify       = require('gulp-uglify')
const base64       = require('gulp-base64')
const rename       = require('gulp-rename')
const useref       = require('gulp-useref')
const concat       = require('gulp-concat')
const htmlmin      = require('gulp-htmlmin')
const rmLines      = require('gulp-rm-lines')
const replace      = require('gulp-url-replace')
const htmlclean    = require('gulp-htmlclean')
const gulpSequence = require('gulp-sequence')
const fontSpider   = require('gulp-font-spider')
const revReplace   = require('gulp-rev-replace')
const revdel       = require('gulp-rev-delete-original')

const JS_FOLDER = './public/js/'

// minify
gulp.task('minify-html', () => {
  return gulp
    .src('./public/**/*.html')
    .pipe(htmlclean())
    .pipe(
      htmlmin({
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      })
    )
    .pipe(gulp.dest('./public'))
})

gulp.task('minify-css', () => {
  return gulp
    .src('./public/**/*.css')
    .pipe(csso())
    .pipe(gulp.dest('./public'))
})

gulp.task('minify-js', () => {
  return gulp
    .src(['./public/**/*.js', '!./public/**/*.min.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./public'))
})

gulp.task('minify', ['minify-html', 'minify-css', 'minify-js'])

// bundle
gulp.task('concat', () => {
  const jsFiles = [
    `${JS_FOLDER}src/utils.js`,
    `${JS_FOLDER}src/motion.js`,
    `${JS_FOLDER}src/bootstrap.js`,
    `${JS_FOLDER}src/affix.js`,
    `${JS_FOLDER}src/schemes/*.js`
  ]
  return gulp
    .src(jsFiles)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(JS_FOLDER))
})

gulp.task('merge', () => {
  return gulp
    .src('./public/**/*.html')
    .pipe(useref())
    .pipe(gulp.dest('./public'))
})

gulp.task('revision', () => {
  return gulp
    .src(JS_FOLDER + 'bundle.js')
    .pipe(rev()) // 给bundle.js加上hash版本号
    .pipe(revdel()) // 删除bundle.js
    .pipe(gulp.dest(JS_FOLDER))
    .pipe(rev.manifest())
    .pipe(gulp.dest(JS_FOLDER))
})

gulp.task('revreplace', () => {
  const manifest = gulp.src(JS_FOLDER + 'rev-manifest.json')

  return gulp
    .src('./public/**/*.html')
    .pipe(revReplace({ manifest: manifest })) // 修改HTML中的bundle.js名称
    .pipe(gulp.dest('./public'))
})

gulp.task('bundle', gulpSequence(['concat', 'merge'], 'revision', 'revreplace'))

// font spider
gulp.task('remove-google-fonts', () => {
  return gulp
    .src('./public/index.html')
    .pipe(rename('icon.html'))
    .pipe(rmLines({ filters: [/<link\shref=\"\/\/fonts.googleapis.com/i] }))
    .pipe(gulp.dest('./public'))
})

gulp.task('replace-url', () => {
  return gulp
    .src(['./public/icon.html'])
    .pipe(
      replace({
        'href="//': 'href="https://',
        'href="/lib': 'href="./lib',
        'href="/css': 'href="./css'
      })
    )
    .pipe(gulp.dest('./public'))
})

gulp.task('fontspider', () => {
  return gulp.src('./public/icon.html').pipe(fontSpider())
})

gulp.task(
  'fs',
  gulpSequence('remove-google-fonts', 'replace-url', 'fontspider')
)

gulp.task('base64', () => {
  return gulp
  .src('./public/css/main.css')
  .pipe(
    base64({
      baseDir: './public',
      extensions: ['png', 'svg'],
      maxImageSize: 25 * 1024
    })
  )
  .pipe(gulp.dest('./public/css'))
})

gulp.task('clean', () => {
  del(['./public/icon.html', `${JS_FOLDER}rev-manifest.json`])
  return gulp
    .src('./public/index.html')
    .pipe(rmLines({ filters: [/<div\sclass=\"icon\"/i] }))
    .pipe(gulp.dest('./public'))
})

gulp.task('default', gulpSequence('bundle', 'fs', 'clean', 'minify'))
