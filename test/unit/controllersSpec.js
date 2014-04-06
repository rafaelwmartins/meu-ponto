describe('MeuPonto controllers:', function() {
    beforeEach(module('meupontoServices'));
    beforeEach(module('meupontoControllers'));
    beforeEach(function() {
        this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    describe('ListCtrl', function() {
        var rootScope, scope;

        // Workaround object
        // See note about AngularFire bug
        var createLast = function() {
            return {
                last: {
                    value: 0
                }
            };
        };

        var createRecord = function(entry1, exit1, entry2, exit2, note) {
            var record = {};
            if (entry1) {
                record.entry1 = entry1;
            }
            if (exit1) {
                record.exit1 = exit1;
            }
            if (entry2) {
                record.entry2 = entry2;
            }
            if (exit2) {
                record.exit2 = exit2;
            }
            if (note) {
                record.note = note;
            }
            return record;
        };

        var createAdjustRecord = function(adjust, adjustTotalBalance, note) {
            var adjustRecord = {
                adjust: adjust
            };
            if (adjustTotalBalance) {
                adjustRecord.adjustTotalBalance = adjustTotalBalance;
            }
            if (note) {
                adjustRecord.note = note;
            }
            return adjustRecord;
        };

        var createSampleData = function() {
            var records = createLast();
            records['2013'] = createLast();
            records['2013']['11'] = createLast();
            records['2014'] = createLast();
            records['2014']['01'] = createLast();
            records['2014']['03'] = createLast();
            records['2013']['11']['01'] = createRecord('09:05', '11:55', '13:05', '17:51');
            records['2013']['11']['02'] = createRecord('09:00', '12:00', '13:00', '19:20');
            records['2013']['11']['03'] = createRecord('09:00', '12:00', '13:00', null);
            records['2013']['11']['03_'] = createAdjustRecord(-30);
            records['2014']['01']['04'] = createRecord('09:00', '12:00', '13:00', '17:30');
            records['2014']['01']['05'] = createRecord('09:00', '12:00', '13:00', '17:00');
            records['2014']['01']['06_'] = createAdjustRecord(0);
            records['2014']['03']['01'] = createRecord('10:00', '12:00', '13:00', '18:00', 'late');
            records['2014']['03']['01_'] = createAdjustRecord(20, null, 'bonus');
            records['2014']['03']['02_'] = createAdjustRecord(120, true);
            records['2014']['03']['06'] = createRecord('09:00', '12:00', '13:00', '18:20');
            return records;
        };

        var createRow = function(entry1, entry1Optimal, exit1, exit1Optimal, entry2, entry2Optimal, exit2, exit2Optimal, note) {
            var entry1Value = entry1 ? {
                display: entry1,
                optimal: entry1Optimal
            } : {};
            var exit1Value = exit1 ? {
                display: exit1,
                optimal: exit1Optimal
            } : {};
            var entry2Value = entry2 ? {
                display: entry2,
                optimal: entry2Optimal
            } : {};
            var exit2Value = exit2 ? {
                display: exit2,
                optimal: exit2Optimal
            } : {};
            return {
                entry1: entry1Value,
                exit1: exit1Value,
                entry2: entry2Value,
                exit2: exit2Value,
                note: note
            };
        };

        var createBalance = function(display, value) {
            return {
                display: display,
                value: value
            };
        };

        beforeEach(inject(function($rootScope, $controller) {
            rootScope = $rootScope;
            rootScope.config = {
                round: true,
                optimal: true
            };
            scope = rootScope.$new();
            $controller('ListCtrl', {
                $scope: scope,
                $rootScope: rootScope
            });
        }));

        it('does not create rows when years is null', function() {
            rootScope.years = null;
            rootScope.$digest();
            expect(scope.rows).toEqualData({});
        });

        it('does not create rows when there are no records', function() {
            rootScope.years = {};
            rootScope.$digest();
            expect(scope.rows).toEqualData({});
        });

        it('creates rows rounding', function() {
            rootScope.config = {
                round: true,
                optimal: false
            };
            rootScope.years = createSampleData();
            rootScope.$digest();
            var expectedRows = {
                '2013': {
                    '11': {
                        '01': createRow('09:05', false, '11:55', false, '13:05', false, '17:51', false, undefined),
                        '02': createRow('09:00', false, '12:00', false, '13:00', false, '19:20', false, undefined),
                        '03': createRow('09:00', false, '12:00', false, '13:00', false, null, null, undefined),
                        '03_': {}
                    },
                },
                '2014': {
                    '01': {
                        '04': createRow('09:00', false, '12:00', false, '13:00', false, '17:30', false, undefined),
                        '05': createRow('09:00', false, '12:00', false, '13:00', false, '17:00', false, undefined),
                        '06_': {}
                    },
                    '03': {
                        '01': createRow('10:00', false, '12:00', false, '13:00', false, '18:00', false, 'late'),
                        '01_': {
                            note: 'bonus'
                        },
                        '02_': {},
                        '06': createRow('09:00', false, '12:00', false, '13:00', false, '18:20', false, undefined)
                    }
                }
            };
            expectedRows['2013']['11']['01'].balance = createBalance('00:00', 0);
            expectedRows['2013']['11']['01'].total = createBalance('00:00', 0);
            expectedRows['2013']['11']['02'].balance = createBalance('01:20', 80);
            expectedRows['2013']['11']['02'].total = createBalance('01:20', 80);
            expectedRows['2013']['11']['03'].balance = 0;
            expectedRows['2013']['11']['03'].total = createBalance('01:20', 80);
            expectedRows['2013']['11']['03_'].balance = createBalance('00:30', -30);
            expectedRows['2013']['11']['03_'].total = createBalance('00:50', 50);
            expectedRows['2014']['01']['04'].balance = createBalance('00:30', -30);
            expectedRows['2014']['01']['04'].total = createBalance('00:20', 20);
            expectedRows['2014']['01']['05'].balance = createBalance('01:00', -60);
            expectedRows['2014']['01']['05'].total = createBalance('00:40', -40);
            expectedRows['2014']['01']['06_'].balance = createBalance('00:40', 40);
            expectedRows['2014']['01']['06_'].total = createBalance('00:00', 0);
            expectedRows['2014']['03']['01'].balance = createBalance('01:00', -60);
            expectedRows['2014']['03']['01'].total = createBalance('01:00', -60);
            expectedRows['2014']['03']['01_'].balance = createBalance('00:20', 20);
            expectedRows['2014']['03']['01_'].total = createBalance('00:40', -40);
            expectedRows['2014']['03']['02_'].balance = createBalance('02:40', 160);
            expectedRows['2014']['03']['02_'].total = createBalance('02:00', 120);
            expectedRows['2014']['03']['06'].balance = createBalance('00:20', 20);
            expectedRows['2014']['03']['06'].total = createBalance('02:20', 140);
            expect(scope.rows).toEqualData(expectedRows);
        });

        it('creates rows optimizing', function() {
            rootScope.config = {
                round: false,
                optimal: true
            };
            rootScope.years = createSampleData();
            rootScope.$digest();
            var expectedRows = {
                '2013': {
                    '11': {
                        '01': createRow('09:05', false, '11:55', false, '13:05', false, '17:51', false, undefined),
                        '02': createRow('09:00', false, '12:00', false, '13:00', false, '19:20', false, undefined),
                        '03': createRow('09:00', false, '12:00', false, '13:00', false, '18:00', true, undefined),
                        '03_': {}
                    },
                },
                '2014': {
                    '01': {
                        '04': createRow('09:00', false, '12:00', false, '13:00', false, '17:30', false, undefined),
                        '05': createRow('09:00', false, '12:00', false, '13:00', false, '17:00', false, undefined),
                        '06_': {}
                    },
                    '03': {
                        '01': createRow('10:00', false, '12:00', false, '13:00', false, '18:00', false, 'late'),
                        '01_': {
                            note: 'bonus'
                        },
                        '02_': {},
                        '06': createRow('09:00', false, '12:00', false, '13:00', false, '18:20', false, undefined)
                    }
                }
            };
            expectedRows['2013']['11']['01'].balance = createBalance('00:24', -24);
            expectedRows['2013']['11']['01'].total = createBalance('00:24', -24);
            expectedRows['2013']['11']['02'].balance = createBalance('01:20', 80);
            expectedRows['2013']['11']['02'].total = createBalance('00:56', 56);
            expectedRows['2013']['11']['03'].balance = 0;
            expectedRows['2013']['11']['03'].total = createBalance('00:56', 56);
            expectedRows['2013']['11']['03_'].balance = createBalance('00:30', -30);
            expectedRows['2013']['11']['03_'].total = createBalance('00:26', 26);
            expectedRows['2014']['01']['04'].balance = createBalance('00:30', -30);
            expectedRows['2014']['01']['04'].total = createBalance('00:04', -4);
            expectedRows['2014']['01']['05'].balance = createBalance('01:00', -60);
            expectedRows['2014']['01']['05'].total = createBalance('01:04', -64);
            expectedRows['2014']['01']['06_'].balance = createBalance('01:04', 64);
            expectedRows['2014']['01']['06_'].total = createBalance('00:00', 0);
            expectedRows['2014']['03']['01'].balance = createBalance('01:00', -60);
            expectedRows['2014']['03']['01'].total = createBalance('01:00', -60);
            expectedRows['2014']['03']['01_'].balance = createBalance('00:20', 20);
            expectedRows['2014']['03']['01_'].total = createBalance('00:40', -40);
            expectedRows['2014']['03']['02_'].balance = createBalance('02:40', 160);
            expectedRows['2014']['03']['02_'].total = createBalance('02:00', 120);
            expectedRows['2014']['03']['06'].balance = createBalance('00:20', 20);
            expectedRows['2014']['03']['06'].total = createBalance('02:20', 140);
            expect(scope.rows).toEqualData(expectedRows);
        });

        it('creates rows with adjusts rounding and optimizing', function() {
            rootScope.config = {
                round: true,
                optimal: true
            };
            rootScope.years = createSampleData();
            rootScope.$digest();
            var expectedRows = {
                '2013': {
                    '11': {
                        '01': createRow('09:05', false, '11:55', false, '13:05', false, '17:51', false, undefined),
                        '02': createRow('09:00', false, '12:00', false, '13:00', false, '19:20', false, undefined),
                        '03': createRow('09:00', false, '12:00', false, '13:00', false, '17:51', true, undefined),
                        '03_': {}
                    },
                },
                '2014': {
                    '01': {
                        '04': createRow('09:00', false, '12:00', false, '13:00', false, '17:30', false, undefined),
                        '05': createRow('09:00', false, '12:00', false, '13:00', false, '17:00', false, undefined),
                        '06_': {}
                    },
                    '03': {
                        '01': createRow('10:00', false, '12:00', false, '13:00', false, '18:00', false, 'late'),
                        '01_': {
                            note: 'bonus'
                        },
                        '02_': {},
                        '06': createRow('09:00', false, '12:00', false, '13:00', false, '18:20', false, undefined)
                    }
                }
            };
            expectedRows['2013']['11']['01'].balance = createBalance('00:00', 0);
            expectedRows['2013']['11']['01'].total = createBalance('00:00', 0);
            expectedRows['2013']['11']['02'].balance = createBalance('01:20', 80);
            expectedRows['2013']['11']['02'].total = createBalance('01:20', 80);
            expectedRows['2013']['11']['03'].balance = 0;
            expectedRows['2013']['11']['03'].total = createBalance('01:20', 80);
            expectedRows['2013']['11']['03_'].balance = createBalance('00:30', -30);
            expectedRows['2013']['11']['03_'].total = createBalance('00:50', 50);
            expectedRows['2014']['01']['04'].balance = createBalance('00:30', -30);
            expectedRows['2014']['01']['04'].total = createBalance('00:20', 20);
            expectedRows['2014']['01']['05'].balance = createBalance('01:00', -60);
            expectedRows['2014']['01']['05'].total = createBalance('00:40', -40);
            expectedRows['2014']['01']['06_'].balance = createBalance('00:40', 40);
            expectedRows['2014']['01']['06_'].total = createBalance('00:00', 0);
            expectedRows['2014']['03']['01'].balance = createBalance('01:00', -60);
            expectedRows['2014']['03']['01'].total = createBalance('01:00', -60);
            expectedRows['2014']['03']['01_'].balance = createBalance('00:20', 20);
            expectedRows['2014']['03']['01_'].total = createBalance('00:40', -40);
            expectedRows['2014']['03']['02_'].balance = createBalance('02:40', 160);
            expectedRows['2014']['03']['02_'].total = createBalance('02:00', 120);
            expectedRows['2014']['03']['06'].balance = createBalance('00:20', 20);
            expectedRows['2014']['03']['06'].total = createBalance('02:20', 140);
            expect(scope.rows).toEqualData(expectedRows);
        });
    });
});
