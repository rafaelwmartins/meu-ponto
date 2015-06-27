var meupontoServices = angular.module('meupontoServices', []);

meupontoServices.service('RowManager', ['configuration', 'utils', RowManager]);

meupontoServices.factory('configuration', [
    function() {
        var configuration = {
            updateCheckInterval: {
                key: 'updateCheckInterval',
                defaultValue: 14400000 // 4 hours
            },
            dateTimeFormats: {
                time: 'HH:mm',
                date: 'DD/MM/YYYY',
                inputDates: ['DD/MM/YY', 'DD/MM/YYYY'],
                inputTimes: ['HH', 'HH:mm', 'HH-mm', 'HH mm']
            },
            officialTimes: {
                entry1: '09:00',
                exit1: '12:00',
                entry2: '13:00',
                exit2: '18:00',
                journeyDuration: 28800000
            },
            tolerances: {
                entry: 300000,
                total: 600000
            }
        };
        return configuration;
    }
]);

meupontoServices.factory('utils', ['$rootScope', '$location', 'configuration',
    function($rootScope, $location, configuration) {
        var utils = {

            hasDay: function(year, month, day) {
                if ($rootScope.years !== null && $rootScope.years[year] !== undefined && $rootScope.years[year][month] !== undefined && $rootScope.years[year][month][day] !== undefined) {
                    return true;
                }
                return false;
            },

            goHome: function() {
                $location.path('/');
            },

            // Focus the fisrt empty input (of type text) using jQuery
            focusFirstEmptyInput: function() {
                var inputs = $('form input:text');
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs[i]).is(':visible') && $(inputs[i]).val() === '') {
                        $(inputs[i]).focus();
                        break;
                    }
                }
            },

            // Returns a string in the HH:mm format
            // Example: 1590 -> '26:30'
            getFormattedTime: function(minutes, showMinus) {
                var negative = minutes < 0;
                var absValue = Math.abs(minutes);
                var hours = Math.floor(absValue / 60);
                var minutesPart = Math.floor(absValue % 60);
                var hoursDisplay = hours < 10 ? '0' + hours : hours;
                var minutesDisplay = minutesPart < 10 ? '0' + minutesPart : minutesPart;
                var formattedTime = hoursDisplay + ':' + minutesDisplay;
                if (negative && showMinus) {
                    formattedTime = '-' + formattedTime;
                }
                return formattedTime;
            },

            // Returns the number of minutes
            // Examples: '26:30' -> 1590, '200' -> 200
            getMinutes: function(formattedTime) {
                var str = formattedTime ? formattedTime.trim() : "0";
                var totalMinutes = 0;
                if (str.indexOf(':') !== -1) {
                    var negative = str[0] === '-';
                    if (negative) {
                        str = str.substring(1).trim();
                    }
                    var hoursAndMinutes = str.split(':');
                    var hours = parseInt(hoursAndMinutes[0], 10);
                    var minutes = parseInt(hoursAndMinutes[1], 10);
                    totalMinutes = hours * 60 + minutes;
                    if (negative) {
                        totalMinutes *= -1;
                    }
                } else {
                    totalMinutes = parseInt(str, 10);
                }
                return !isNaN(totalMinutes) ? totalMinutes : 0;
            },

            // Tests if all entries of a record are empty (or the record itself)
            allEmpty: function(record) {
                if (record !== null && record !== undefined) {
                    var key;
                    for (key in record) {
                        if (record[key] !== null && record[key] !== undefined && record[key] !== '') {
                            return false;
                        }
                    }
                }
                return true;
            },

            // Formats all record times; Empty string for invalid times
            formatRecordTimes: function(record) {
                var key;
                for (key in record) {
                    if (key === 'note') {
                        continue;
                    }
                    var hourMinute = moment(record[key], configuration.dateTimeFormats.inputTimes);
                    if (hourMinute && hourMinute.isValid()) {
                        record[key] = hourMinute.format(configuration.dateTimeFormats.time);
                    } else {
                        record[key] = '';
                    }
                }
            }
        };
        return utils;
    }
]);
