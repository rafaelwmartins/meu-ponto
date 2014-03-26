var meupontoApp = angular.module('meupontoApp', [
    'meupontoControllers',
    'meupontoDirectives',
    'meupontoFilters',
    'meupontoServices',
    'firebase'
]);

// Routes configuration
meupontoApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.
        when('/', {
            controller: 'ListCtrl',
            templateUrl: 'partials/list.html'
        }).
        when('/edit/:date', {
            controller: 'EditCtrl',
            templateUrl: 'partials/detail.html'
        }).
        when('/create', {
            controller: 'CreateCtrl',
            templateUrl: 'partials/detail.html'
        }).
        when('/create/:adjust', {
            controller: 'CreateCtrl',
            templateUrl: 'partials/detail.html'
        }).
        when('/config', {
            controller: 'ConfigCtrl',
            templateUrl: 'partials/config.html'
        }).
        when('/data', {
            controller: 'DataCtrl',
            templateUrl: 'partials/data.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

// Binds Firebase/AngularFire 
meupontoApp.run(['$window', '$rootScope', '$timeout', 'angularFireAuth', 'meupontoFire', 'configuration',
    function($window, $rootScope, $timeout, angularFireAuth, meupontoFire, configuration) {
        // App Cache
        if ($window.applicationCache) {
            $window.applicationCache.addEventListener('updateready', function(e) {
                $rootScope.$apply(function() {
                    $rootScope.updateReady = true;
                });
            });
        }
        var checkForUpdate = function() {
            if ($window.applicationCache) {
                $window.applicationCache.update();
            }
            $timeout(checkForUpdate, meupontoFire.loadUpdateCheckInterval());
        };
        $timeout(checkForUpdate, meupontoFire.loadUpdateCheckInterval());
        $rootScope.applyUpdate = function() {
            $window.location.reload(true);
        };

        $rootScope.loggedInOut = false;
        meupontoFire.initValues();
        var ref = new Firebase(configuration.firebaseUrl);
        angularFireAuth.initialize(ref, {
            scope: $rootScope,
            name: 'user'
        });

        $rootScope.login = function() {
            angularFireAuth.login('facebook');
        };

        $rootScope.logout = function() {
            meupontoFire.unbind();
            angularFireAuth.logout();
        };

        $rootScope.$on('angularFireAuth:login', function(evt, user) {
            $rootScope.loggedInOut = true;
            var ref = new Firebase(configuration.firebaseUrl + user.id);
            ref.once('value', function(snapshot) {
                if (snapshot.val() === null) {
                    // User not found!
                    ref.parent().update(meupontoFire.createNewUser(user.id), function(error) {
                        if (!error) {
                            meupontoFire.bind(user.id);
                        }
                    });
                } else {
                    meupontoFire.bind(user.id);
                }
            });
        });

        $rootScope.$on('angularFireAuth:logout', function(evt) {
            $rootScope.loggedInOut = true;
            meupontoFire.unbind();
        });

        // Hides Bootstrap's navbar menu (for mobile)
        $rootScope.$on('$routeChangeSuccess', function() {
            $('#meuponto-navbar').collapse('hide');
        });
        $('#meuponto-navbar').collapse('hide');
    }
]);
