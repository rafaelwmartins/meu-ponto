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
