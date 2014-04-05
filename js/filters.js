var meupontoFilters = angular.module('meupontoFilters', []);

meupontoFilters.filter('monthName', [
    function() {
        return function(month) {
            return moment(month, 'MM').lang('pt-br').format('MMMM');
        };
    }
]);

meupontoFilters.filter('dayOfWeek', [
    function() {
        return function(date) {
            return moment(date, 'YYYYMMDD').lang('pt-br').format('dddd');
        };
    }
]);

// Takes away the mark for adjust
// Example: 01_ -> 01
meupontoFilters.filter('dayWithoutMark', [
    function() {
        return function(day) {
            if (day.length > 2) {
                return day.substring(0, 2);
            }
            return day;
        };
    }
]);
