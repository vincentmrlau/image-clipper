/**
 * Created by liuyiman on 2017/6/13.
 */
'use strict'

let gulp = require('gulp')
let browserSync = require('browser-sync')

let reload = browserSync.reload

gulp.task('server', function () {
    browserSync({
        server: {
            baseDir: ''
        }
    })
    gulp.watch(['**/*.*'], {cwd: 'src'}, reload)
})