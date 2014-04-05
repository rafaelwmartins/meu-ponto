describe('MeuPonto services:', function() {
    beforeEach(module('meupontoServices'));
    beforeEach(function() {
        this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    describe('utils -', function() {
        var utils;

        beforeEach(inject(function(_utils_) {
            utils = _utils_;
        }));

        describe('hasDay', function() {
            var rootScope;

            // Workaround object
            // See note about AngularFire bug
            var createLast = function() {
                return {
                    last: {
                        value: 0
                    }
                };
            };

            beforeEach(inject(function($rootScope) {
                rootScope = $rootScope;
            }));

            it('returns false when there is no record for the given date and true, otherwise', function() {
                rootScope.years = null;
                expect(utils.hasDay('2014', '01', '25')).toBe(false);
                rootScope.years = {};
                expect(utils.hasDay('2014', '01', '25')).toBe(false);
                rootScope.years = createLast();
                expect(utils.hasDay('2014', '01', '25')).toBe(false);
                rootScope.years['2014'] = createLast();
                expect(utils.hasDay('2014', '01', '25')).toBe(false);
                rootScope.years['2014']['01'] = createLast();
                expect(utils.hasDay('2014', '01', '25')).toBe(false);
                rootScope.years['2014']['01']['25'] = {};
                expect(utils.hasDay('2014', '01', '25')).toBe(true);
                expect(utils.hasDay('2015', '01', '25')).toBe(false);
                expect(utils.hasDay('2014', '02', '25')).toBe(false);
                expect(utils.hasDay('2014', '01', '26')).toBe(false);
            });
        });

        describe('getFormattedTime', function() {

            it('returns the correct time without showing minus', function() {
                expect(utils.getFormattedTime(0, false)).toEqual('00:00');
                expect(utils.getFormattedTime(59, false)).toEqual('00:59');
                expect(utils.getFormattedTime(120, false)).toEqual('02:00');
                expect(utils.getFormattedTime(1590, false)).toEqual('26:30');
                expect(utils.getFormattedTime(-59, false)).toEqual('00:59');
                expect(utils.getFormattedTime(-120, false)).toEqual('02:00');
                expect(utils.getFormattedTime(-1590, false)).toEqual('26:30');
            });

            it('returns the correct time showing minus', function() {
                expect(utils.getFormattedTime(0, true)).toEqual('00:00');
                expect(utils.getFormattedTime(59, true)).toEqual('00:59');
                expect(utils.getFormattedTime(120, true)).toEqual('02:00');
                expect(utils.getFormattedTime(1590, true)).toEqual('26:30');
                expect(utils.getFormattedTime(-59, true)).toEqual('-00:59');
                expect(utils.getFormattedTime(-120, true)).toEqual('-02:00');
                expect(utils.getFormattedTime(-1590, true)).toEqual('-26:30');
            });
        });

        describe('getMinutes', function() {
            it('returns the number of minutes given a formatted time', function() {
                expect(utils.getMinutes('00:00')).toEqual(0);
                expect(utils.getMinutes('00:59')).toEqual(59);
                expect(utils.getMinutes('02:00')).toEqual(120);
                expect(utils.getMinutes('26:30')).toEqual(1590);
                expect(utils.getMinutes('-00:59')).toEqual(-59);
                expect(utils.getMinutes('-02:00')).toEqual(-120);
                expect(utils.getMinutes('-26:30')).toEqual(-1590);
            });

            it('returns the number of minutes given the number as a string', function() {
                expect(utils.getMinutes('0')).toEqual(0);
                expect(utils.getMinutes('59', true)).toEqual(59);
                expect(utils.getMinutes('120', true)).toEqual(120);
                expect(utils.getMinutes('1590', true)).toEqual(1590);
                expect(utils.getMinutes('-59', true)).toEqual(-59);
            });
        });

        describe('allEmpty', function() {

            it('returns true if all entries of a record are empty (or the record itself) and false, otherwise', function() {
                expect(utils.allEmpty(null)).toBe(true);
                expect(utils.allEmpty(undefined)).toBe(true);
                expect(utils.allEmpty({})).toBe(true);
                var record = {
                    entry1: '09:00'
                };
                expect(utils.allEmpty(record)).toBe(false);
                record.exit1 = '12:00';
                expect(utils.allEmpty(record)).toBe(false);
                record.entry2 = '13:00';
                expect(utils.allEmpty(record)).toBe(false);
                record.exit2 = '18:00';
                expect(utils.allEmpty(record)).toBe(false);
                record = {
                    entry1: '',
                    exit1: '',
                    entry2: '',
                    exit2: ''
                };
                expect(utils.allEmpty(record)).toBe(true);
                record = {
                    entry1: null,
                    exit1: null,
                    entry2: null,
                    exit2: null
                };
                expect(utils.allEmpty(record)).toBe(true);
                record = {
                    entry1: undefined,
                    exit1: undefined,
                    entry2: undefined,
                    exit2: undefined
                };
                expect(utils.allEmpty(record)).toBe(true);
            });
        });

        describe('formatRecordTimes', function() {

            it('formats all times', function() {
                var formattedRecord = {
                    entry1: '09:00',
                    exit1: '12:00',
                    entry2: '13:00',
                    exit2: '18:00'
                };
                var record = {
                    entry1: '9:00',
                    exit1: '12:0',
                    entry2: '13:00',
                    exit2: '18:00'
                };
                utils.formatRecordTimes(record);
                expect(record).toEqualData(formattedRecord);
                record = {
                    entry1: '9-0',
                    exit1: '12 - 0',
                    entry2: '13 -0',
                    exit2: '18 - 00'
                };
                utils.formatRecordTimes(record);
                expect(record).toEqualData(formattedRecord);
                record = {
                    entry1: '9  0',
                    exit1: '12 00',
                    entry2: '13 0',
                    exit2: '18 0'
                };
                utils.formatRecordTimes(record);
                expect(record).toEqualData(formattedRecord);
            });
        });
    });

    describe('RowManager -', function() {
        var rowManager;

        beforeEach(inject(function(RowManager) {
            rowManager = RowManager;
        }));

        describe('getBalanceObject', function() {

            it('creates a balance object', function() {
                var expectedObj = {
                    display: '01:20',
                    value: 80
                };
                expect(rowManager.getBalanceObject(80, 'm')).toEqualData(expectedObj);
                expect(rowManager.getBalanceObject(4800, 's')).toEqualData(expectedObj);
                expect(rowManager.getBalanceObject(4800000, 'ms')).toEqualData(expectedObj);
                expectedObj.value = -80;
                expect(rowManager.getBalanceObject(-80, 'm')).toEqualData(expectedObj);
                expect(rowManager.getBalanceObject(-4800, 's')).toEqualData(expectedObj);
                expect(rowManager.getBalanceObject(-4800000, 'ms')).toEqualData(expectedObj);
            });
        });

        describe('getBalance', function() {
            var inputRecords, expectedResults;

            var createRecord = function(entry1, exit1, entry2, exit2) {
                return {
                    entry1: entry1,
                    exit1: exit1,
                    entry2: entry2,
                    exit2: exit2
                };
            };

            var createResult = function(display, value) {
                return {
                    display: display,
                    value: value
                };
            };

            beforeEach(inject(function() {
                inputRecords = [];
                expectedResults = [];
                inputRecords.length = 26;
                expectedResults.length = 26;

                // Entry1 tolerance (+-5 min)
                inputRecords[0] = createRecord('9:00', '12:00', '13:00', '18:00');
                inputRecords[1] = createRecord('8:55', '12:00', '13:00', '18:00');
                inputRecords[2] = createRecord('8:57', '12:00', '13:00', '18:00');
                inputRecords[3] = createRecord('9:02', '12:00', '13:00', '18:00');
                inputRecords[4] = createRecord('9:05', '12:00', '13:00', '18:00');

                // Exit1 tolerance (+-5 min)
                inputRecords[5] = createRecord('9:00', '11:55', '13:00', '18:00');
                inputRecords[6] = createRecord('9:00', '11:57', '13:00', '18:00');
                inputRecords[7] = createRecord('9:00', '12:02', '13:00', '18:00');
                inputRecords[8] = createRecord('9:00', '12:05', '13:00', '18:00');

                // Entry2 tolerance (+-5 min)
                inputRecords[9] = createRecord('9:00', '12:00', '12:55', '18:00');
                inputRecords[10] = createRecord('9:00', '12:00', '12:57', '18:00');
                inputRecords[11] = createRecord('9:00', '12:00', '13:02', '18:00');
                inputRecords[12] = createRecord('9:00', '12:00', '13:05', '18:00');

                // Exit2 tolerance (+-5 min)
                inputRecords[13] = createRecord('9:00', '12:00', '13:00', '17:55');
                inputRecords[14] = createRecord('9:00', '12:00', '13:00', '17:57');
                inputRecords[15] = createRecord('9:00', '12:00', '13:00', '18:02');
                inputRecords[16] = createRecord('9:00', '12:00', '13:00', '18:05');

                // Total tolerance (+-9 min)
                inputRecords[17] = createRecord('8:51', '12:00', '13:00', '18:00');
                inputRecords[18] = createRecord('9:09', '12:00', '13:00', '18:00');
                inputRecords[19] = createRecord('9:00', '12:00', '13:00', '17:51');
                inputRecords[20] = createRecord('9:00', '12:00', '13:00', '18:09');

                // Positive balance
                inputRecords[21] = createRecord('9:00', '12:30', '13:00', '19:00');

                // Negative balance
                inputRecords[22] = createRecord('9:20', '12:00', '13:00', '17:00');

                // Multiple tolerances
                inputRecords[23] = createRecord('8:55', '12:05', '12:55', '18:05'); // :(
                inputRecords[24] = createRecord('9:05', '11:55', '13:05', '17:55'); // :)
                inputRecords[25] = createRecord('9:05', '11:55', '13:05', '17:51'); // :D
            }));

            it('returns the balance of a record with rounds', function() {
                expectedResults[0] = createResult('00:00', 0);
                expectedResults[1] = createResult('00:00', 0);
                expectedResults[2] = createResult('00:00', 0);
                expectedResults[3] = createResult('00:00', 0);
                expectedResults[4] = createResult('00:00', 0);
                expectedResults[5] = createResult('00:00', 0);
                expectedResults[6] = createResult('00:00', 0);
                expectedResults[7] = createResult('00:00', 0);
                expectedResults[8] = createResult('00:00', 0);
                expectedResults[9] = createResult('00:00', 0);
                expectedResults[10] = createResult('00:00', 0);
                expectedResults[11] = createResult('00:00', 0);
                expectedResults[12] = createResult('00:00', 0);
                expectedResults[13] = createResult('00:00', 0);
                expectedResults[14] = createResult('00:00', 0);
                expectedResults[15] = createResult('00:00', 0);
                expectedResults[16] = createResult('00:00', 0);
                expectedResults[17] = createResult('00:00', 0);
                expectedResults[18] = createResult('00:00', 0);
                expectedResults[19] = createResult('00:00', 0);
                expectedResults[20] = createResult('00:00', 0);
                expectedResults[21] = createResult('01:30', 90);
                expectedResults[22] = createResult('01:20', -80);
                expectedResults[23] = createResult('00:00', 0);
                expectedResults[24] = createResult('00:00', 0);
                expectedResults[25] = createResult('00:00', 0);
                for (var i = 0; i < expectedResults.length; i++) {
                    expect(rowManager.getBalance(inputRecords[i], true)).toEqualData(expectedResults[i]);
                }
            });

            it('returns the balance of a record without rounds', function() {
                expectedResults[0] = createResult('00:00', 0);
                expectedResults[1] = createResult('00:05', 5);
                expectedResults[2] = createResult('00:03', 3);
                expectedResults[3] = createResult('00:02', -2);
                expectedResults[4] = createResult('00:05', -5);
                expectedResults[5] = createResult('00:05', -5);
                expectedResults[6] = createResult('00:03', -3);
                expectedResults[7] = createResult('00:02', 2);
                expectedResults[8] = createResult('00:05', 5);
                expectedResults[9] = createResult('00:05', 5);
                expectedResults[10] = createResult('00:03', 3);
                expectedResults[11] = createResult('00:02', -2);
                expectedResults[12] = createResult('00:05', -5);
                expectedResults[13] = createResult('00:05', -5);
                expectedResults[14] = createResult('00:03', -3);
                expectedResults[15] = createResult('00:02', 2);
                expectedResults[16] = createResult('00:05', 5);
                expectedResults[17] = createResult('00:09', 9);
                expectedResults[18] = createResult('00:09', -9);
                expectedResults[19] = createResult('00:09', -9);
                expectedResults[20] = createResult('00:09', 9);
                expectedResults[21] = createResult('01:30', 90);
                expectedResults[22] = createResult('01:20', -80);
                expectedResults[23] = createResult('00:20', 20);
                expectedResults[24] = createResult('00:20', -20);
                expectedResults[25] = createResult('00:24', -24);
                for (var i = 0; i < expectedResults.length; i++) {
                    expect(rowManager.getBalance(inputRecords[i], false)).toEqualData(expectedResults[i]);
                }
            });
        });

        describe('getRow', function() {
            var inputRecords, expectedResults;

            var createRecord = function(entry1, exit1, entry2, exit2, note) {
                var record = {};
                if (entry1 !== null) {
                    record.entry1 = entry1;
                }
                if (exit1 !== null) {
                    record.exit1 = exit1;
                }
                if (entry2 !== null) {
                    record.entry2 = entry2;
                }
                if (exit2 !== null) {
                    record.exit2 = exit2;
                }
                if (note !== null) {
                    record.note = note;
                }
                return record;
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

            beforeEach(inject(function() {
                inputRecords = [];
                expectedResults = [];
                inputRecords.length = 15;
                expectedResults.length = 15;

                // Incomplete
                inputRecords[0] = createRecord('9:00', null, null, null);
                inputRecords[1] = createRecord(null, '12:00', null, null);
                inputRecords[2] = createRecord(null, null, '13:00', null);
                inputRecords[3] = createRecord(null, null, null, '18:00');
                inputRecords[4] = createRecord('9:00', '12:00', null, null);
                inputRecords[5] = createRecord('9:00', null, '13:00', null);
                inputRecords[6] = createRecord('9:00', null, null, '18:00');
                inputRecords[7] = createRecord(null, '12:00', null, '18:00');
                inputRecords[8] = createRecord(null, '12:00', '13:00', null);
                inputRecords[9] = createRecord(null, null, '13:00', '18:00');
                inputRecords[10] = createRecord(null, '12:00', '13:00', '18:00');
                inputRecords[11] = createRecord('9:00', null, '13:00', '18:00');
                inputRecords[12] = createRecord('9:00', '12:00', null, '18:00');
                inputRecords[13] = createRecord('9:00', '12:00', '13:00', null);
                inputRecords[14] = createRecord('9:00', '12:00', '13:00', '18:00', 'Sabe de nada, inocente!');
            }));

            it('returns a row', function() {
                expectedResults[0] = createRow('9:00', false, null, null, null, null, null, null);
                expectedResults[1] = createRow(null, null, '12:00', false, null, null, null, null);
                expectedResults[2] = createRow(null, null, null, null, '13:00', false, null);
                expectedResults[3] = createRow(null, null, null, null, null, null, '18:00', false);
                expectedResults[4] = createRow('9:00', false, '12:00', false, null, null, null, null);
                expectedResults[5] = createRow('9:00', false, null, null, '13:00', false, null, null);
                expectedResults[6] = createRow('9:00', false, null, null, null, null, '18:00', false);
                expectedResults[7] = createRow(null, null, '12:00', false, null, null, '18:00', false);
                expectedResults[8] = createRow(null, null, '12:00', false, '13:00', false, null, null);
                expectedResults[9] = createRow(null, null, null, null, '13:00', false, '18:00', false);
                expectedResults[10] = createRow(null, null, '12:00', false, '13:00', false, '18:00', false);
                expectedResults[11] = createRow('9:00', false, null, null, '13:00', false, '18:00', false);
                expectedResults[12] = createRow('9:00', false, '12:00', false, null, null, '18:00', false);
                expectedResults[13] = createRow('9:00', false, '12:00', false, '13:00', false, null, null);
                expectedResults[14] = createRow('9:00', false, '12:00', false, '13:00', false, '18:00', false, 'Sabe de nada, inocente!');
                for (var i = 0; i < 15; i++) {
                    expect(rowManager.getRow(inputRecords[i], false, false)).toEqualData(expectedResults[i]);
                }
            });

            it('returns a row rounding', function() {
                expectedResults[0] = createRow('9:00', false, null, null, null, null, null, null);
                expectedResults[1] = createRow(null, null, '12:00', false, null, null, null, null);
                expectedResults[2] = createRow(null, null, null, null, '13:00', false, null);
                expectedResults[3] = createRow(null, null, null, null, null, null, '18:00', false);
                expectedResults[4] = createRow('9:00', false, '12:00', false, null, null, null, null);
                expectedResults[5] = createRow('9:00', false, null, null, '13:00', false, null, null);
                expectedResults[6] = createRow('9:00', false, null, null, null, null, '18:00', false);
                expectedResults[7] = createRow(null, null, '12:00', false, null, null, '18:00', false);
                expectedResults[8] = createRow(null, null, '12:00', false, '13:00', false, null, null);
                expectedResults[9] = createRow(null, null, null, null, '13:00', false, '18:00', false);
                expectedResults[10] = createRow(null, null, '12:00', false, '13:00', false, '18:00', false);
                expectedResults[11] = createRow('9:00', false, null, null, '13:00', false, '18:00', false);
                expectedResults[12] = createRow('9:00', false, '12:00', false, null, null, '18:00', false);
                expectedResults[13] = createRow('9:00', false, '12:00', false, '13:00', false, null, null);
                expectedResults[14] = createRow('9:00', false, '12:00', false, '13:00', false, '18:00', false, 'Sabe de nada, inocente!');
                for (var i = 0; i < 15; i++) {
                    expect(rowManager.getRow(inputRecords[i], false, true)).toEqualData(expectedResults[i]);
                }
            });

            it('returns a row optimizing', function() {
                expectedResults[0] = createRow('9:00', false, '12:00', true, '13:00', true, '18:00', true);
                expectedResults[1] = createRow(null, null, '12:00', false, null, null, null, null);
                expectedResults[2] = createRow(null, null, null, null, '13:00', false, null);
                expectedResults[3] = createRow(null, null, null, null, null, null, '18:00', false);
                expectedResults[4] = createRow('9:00', false, '12:00', false, '13:00', true, '18:00', true);
                expectedResults[5] = createRow('9:00', false, null, null, '13:00', false, null, null);
                expectedResults[6] = createRow('9:00', false, null, null, null, null, '18:00', false);
                expectedResults[7] = createRow(null, null, '12:00', false, null, null, '18:00', false);
                expectedResults[8] = createRow(null, null, '12:00', false, '13:00', false, null, null);
                expectedResults[9] = createRow(null, null, null, null, '13:00', false, '18:00', false);
                expectedResults[10] = createRow(null, null, '12:00', false, '13:00', false, '18:00', false);
                expectedResults[11] = createRow('9:00', false, null, null, '13:00', false, '18:00', false);
                expectedResults[12] = createRow('9:00', false, '12:00', false, null, null, '18:00', false);
                expectedResults[13] = createRow('9:00', false, '12:00', false, '13:00', false, '18:00', true);
                expectedResults[14] = createRow('9:00', false, '12:00', false, '13:00', false, '18:00', false, 'Sabe de nada, inocente!');
                for (var i = 0; i < 15; i++) {
                    expect(rowManager.getRow(inputRecords[i], true, false)).toEqualData(expectedResults[i]);
                }
            });

            it('returns a row rounding and optimizing', function() {
                expectedResults[0] = createRow('9:00', false, '11:55', true, '13:05', true, '17:51', true);
                expectedResults[1] = createRow(null, null, '12:00', false, null, null, null, null);
                expectedResults[2] = createRow(null, null, null, null, '13:00', false, null);
                expectedResults[3] = createRow(null, null, null, null, null, null, '18:00', false);
                expectedResults[4] = createRow('9:00', false, '12:00', false, '13:05', true, '17:51', true);
                expectedResults[5] = createRow('9:00', false, null, null, '13:00', false, null, null);
                expectedResults[6] = createRow('9:00', false, null, null, null, null, '18:00', false);
                expectedResults[7] = createRow(null, null, '12:00', false, null, null, '18:00', false);
                expectedResults[8] = createRow(null, null, '12:00', false, '13:00', false, null, null);
                expectedResults[9] = createRow(null, null, null, null, '13:00', false, '18:00', false);
                expectedResults[10] = createRow(null, null, '12:00', false, '13:00', false, '18:00', false);
                expectedResults[11] = createRow('9:00', false, null, null, '13:00', false, '18:00', false);
                expectedResults[12] = createRow('9:00', false, '12:00', false, null, null, '18:00', false);
                expectedResults[13] = createRow('9:00', false, '12:00', false, '13:00', false, '17:51', true);
                expectedResults[14] = createRow('9:00', false, '12:00', false, '13:00', false, '18:00', false, 'Sabe de nada, inocente!');
                for (var i = 0; i < 15; i++) {
                    expect(rowManager.getRow(inputRecords[i], true, true)).toEqualData(expectedResults[i]);
                }
            });
        });
    });
});
