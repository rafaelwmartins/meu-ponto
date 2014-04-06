var meupontoApp = angular.module('meupontoApp', [
    'meupontoControllers',
    'meupontoDirectives',
    'meupontoFilters',
    'meupontoServices',
    'firebase'
]);

meupontoApp.factory('meupontoFire', ['$rootScope', 'angularFire',
    function($rootScope, angularFire) {
        var meupontoFire = {

            initValues: function() {
                $rootScope.years = null;
                $rootScope.balances = null;
                $rootScope.config = null;
                $rootScope.isOn = false;
                $rootScope.unbindRecords = null;
                $rootScope.unbindConfig = null;
                $rootScope.unbindStatus = null;
            },

            bind: function(id) {
                angularFire(new Firebase(FIREBASE_URL + id + '/config'), $rootScope, 'config').then(function(unbind) {
                    $rootScope.unbindConfig = unbind;
                    angularFire(new Firebase(FIREBASE_URL + id + '/records'), $rootScope, 'years').then(function(unbind) {
                        $rootScope.unbindRecords = unbind;
                    });
                });
                angularFire(new Firebase(FIREBASE_URL + '.info/connected'), $rootScope, 'isOn').then(function(unbind) {
                    $rootScope.unbindStatus = unbind;
                });
            },

            unbind: function() {
                if ($rootScope.unbindRecords) {
                    $rootScope.unbindRecords();
                }
                if ($rootScope.unbindConfig) {
                    $rootScope.unbindConfig();
                }
                if ($rootScope.unbindStatus) {
                    $rootScope.unbindStatus();
                }
                this.initValues();
            },

            // -------------------------------------------------------------------------------------
            // NOTE ABOUT ANGULARFIRE BUG:
            //   AngularFire doesn't play well with dictionaries containing only number-like keys.
            //   An unused object with the word 'last' is added to make it work.
            //   https://github.com/firebase/angularFire/issues/129
            // -------------------------------------------------------------------------------------
            createNewUser: function(id) {
                var users = {};
                users[id] = {
                    records: {
                        last: {
                            value: 0
                        }
                    },
                    config: {
                        round: false,
                        optimal: true
                    }
                };
                return users;
            }
        };
        return meupontoFire;
    }
]);

// Routes configuration
meupontoApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.
        when('/', {
            controller: 'ListCtrl',
            templateUrl: 'partials/list-' + APP_VERSION + '.html'
        }).
        when('/edit/:date', {
            controller: 'EditCtrl',
            templateUrl: 'partials/detail-' + APP_VERSION + '.html'
        }).
        when('/create', {
            controller: 'CreateCtrl',
            templateUrl: 'partials/detail-' + APP_VERSION + '.html'
        }).
        when('/create/:adjust', {
            controller: 'CreateCtrl',
            templateUrl: 'partials/detail-' + APP_VERSION + '.html'
        }).
        when('/config', {
            controller: 'ConfigCtrl',
            templateUrl: 'partials/config-' + APP_VERSION + '.html'
        }).
        when('/data', {
            controller: 'DataCtrl',
            templateUrl: 'partials/data-' + APP_VERSION + '.html'
        }).
        when('/help', {
            controller: 'HelpCtrl',
            templateUrl: 'partials/help-' + APP_VERSION + '.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

// Binds Firebase/AngularFire 
meupontoApp.run(['$rootScope', 'angularFireAuth', 'meupontoFire',
    function($rootScope, angularFireAuth, meupontoFire) {
        $rootScope.loggedInOut = false;
        meupontoFire.initValues();
        var ref = new Firebase(FIREBASE_URL);
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
            var ref = new Firebase(FIREBASE_URL + user.id);
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
