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
                    src: ['css/bootstrap.min.css', 'css/font-awesome.min.css', 'css/hint.min.css', 'css/bootstrap-social.min.css'],
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
                    src: ['partials/config.html'],
                    dest: '<%= buildDest %>partials/config-<%= pkg.version %>.html'
                }, {
                    src: ['partials/data.html'],
                    dest: '<%= buildDest %>partials/data-<%= pkg.version %>.html'
                }, {
                    src: ['partials/detail.html'],
                    dest: '<%= buildDest %>partials/detail-<%= pkg.version %>.html'
                }, {
                    src: ['partials/list.html'],
                    dest: '<%= buildDest %>partials/list-<%= pkg.version %>.html'
                }, {
                    src: ['partials/help.html'],
                    dest: '<%= buildDest %>partials/help-<%= pkg.version %>.html'
                }, {
                    src: ['partials/login.html'],
                    dest: '<%= buildDest %>partials/login-<%= pkg.version %>.html'
                }]
            },
            css: {
                files: [{
                    src: ['css/meuponto.css'],
                    dest: '<%= buildDest %>css/<%= pkg.name %>-<%= pkg.version %>.css'
                }]
            }
        },
        uglify: {
            build: {
                src: 'js/**/*',
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
            files: ['js/*.js']
        },
        concat: {
            options: {
                separator: ';',
            },
            lib: {
                src: ['lib/jquery-1.10.2.min.js', 'lib/angular-1.0.8.min.js', 'lib/firebase.min.js', 'lib/firebase-auth-client.min.js', 'lib/angularfire.min.js', 'lib/facebook-all.min.js', 'lib/moment-2.2.1.min.js', 'lib/moment-pt-br.min.js', 'lib/mousetrap.min.js', 'lib/bootstrap.min.js'],
                dest: '<%= buildDest %>js/libs-<%= pkg.version %>.min.js'
            },
            js: {
                src: ['js/**/*'],
                dest: '<%= buildDest %>js/<%= pkg.name %>-<%= pkg.version %>.js'
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
    grunt.loadNpmTasks('grunt-contrib-concat');

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
            grunt.task.run(['clean', 'copy:min', 'cssmin', 'uglify', 'combine:single', 'concat:lib']);
        } else {
            grunt.task.run(['clean', 'copy:min', 'copy:css', 'concat:js', 'combine:single', 'concat:lib']);
        }
    });
};
