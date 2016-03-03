'use strict';

var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var fsExtra = require('fs-extra');
var filehandler = require('@chickendinosaur/package-generator').filehandler;
var exec = require('child_process').exec;
var runSequence = require('run-sequence');
var babel = require('gulp-babel');
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var usestrictPrefixer = require('@chickendinosaur/gulp-prefixer-usestrict').default;
var licensePrefixer = require('@chickendinosaur/gulp-prefixer-license').default;

var pkg = filehandler.readPackage();

/*
Task groups
 */

gulp.task('clean', function(cb) {
    runSequence(
        'clean-dist',
        'clean-docs',
        cb
    );
});

gulp.task('build', function(cb) {
    runSequence(
        'clean',
        'compile',
        'test',
        'documentation',
        cb
    );
});

gulp.task('test', function(cb) {
    runSequence(
        'jasmine',
        cb
    );
});

gulp.task('compile', function(cb) {
    runSequence(
        'prefix-source',
        'babel',
        cb
    );
});

gulp.task('documentation', function(cb) {
    if (!fs.existsSync('./docs')) {
        fs.mkdirSync('./docs');
    }

    runSequence(
        'clean-docs',
        'yuidoc',
        'readme-usage',
        cb
    );
});

/*
Single tasks
 */

gulp.task('clean-dist', function(cb) {
    exec('rm -rf ' + pkg.chickendinosaur.distURL, function(err, stdout, stderr) {
        cb();
    });
});

gulp.task('clean-docs', function(cb) {
    exec('rm -rf docs/api', function(err, stdout, stderr) {
        cb();
    });
});

gulp.task('yuidoc', function(cb) {
    exec('yuidoc ' + pkg.chickendinosaur.srcURL + ' -p -o docs/api -t node_modules/yuidoc-lucid-theme -H node_modules/yuidoc-lucid-theme/helpers/helpers.js', function(err, stdout, stderr) {
        cb();
    });
});

function generateUsageExampleText(obj) {
    let result = '';

    // Get all examples to be applied to.
    // Create string to be inserted to Usage body.
    for (let key in obj) {
        let example = obj[key].example;

        if (example !== undefined) {
            result += '\n### ' + key +
                '\n```javascript ' +
                example +
                '\n```\n';
        }
    }

    return result;
}

gulp.task('readme-usage', function(cb) {
    // Read in the current readme.
    let readmeStr = filehandler.readReadme();

    let examples = [];
    let usageBody = '';

    if (fs.existsSync('./docs/api/data.json')) {
        // YUI doc parsed data.
        let usageData = fsExtra.readJSONSync('./docs/api/data.json');

        if (usageData) {
            usageBody += generateUsageExampleText(usageData.modules);
            usageBody += generateUsageExampleText(usageData.classes);
            usageBody += generateUsageExampleText(usageData.elements);
        }
    }

    readmeStr = readmeStr.replace(/(\#\s*Usage)[\s\S\r\n]*?(\-\-\-)/, '$1\n' + usageBody + '$2');
    filehandler.writeReadme(readmeStr);
});

/*
Compile
 */

gulp.task('prefix-source', function(cb) {
    return gulp.src([
            path.join(pkg.chickendinosaur.srcURL, '**', '*.{js,css,html}')
        ])
        .pipe(usestrictPrefixer())
        .pipe(licensePrefixer())
        .pipe(gulp.dest(pkg.chickendinosaur.srcURL));
});

gulp.task('babel', function(cb) {
    return gulp.src([
            path.join(pkg.chickendinosaur.srcURL, '**', '*.js')
        ])
        .pipe(babel({
            presets: [
                'es2015',
                'stage-0'
            ],
            plugins: []
        }))
        .pipe(gulp.dest(pkg.chickendinosaur.distURL));
});

/*
Test
 */

gulp.task('jasmine', function(cb) {
    return gulp.src([
            path.join(pkg.chickendinosaur.testURL, 'unit', '**', '*.spec.js')
        ])
        .pipe(jasmine({
            verbose: true,
            includeStackTrace: true,
            reporter: new reporters.TerminalReporter()
        }));
});
