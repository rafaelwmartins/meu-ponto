// AngularJS module init: defines Firebase as a dependency for the module
var meupontoModule = angular.module('meuponto', ['firebase']);

// Constants
// ---------
var INITIAL_DATE_DEFAULT_VALUE = '02/09/1986';
var LOCAL_STORAGE_KEY = 'backup';
var DATE_TIME_FORMATS = {
    TIME: 'HH:mm',
    DATE: 'DD/MM/YYYY'
};
var OFFICIAL_TIMES = {
    ENTRY1: '09:00',
    EXIT1: '12:00',
    ENTRY2: '13:00',
    EXIT2: '18:00',
    JOURNEY_DURATION: 28800000
};
var TOLERANCES = {
    ENTRY: 300000,
    TOTAL: 600000
};
// ---------

// Tests if all entries of a record are valid
var isValidRecord = function(record) {
    if (record === undefined || record === null) {
        return false;
    }
    var values = [record.entry1, record.entry2, record.exit1, record.exit2];
    for (var i = 0; i < values.length; i++) {
        var date = moment(values[i], DATE_TIME_FORMATS.TIME);
        if (!date || !date.isValid()) {
            return false;
        }
    }
    return true;
};

var hasDay = function($rootScope, year, month, day) {
    if ($rootScope.years !== null && $rootScope.years[year] !== undefined && $rootScope.years[year][month] !== undefined && $rootScope.years[year][month][day] !== undefined) {
        return true;
    }
    return false;
};

// Rounds time based on an official time and tolerance
// Example: 09:04 -> 09:00
var getRoundedTime = function(time, officialTime, tolerance) {
    var diff = moment(time, DATE_TIME_FORMATS.TIME).diff(moment(officialTime, DATE_TIME_FORMATS.TIME));
    return Math.abs(diff) <= tolerance ? officialTime : time;
};

// Receives a value in milliseconds and creates a balance object useful for display
var getBalanceObject = function(value) {
    return {
        display: moment('00:00', 'HH:mm').add('ms', Math.abs(value)).format(DATE_TIME_FORMATS.TIME),
        value: value
    };
};

// Returns the balance of a record with or without rounds
var getBalance = function(record, round) {
    if (!isValidRecord(record)) {
        return {
            display: '',
            value: ''
        };
    }

    var entry1, entry2, exit1, exit2;
    if (!round) {
        entry1 = record.entry1;
        entry2 = record.entry2;
        exit1 = record.exit1;
        exit2 = record.exit2;
    } else {
        entry1 = getRoundedTime(record.entry1, OFFICIAL_TIMES.ENTRY1, TOLERANCES.ENTRY);
        entry2 = getRoundedTime(record.entry2, OFFICIAL_TIMES.ENTRY2, TOLERANCES.ENTRY);
        exit1 = getRoundedTime(record.exit1, OFFICIAL_TIMES.EXIT1, TOLERANCES.ENTRY);
        exit2 = getRoundedTime(record.exit2, OFFICIAL_TIMES.EXIT2, TOLERANCES.ENTRY);
    }

    var interval = moment(entry2, DATE_TIME_FORMATS.TIME).diff(moment(exit1, DATE_TIME_FORMATS.TIME));
    var total = moment(exit2, DATE_TIME_FORMATS.TIME).diff(moment(entry1, DATE_TIME_FORMATS.TIME));
    var balanceValue = total - interval - OFFICIAL_TIMES.JOURNEY_DURATION;

    if (!round) {
        return getBalanceObject(balanceValue);
    }

    var balanceValueRounded;
    if (balanceValue > 0) {
        balanceValueRounded = balanceValue - TOLERANCES.TOTAL < 0 ? 0 : balanceValue;
    } else {
        balanceValueRounded = balanceValue + TOLERANCES.TOTAL > 0 ? 0 : balanceValue;
    }
    return getBalanceObject(balanceValueRounded);
};

var goHome = function($location) {
    $location.path('/');
};

// Tests if all entries of a record are empty (or the record itself)
var allEmpty = function(record) {
    if (record !== null && record !== undefined) {
        var key;
        for (key in record) {
            if (record[key] !== null && record[key] !== undefined && record[key] !== '') {
                return false;
            }
        }
    }
    return true;
};

// Formats all record times; Empty string for invalid times
var formatRecordTimes = function(record) {
    var key;
    for (key in record) {
        if (key === 'note') {
            continue;
        }
        var hourMinute = moment(record[key], [DATE_TIME_FORMATS.TIME, 'HH-mm', 'HH mm']);
        if (hourMinute && hourMinute.isValid()) {
            record[key] = hourMinute.format(DATE_TIME_FORMATS.TIME);
        } else {
            record[key] = '';
        }
    }
};

// Routes configuration
meupontoModule.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.
        when('/', {
            controller: ListCtrl,
            templateUrl: 'partials/list.html'
        }).
        when('/edit/:date', {
            controller: EditCtrl,
            templateUrl: 'partials/detail.html'
        }).
        when('/create', {
            controller: CreateCtrl,
            templateUrl: 'partials/detail.html'
        }).
        when('/config', {
            controller: ConfigCtrl,
            templateUrl: 'partials/config.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

var initValues = function($rootScope) {
    $rootScope.years = null;
    $rootScope.config = null;
    $rootScope.unbindRecords = null;
    $rootScope.unbindConfig = null;
};

var bind = function(angularFire, $rootScope, id) {
    angularFire(new Firebase(FIREBASE_URL + id + '/config'), $rootScope, 'config').then(function(unbind) {
        $rootScope.unbindConfig = unbind;
        angularFire(new Firebase(FIREBASE_URL + id + '/records'), $rootScope, 'years').then(function(unbind) {
            $rootScope.unbindRecords = unbind;
        });
    });
};

var unbind = function($rootScope) {
    if ($rootScope.unbindRecords) {
        $rootScope.unbindRecords();
    }
    if ($rootScope.unbindConfig) {
        $rootScope.unbindConfig();
    }
    initValues($rootScope);
};

var createNewUser = function(id) {
    var users = {};
    users[id] = {
        records: {
            last: {
                value: 0
            }
        },
        config: {
            initialDate: INITIAL_DATE_DEFAULT_VALUE
        }
    }; // See note about AngularFire bug
    return users;
};

// Module init
// Binds Firebase/AngularFire 
meupontoModule.run(['$rootScope', 'angularFire', 'angularFireAuth',
    function($rootScope, angularFire, angularFireAuth) {
        initValues($rootScope);
        var ref = new Firebase(FIREBASE_URL);
        angularFireAuth.initialize(ref, {
            scope: $rootScope,
            name: 'user'
        });

        $rootScope.login = function() {
            angularFireAuth.login('facebook');
        };

        $rootScope.logout = function() {
            unbind($rootScope);
            angularFireAuth.logout();
        };

        $rootScope.$on('angularFireAuth:login', function(evt, user) {
            var ref = new Firebase(FIREBASE_URL + user.id);
            ref.once('value', function(snapshot) {
                if (snapshot.val() === null) {
                    // User not found!
                    ref.parent().update(createNewUser(user.id), function(error) {
                        if (!error) {
                            bind(angularFire, $rootScope, user.id);
                        }
                    });
                } else {
                    bind(angularFire, $rootScope, user.id);
                }
            });
        });

        $rootScope.$on('angularFireAuth:logout', function(evt) {
            unbind($rootScope);
        });
    }
]);

// --- CONTROLLERS start ---
// -------------------------

function ConfigCtrl($rootScope, $scope, $location) {
    $scope.confirm = false;
    $scope.deleted = false;
    $scope.save = false;

    $scope.update = function() {
        var date = moment($scope.config.initialDate, DATE_TIME_FORMATS.DATE);
        if (!date.isValid()) {
            return;
        }
        $rootScope.config.initialDate = date.format(DATE_TIME_FORMATS.DATE);
        goHome($location);
    };

    $scope.save = function() {
        var storage = window.localStorage;
        storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify($rootScope.years));
        $scope.saved = true;
    };

    $scope.delete = function() {
        $scope.confirm = true;
    };

    $scope.deleteConfirm = function() {
        $rootScope.years = {
            last: {
                value: 0
            }
        };
        $scope.deleted = true;
        $scope.confirm = false;
    };

    $scope.goBack = function() {
        goHome($location);
    };
}
ConfigCtrl.$inject = ['$rootScope', '$scope', '$location'];

function ListCtrl($rootScope, $scope, $location) {
    $scope.updateTotalBalance = function(round) {
        if ($rootScope.config.initialDate === null || $rootScope.config.initialDate === undefined) {
            return;
        }

        var params = $rootScope.config.initialDate.split('/');
        if (params.length != 3) {
            return;
        }

        var day = params[0];
        var month = params[1];
        var year = params[2];
        var totalBalanceValue = 0;
        for (var yearKey in $rootScope.years) {
            if (isNaN(yearKey) || yearKey < year) {
                continue;
            }
            for (var monthKey in $rootScope.years[yearKey]) {
                if (isNaN(monthKey) || (yearKey === year && monthKey < month)) {
                    continue;
                }
                for (var dayKey in $rootScope.years[yearKey][monthKey]) {
                    if (isNaN(dayKey) || (yearKey === year && monthKey === month && dayKey < day)) {
                        continue;
                    }
                    var record = $rootScope.years[yearKey][monthKey][dayKey];
                    if (!isValidRecord(record)) {
                        continue;
                    }
                    totalBalanceValue += getBalance(record, round).value;
                }
            }
        }

        if (round) {
            $scope.totalBalance = getBalanceObject(totalBalanceValue);
        } else {
            $scope.totalBalanceNoRound = getBalanceObject(totalBalanceValue);
        }
    };

    var getExitTime = function(partialRecord) {
        var entry1 = getRoundedTime(partialRecord.entry1, OFFICIAL_TIMES.ENTRY1, TOLERANCES.ENTRY);
        var entry2 = getRoundedTime(partialRecord.entry2, OFFICIAL_TIMES.ENTRY2, TOLERANCES.ENTRY);
        var exit1 = getRoundedTime(partialRecord.exit1, OFFICIAL_TIMES.EXIT1, TOLERANCES.ENTRY);

        var currentTotal = moment(exit1, DATE_TIME_FORMATS.TIME).diff(moment(entry1, DATE_TIME_FORMATS.TIME));
        var timeToGo = OFFICIAL_TIMES.JOURNEY_DURATION - TOLERANCES.TOTAL - currentTotal;
        var exitTime = moment(entry2, DATE_TIME_FORMATS.TIME).add('ms', timeToGo);

        var officialExitTime = moment(OFFICIAL_TIMES.EXIT2, DATE_TIME_FORMATS.TIME);
        var officialDiff;
        if (!exitTime.isBefore(officialExitTime)) {
            officialDiff = exitTime.diff(officialExitTime);
            if (officialDiff < TOLERANCES.ENTRY) {
                exitTime = officialExitTime.add('ms', TOLERANCES.ENTRY + 60000);
            } else {
                exitTime = exitTime.add('m', 1);
            }
        } else {
            officialDiff = officialExitTime.diff(exitTime);
            if (officialDiff > TOLERANCES.ENTRY) {
                exitTime = exitTime.add('m', 1);
            } else {
                exitTime = officialExitTime.subtract('ms', TOLERANCES.ENTRY);
            }
        }

        return exitTime.format(DATE_TIME_FORMATS.TIME);
    };

    $scope.getRow = function(record) {
        var row = {
            entry1: {},
            entry2: {},
            exit1: {},
            exit2: {},
            balance: {},
            note: {}
        };
        if (record !== null && record !== undefined && record.entry1 !== undefined && record.entry1 !== '') {
            row.entry1.display = record.entry1;
            row.entry1.optimal = false;
        } else {
            row.entry1.display = moment(OFFICIAL_TIMES.ENTRY1, DATE_TIME_FORMATS.TIME).add('ms', TOLERANCES.ENTRY).format(DATE_TIME_FORMATS.TIME);
            row.entry1.optimal = true;
        }
        if (record !== null && record !== undefined && record.entry2 !== undefined && record.entry2 !== '') {
            row.entry2.display = record.entry2;
            row.entry2.optimal = false;
        } else {
            row.entry2.display = moment(OFFICIAL_TIMES.ENTRY2, DATE_TIME_FORMATS.TIME).add('ms', TOLERANCES.ENTRY).format(DATE_TIME_FORMATS.TIME);
            row.entry2.optimal = true;
        }
        if (record !== null && record !== undefined && record.exit1 !== undefined && record.exit1 !== '') {
            row.exit1.display = record.exit1;
            row.exit1.optimal = false;
        } else {
            row.exit1.display = moment(OFFICIAL_TIMES.EXIT1, DATE_TIME_FORMATS.TIME).subtract('ms', TOLERANCES.ENTRY).format(DATE_TIME_FORMATS.TIME);
            row.exit1.optimal = true;
        }
        if (record !== null && record !== undefined && record.exit2 !== undefined && record.exit2 !== '') {
            row.exit2.display = record.exit2;
            row.exit2.optimal = false;
        } else {
            var partialRecord = {
                entry1: row.entry1.display,
                entry2: row.entry2.display,
                exit1: row.exit1.display
            };
            row.exit2.display = getExitTime(partialRecord);
            row.exit2.optimal = true;
        }
        row.balance = getBalance(record, true);
        row.note = record.note;
        return row;
    };

    $scope.create = function() {
        $location.path('/create');
    };

    $scope.goConfig = function() {
        $location.path('/config');
    };

    $scope.edit = function(id) {
        $location.path('/edit/' + id);
    };

    // Temporary ugly code to deal with AngularFire bug
    // --------------------------------------------------------------------------------------------
    // NOTE ABOUT ANGULARFIRE BUG:
    //   AngularFire doesn't play well with dictionaries containing only number-like keys
    //   Therefore, an unused object with the word 'last' as the key was added and has to be scaped
    //   In the perfect world, it is possible to get the last object using only '$last' in HTML 
    //   https://github.com/firebase/angularFire/issues/129
    // --------------------------------------------------------------------------------------------
    $scope.getLast = function(dictionary) {
        var index = -1,
            key;
        for (key in dictionary) {
            if (dictionary.hasOwnProperty(key) && !isNaN(key)) {
                index++;
            }
        }
        return index;
    };
}
ListCtrl.$inject = ['$rootScope', '$scope', '$location'];

function EditCtrl($rootScope, $scope, $routeParams, $location) {
    var params = $routeParams.date.split('-');
    if (params.length != 3) {
        goHome($location);
        return;
    }
    var year = params[0];
    var month = params[1];
    var day = params[2];
    if (!hasDay($rootScope, year, month, day)) {
        goHome($location);
        return;
    }

    $scope.edit = true;
    $scope.confirm = false;
    $scope.date = day + '/' + month + '/' + year;
    $scope.record = {
        entry1: $rootScope.years[year][month][day].entry1,
        entry2: $rootScope.years[year][month][day].entry2,
        exit1: $rootScope.years[year][month][day].exit1,
        exit2: $rootScope.years[year][month][day].exit2,
        note: $rootScope.years[year][month][day].note
    };

    $scope.update = function() {
        if (allEmpty($scope.record)) {
            goHome($location);
            return;
        }

        formatRecordTimes($scope.record);
        $rootScope.years[year][month][day] = {
            entry1: $scope.record.entry1,
            entry2: $scope.record.entry2,
            exit1: $scope.record.exit1,
            exit2: $scope.record.exit2,
            note: $scope.record.note
        };
        goHome($location);
    };

    $scope.delete = function() {
        $scope.confirm = true;
    };

    $scope.deleteConfirm = function() {
        delete $rootScope.years[year][month][day];
        goHome($location);
    };

    $scope.goBack = function() {
        goHome($location);
    };
}
EditCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location'];

function CreateCtrl($rootScope, $scope, $location) {
    $scope.date = moment().format(DATE_TIME_FORMATS.DATE);

    $scope.create = function() {
        var date = moment($scope.date, DATE_TIME_FORMATS.DATE);
        if (!date.isValid()) {
            return;
        }
        var year = date.format('YYYY');
        var month = date.format('MM');
        var day = date.format('DD');
        if (hasDay($rootScope, year, month, day)) {
            return;
        }

        if (allEmpty($scope.record)) {
            goHome($location);
            return;
        }

        if ($rootScope.years[year] === undefined) {
            $rootScope.years[year] = {
                last: {
                    value: 0
                }
            }; // See note about AngularFire bug
        }
        if ($rootScope.years[year][month] === undefined) {
            $rootScope.years[year][month] = {
                last: {
                    value: 0
                }
            }; // See note about AngularFire bug
        }
        formatRecordTimes($scope.record);
        $rootScope.years[year][month][day] = {
            entry1: $scope.record.entry1,
            entry2: $scope.record.entry2,
            exit1: $scope.record.exit1,
            exit2: $scope.record.exit2,
            note: $scope.record.note
        };

        goHome($location);
    };

    $scope.goBack = function() {
        goHome($location);
    };
}
CreateCtrl.$inject = ['$rootScope', '$scope', '$location'];
// --- CONTROLLERS end ---

// --- FILTERS start ---
// ---------------------

meupontoModule.filter('monthName', [
    function() {
        return function(month) {
            return moment(month, 'MM').lang('pt-br').format('MMMM');
        };
    }
]);

meupontoModule.filter('dayOfWeek', [
    function() {
        return function(date) {
            return moment(date, 'YYYYMMDD').lang('pt-br').format('dddd');
        };
    }
]);
// --- FILTERS end ---
