var meupontoDirectives = angular.module('meupontoDirectives', []);

meupontoDirectives.directive('keybinding', function() {
    return {
        scope: {
            invoke: '&'
        },
        restrict: 'E',
        link: function(scope, element, attrs) {
            Mousetrap.bind(attrs.on, function() {
                scope.$apply(scope.invoke);
            });
        }
    };
});

meupontoDirectives.directive('recordTime', ['configuration',
    function(configuration) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue) {
                    if (!viewValue) {
                        ctrl.$setValidity('recordTime', true);
                        return '';
                    }
                    var time = moment(viewValue, configuration.dateTimeFormats.times);
                    if (!time || !time.isValid()) {
                        ctrl.$setValidity('recordTime', false);
                        return undefined;
                    }
                    ctrl.$setValidity('recordTime', true);
                    return viewValue;
                });
            }
        };
    }
]);

meupontoDirectives.directive('recordDate', ['configuration',
    function(configuration) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var date = moment(viewValue, configuration.dateTimeFormats.date);
                    if (!date || !date.isValid()) {
                        ctrl.$setValidity('recordDate', false);
                        return undefined;
                    }
                    ctrl.$setValidity('recordDate', true);
                    return viewValue;
                });
            }
        };
    }
]);

meupontoDirectives.directive('adjust', ['utils',
    function(utils) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue) {
                    pattern = /[^\d:+-]/g;
                    if (pattern.test(viewValue) || (viewValue !== '0' && utils.getMinutes(viewValue) === 0)) {
                        ctrl.$setValidity('adjust', false);
                        return undefined;
                    }
                    ctrl.$setValidity('adjust', true);
                    return viewValue;
                });
            }
        };
    }
]);
