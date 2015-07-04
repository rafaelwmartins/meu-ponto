var meupontoControllers = angular.module('meupontoControllers', []);

meupontoControllers.controller('HelpCtrl', ['$rootScope', '$scope', 'utils',
    function($rootScope, $scope, utils) {
        $rootScope.menu = 'help';

        $scope.goBack = function() {
            utils.goHome();
        };
    }
]);

meupontoControllers.controller('ConfigCtrl', ['$rootScope', '$scope', 'utils',
    function($rootScope, $scope, utils) {
        $rootScope.menu = 'config';

        $scope.userId = $rootScope.user.provider === 'facebook' ? $rootScope.user.id : $rootScope.user.uid;

        $scope.$watch('config', function() {
            if ($rootScope.config) {
                $scope.round = $rootScope.config.round;
                $scope.optimal = $rootScope.config.optimal;
                if ($rootScope.config.token) {
                    $scope.integration = true;
                    $scope.token = $rootScope.config.token;
                } else {
                    $scope.integration = false;
                }
            }
        });

        $scope.update = function() {
            $rootScope.config.round = $scope.round;
            $rootScope.config.optimal = $scope.optimal;
            if ($scope.integration) {
                $rootScope.config.token = $scope.token;
            } else {
                delete $rootScope.config.token;
            }
            utils.goHome();
        };

        $scope.updateToken = function() {
            $scope.token = utils.generateToken();
        };

        $scope.goBack = function() {
            utils.goHome();
        };
    }
]);

meupontoControllers.controller('DataCtrl', ['$rootScope', '$scope', 'utils',
    function($rootScope, $scope, utils) {
        $rootScope.menu = 'data';

        var getCSV = function(scope) {
            if (!scope || !scope.years) {
                return '';
            }
            var csv = 'Dia,Entrada 1,Saída 1,Entrada 2,Saída 2,Nota';
            var year, month, day;
            var entries = [];
            for (year in scope.years) {
                if (isNaN(year)) {
                    continue;
                }
                for (month in scope.years[year]) {
                    if (isNaN(month)) {
                        continue;
                    }
                    for (day in scope.years[year][month]) {
                        if (isNaN(day)) {
                            continue;
                        }
                        entries.push(year + '-' + month + '-' + day);
                    }
                }
            }
            entries.sort();
            var parts, entry1, entry2, exit1, exit2, note, date;
            for (var i = 0; i < entries.length; i++) {
                parts = entries[i].split('-');
                year = parts[0];
                month = parts[1];
                day = parts[2];
                entry1 = scope.years[year][month][day].entry1 || '';
                entry2 = scope.years[year][month][day].entry2 || '';
                exit1 = scope.years[year][month][day].exit1 || '';
                exit2 = scope.years[year][month][day].exit2 || '';
                note = scope.years[year][month][day].note || '';
                date = day + '/' + month + '/' + year;
                csv = csv + '\n' + date + ',' + entry1 + ',' + exit1 + ',' + entry2 + ',' + exit2 + ',' + note;
            }
            return csv;
        };

        $scope.$watch('years', function() {
            $scope.csv = getCSV($scope);
        });

        $scope.confirm = false;
        $scope.deleted = false;

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
            utils.goHome();
        };
    }
]);

meupontoControllers.controller('ListCtrl', ['$rootScope', '$scope', '$location', 'utils', 'RowManager',
    function($rootScope, $scope, $location, utils, RowManager) {
        $rootScope.menu = '';

        // Checks if the string represents a control entry (a day number ending with an underscore)
        var isControl = function(day) {
            if (day) {
                return day.slice(-1) === '_';
            }
            return false;
        };

        var updateRows = function() {
            $scope.rows = {};
            var year, month, day;
            var entries = [];
            for (year in $scope.years) {
                if (isNaN(year)) {
                    continue;
                }
                $scope.rows[year] = {};
                for (month in $scope.years[year]) {
                    if (isNaN(month)) {
                        continue;
                    }
                    $scope.rows[year][month] = {};
                    for (day in $scope.years[year][month]) {
                        if (isNaN(day) && !isControl(day)) {
                            continue;
                        }
                        entries.push(year + '-' + month + '-' + day);
                    }
                }
            }
            entries.sort();
            var parts, record, currentBalance;
            var totalBalance = 0;
            for (var i = 0; i < entries.length; i++) {
                parts = entries[i].split('-');
                year = parts[0];
                month = parts[1];
                day = parts[2];
                record = $scope.years[year][month][day];
                if (isControl(day)) {
                    if (record.adjustTotalBalance) {
                        currentBalance = RowManager.getBalanceObject(record.adjust - totalBalance, 'm');
                        totalBalance = record.adjust;
                    } else {
                        currentBalance = record.adjust === 0 ? RowManager.getBalanceObject(-totalBalance, 'm') : RowManager.getBalanceObject(record.adjust, 'm');
                        totalBalance += currentBalance.value;
                    }
                } else {
                    if (record.entry1 && record.entry2 && record.exit1 && record.exit2) {
                        currentBalance = RowManager.getBalance(record, $rootScope.config.round);
                        totalBalance += currentBalance.value;
                    } else {
                        currentBalance = 0;
                    }
                }
                $scope.rows[year][month][day] = RowManager.getRow(record, $rootScope.config.optimal, $rootScope.config.round);
                $scope.rows[year][month][day].balance = currentBalance;
                $scope.rows[year][month][day].total = RowManager.getBalanceObject(totalBalance, 'm');
            }
        };

        $scope.$watch('years', function() {
            updateRows();
        });

        $scope.create = function(adjust) {
            var path = adjust ? '/create/adjust' : '/create';
            $location.path(path);
        };

        $scope.edit = function(id, registerNow) {
            var pathValue = '/edit/' + id;
            if (registerNow) {
                pathValue += '/now';
            }
            $location.path(pathValue);
        };

        $scope.editToday = function(registerNow) {
            var today = moment().format('YYYY-MM-DD');
            var params = today.split('-');
            var year = params[0];
            var month = params[1];
            var day = params[2];
            if (!utils.hasDay(year, month, day)) {
                if (registerNow) {
                    $location.path('/create/now');
                } else {
                    $scope.create(false);
                }
            } else {
                $scope.edit(today, registerNow);
            }
        };

        $scope.hasRecords = function(obj) {
            for (var key in obj) {
                if (!isNaN(key)) {
                    return true;
                }
            }
            return false;
        };

        $scope.isControl = function(day) {
            return isControl(day);
        };
    }
]);

meupontoControllers.controller('EditCtrl', ['$rootScope', '$scope', '$routeParams', '$timeout', 'utils', 'configuration',
    function($rootScope, $scope, $routeParams, $timeout, utils, configuration) {
        if ($routeParams.extra) {
            $scope.now = $routeParams.extra === 'now' ? true : false;
        }
        $rootScope.menu = '';

        var params = $routeParams.date.split('-');
        if (params.length != 3) {
            utils.goHome();
            return;
        }
        var year = params[0];
        var month = params[1];
        var day = params[2];
        if (!utils.hasDay(year, month, day)) {
            utils.goHome();
            return;
        }

        $scope.edit = true;
        $scope.confirm = false;
        if (day.slice(-1) === '_') {
            $scope.adjust = true;
            $scope.date = day.substring(0, 2) + '/' + month + '/' + year;
        } else {
            $scope.date = day + '/' + month + '/' + year;
        }

        if ($scope.adjust) {
            var adjustTotalBalance = $rootScope.years[year][month][day].adjustTotalBalance === true ? true : false;
            $scope.record = {
                adjust: utils.getFormattedTime($rootScope.years[year][month][day].adjust, true),
                adjustTotalBalance: adjustTotalBalance,
                note: $rootScope.years[year][month][day].note
            };
        } else {
            $scope.record = {
                entry1: $rootScope.years[year][month][day].entry1,
                entry2: $rootScope.years[year][month][day].entry2,
                exit1: $rootScope.years[year][month][day].exit1,
                exit2: $rootScope.years[year][month][day].exit2,
                note: $rootScope.years[year][month][day].note
            };
        }

        if ($scope.now) {
            var entries = ['entry1', 'exit1', 'entry2', 'exit2'];
            for (var i = 0; i < entries.length; i++) {
                if (!$scope.record[entries[i]]) {
                    $scope.record[entries[i]] = moment().format(configuration.dateTimeFormats.time);
                    break;
                }
            }
        }

        $scope.apply = function() {
            if (utils.allEmpty($scope.record)) {
                utils.goHome();
                return;
            }

            if ($scope.adjust) {
                $rootScope.years[year][month][day] = {
                    adjust: utils.getMinutes($scope.record.adjust),
                    adjustTotalBalance: $scope.record.adjustTotalBalance,
                    note: $scope.record.note
                };
            } else {
                utils.formatRecordTimes($scope.record);
                $rootScope.years[year][month][day] = {
                    entry1: $scope.record.entry1,
                    entry2: $scope.record.entry2,
                    exit1: $scope.record.exit1,
                    exit2: $scope.record.exit2,
                    note: $scope.record.note
                };
            }
            utils.goHome();
        };

        $scope.delete = function() {
            $scope.confirm = true;
        };

        $scope.deleteConfirm = function() {
            delete $rootScope.years[year][month][day];

            // Code to delete the garbage
            // See note about AngularFire bug
            var hasContent = false;
            var key;
            for (key in $rootScope.years[year][month]) {
                if (!isNaN(key)) {
                    hasContent = true;
                    break;
                }
            }
            if (!hasContent) {
                delete $rootScope.years[year][month];
                hasContent = false;
                for (key in $rootScope.years[year]) {
                    if (!isNaN(key)) {
                        hasContent = true;
                        break;
                    }
                }
                if (!hasContent) {
                    delete $rootScope.years[year];
                }
            }

            utils.goHome();
        };

        $scope.goBack = function() {
            utils.goHome();
        };


        if (!$scope.now) {
            $timeout(utils.focusFirstEmptyInput);
        }
    }
]);

meupontoControllers.controller('CreateCtrl', ['$rootScope', '$scope', '$routeParams', '$timeout', 'utils', 'configuration',
    function($rootScope, $scope, $routeParams, $timeout, utils, configuration) {
        if ($routeParams.extra) {
            $scope.adjust = $routeParams.extra === 'adjust' ? true : false;
            $scope.now = $routeParams.extra === 'now' ? true : false;
        }
        $rootScope.menu = $scope.adjust ? 'adjust' : 'create';

        var today = moment();
        var year = today.format('YYYY');
        var month = today.format('MM');
        var day = today.format('DD');
        if ($scope.adjust) {
            day = day + '_';
        }
        if (!utils.hasDay(year, month, day)) {
            $scope.date = today.format(configuration.dateTimeFormats.date);
        }

        if ($scope.now) {
            $scope.record = {};
            $scope.record.entry1 = moment().format(configuration.dateTimeFormats.time);
        }

        $scope.apply = function() {
            var date = moment($scope.date, configuration.dateTimeFormats.inputDates);
            if (!date.isValid()) {
                return;
            }
            var year = date.format('YYYY');
            var month = date.format('MM');
            var day = date.format('DD');
            if ($scope.adjust) {
                day = day + '_';
            }

            if (utils.allEmpty($scope.record)) {
                utils.goHome();
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

            if ($scope.adjust) {
                $rootScope.years[year][month][day] = {
                    adjust: utils.getMinutes($scope.record.adjust),
                    adjustTotalBalance: $scope.record.adjustTotalBalance,
                    note: $scope.record.note
                };
            } else {
                utils.formatRecordTimes($scope.record);
                $rootScope.years[year][month][day] = {
                    entry1: $scope.record.entry1,
                    entry2: $scope.record.entry2,
                    exit1: $scope.record.exit1,
                    exit2: $scope.record.exit2,
                    note: $scope.record.note
                };
            }

            utils.goHome();
        };

        $scope.goBack = function() {
            utils.goHome();
        };

        if (!$scope.now) {
            $timeout(utils.focusFirstEmptyInput);

        }
    }
]);
