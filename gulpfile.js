const fs           = require('fs')
const del          = require('del')
const gulp         = require('gulp')
const rev          = require('gulp-rev')
const csso         = require('gulp-csso')
const swig         = require('gulp-swig')
const data         = require('gulp-data')
const uglify       = require('gulp-uglify')
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
    `${JS_FOLDER}utils.js`,
    // `${JS_FOLDER}motion.js`,
    `${JS_FOLDER}next-boot.js`,
    `${JS_FOLDER}affix.js`,
    `${JS_FOLDER}lean-analytics.js`,
    `${JS_FOLDER}schemes/*.js`
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
    .pipe(rmLines({ filters: [/<link\srel=\"stylesheet\"\shref=\"\/\/fonts.loli.net/i] }))
    .pipe(gulp.dest('./public/temp'))
})

gulp.task('replace-url', () => {
  return gulp
    .src(['./public/temp/index.html'])
    .pipe(
      replace({
        'href="//': 'href="https://',
        'href="/lib': 'href="../lib',
        'href="/css': 'href="../css'
      })
    )
    .pipe(gulp.dest('./public/temp'))
})

gulp.task('fontspider', () => {
  return gulp.src('./public/temp/*.html').pipe(fontSpider())
})

gulp.task('gen-html', () => {
  const tpl = `
    <link href="../lib/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
    <link href="../css/main.css" rel="stylesheet" type="text/css" />
    {% for icon in data %}
    <i class="fa {{ icon }}"></i>
    {% endfor %}
    `

  fs.writeFile('./public/temp/temp.html', tpl, err => {
    if (err) throw err
    console.log('temp.html created!')
  })
})

gulp.task('inject-data', ['gen-html'], () => {
  const icons = {
    data: [
      'fa-pulse',
      'fa-frown-o',
      'fa-spinner',
      'fa-chevron-left',
      'fa-chevron-right'
    ]
  }
  return gulp
    .src('./public/temp/temp.html')
    .pipe(
      data(() => {
        return icons
      })
    )
    .pipe(swig())
    .pipe(gulp.dest('./public/temp'))
})

gulp.task(
  'fs',
  gulpSequence(
    'remove-google-fonts',
    'replace-url',
    'inject-data',
    'fontspider'
  )
)

gulp.task('clean', () => {
  del(['./public/temp', `${JS_FOLDER}rev-manifest.json`])
})

gulp.task('default', gulpSequence('bundle', 'fs', 'minify', 'clean'))
