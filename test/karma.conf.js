module.exports = function(config) {
    config.set({
        basePath: '../',

        files: [
            'lib/jquery-1.10.2.min.js',
            'lib/angular-1.0.8.min.js',
            'lib/moment-2.2.1.min.js',
            'lib/moment-pt-br.min.js',
            'lib/mousetrap.min.js',
            'test/angular-mocks.js',

            'js/**/*.js',
            'test/unit/**/*.js'
        ],

        exclude: [],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
        ]
    });
};
