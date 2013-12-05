var DEFAULTS = {
    minify: true,
    firebaseUrl: 'https://teste-login.firebaseio.com/',
    buildDest: 'build/'
};

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['<%= buildDest %>**/*'],
        copy: {
            min: {
                files: [{
                    src: ['css/bootstrap.min.css', 'css/hint.min.css'],
                    dest: '<%= buildDest %>'
                }, {
                    src: ['favicon.ico', 'apple-touch-icon.png'],
                    dest: '<%= buildDest %>'
                }, {
                    src: ['fonts/**/*'],
                    dest: '<%= buildDest %>'
                }, {
                    src: ['img/**/*'],
                    dest: '<%= buildDest %>'
                }, {
                    src: ['js/bootstrap.min.js'],
                    dest: '<%= buildDest %>'
                }, {
                    src: ['partials/**/*'],
                    dest: '<%= buildDest %>'
                }]
            },
            other: {
                files: [{
                    src: ['css/meuponto.css'],
                    dest: '<%= buildDest %>css/<%= pkg.name %>-<%= pkg.version %>.css'
                }, {
                    src: ['js/meuponto.js'],
                    dest: '<%= buildDest %>js/<%= pkg.name %>-<%= pkg.version %>.js'
                }]
            }
        },
        uglify: {
            build: {
                src: 'js/<%= pkg.name %>.js',
                dest: '<%= buildDest %>js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        cssmin: {
            minify: {
                src: ['css/<%= pkg.name %>.css'],
                dest: '<%= buildDest %>css/<%= pkg.name %>-<%= pkg.version %>.min.css'
            }
        },
        combine: {
            single: {
                input: 'index.html',
                output: '<%= buildDest %>index.html',
                tokens: [{
                    token: '__VERSION__',
                    string: '<%= pkg.version %>'
                }, {
                    token: '__VERSION_SUFIX__',
                    string: '<%= pkg.version %><%= minSufix %>'
                }, {
                    token: '__FIREBASE_URL__',
                    string: '<%= firebaseUrl %>'
                }]
            }
        },
        csslint: {
            strict: {
                src: ['css/<%= pkg.name %>.css'],
                options: {
                    ids: false
                }
            }
        },
        jshint: {
            files: ['js/<%= pkg.name %>.js']
        },
        manifest: {
            generate: {
                options: {
                    basePath: '<%= buildDest %>',
                    verbose: false,
                    timestamp: true
                },
                src: [
                    'css/**/*',
                    'favicon.ico',
                    'fonts/**/*',
                    'img/**/*',
                    'index.html',
                    'js/**/*',
                    'partials/**/*'
                ],
                dest: '<%= buildDest %>manifest.appcache'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-combine');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-manifest');

    grunt.registerTask('default', function() {
        grunt.log.writeln('Available tasks:');
        grunt.log.writeln('-lint');
        grunt.log.writeln('  grunt lint');
        grunt.log.writeln('-build');
        grunt.log.writeln('  grunt build[:minify] [--dest] [--firebase]');
        grunt.log.writeln('  Example: grunt build:' + DEFAULTS.minify + ' --dest ' + DEFAULTS.buildDest + ' --firebase ' + DEFAULTS.firebaseUrl);
        grunt.fail.fatal('Task (lint or build) must be specified.');
    });
    grunt.registerTask('lint', ['csslint', 'jshint']);
    grunt.registerTask('build', function(minify) {
        if (minify === undefined) {
            minify = DEFAULTS.minify;
        } else {
            minify = minify !== '0' && minify !== 'false' && minify !== 'no' ? true : false;
        }
        buildDest = grunt.option('dest') ? grunt.option('dest') : DEFAULTS.buildDest;
        if (buildDest[buildDest.length - 1] !== '/') {
            buildDest = buildDest + '/';
        }
        firebaseUrl = grunt.option('firebase') ? grunt.option('firebase') : DEFAULTS.firebaseUrl;
        grunt.config('buildDest', buildDest);
        grunt.config('firebaseUrl', firebaseUrl);
        grunt.config('minSufix', minify ? '.min' : '');
        grunt.log.writeln('Build path: ' + buildDest);
        grunt.log.writeln('Firebase URL: ' + firebaseUrl);
        grunt.log.writeln('Minify: ' + minify);
        if (minify) {
            grunt.task.run(['clean', 'copy:min', 'uglify', 'cssmin', 'combine:single', 'manifest']);
        } else {
            grunt.task.run(['clean', 'copy:min', 'copy:other', 'combine:single', 'manifest']);
        }
    });
};
