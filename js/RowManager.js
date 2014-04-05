function RowManager(config, utils) {
    var dateTimeFormats;
    var officialTimes;
    var tolerances;

    // Tests if all entries of a record are valid
    var isValidRecord = function(record) {
        if (record === undefined || record === null) {
            return false;
        }
        var values = [record.entry1, record.entry2, record.exit1, record.exit2];
        for (var i = 0; i < values.length; i++) {
            var date = moment(values[i], dateTimeFormats.time);
            if (!date || !date.isValid()) {
                return false;
            }
        }
        return true;
    };

    // Rounds time based on an official time and tolerance
    // Example: 09:04 -> 09:00
    var getRoundedTime = function(time, officialTime, tolerance) {
        var diff = moment(time, dateTimeFormats.time).diff(moment(officialTime, dateTimeFormats.time));
        return Math.abs(diff) <= tolerance ? officialTime : time;
    };

    var getExitTime = function(partialRecord, round) {
        var currentTotal, timeToGo;
        if (!round) {
            currentTotal = moment(partialRecord.exit1, dateTimeFormats.time).diff(moment(partialRecord.entry1, dateTimeFormats.time));
            timeToGo = officialTimes.journeyDuration - currentTotal;
            return moment(partialRecord.entry2, dateTimeFormats.time).add('ms', timeToGo).format(dateTimeFormats.time);
        }

        var entry1 = getRoundedTime(partialRecord.entry1, officialTimes.entry1, tolerances.entry);
        var entry2 = getRoundedTime(partialRecord.entry2, officialTimes.entry2, tolerances.entry);
        var exit1 = getRoundedTime(partialRecord.exit1, officialTimes.exit1, tolerances.entry);

        currentTotal = moment(exit1, dateTimeFormats.time).diff(moment(entry1, dateTimeFormats.time));
        timeToGo = officialTimes.journeyDuration - tolerances.total - currentTotal;
        var exitTime = moment(entry2, dateTimeFormats.time).add('ms', timeToGo);

        var officialExitTime = moment(officialTimes.exit2, dateTimeFormats.time);
        var officialDiff;
        if (!exitTime.isBefore(officialExitTime)) {
            officialDiff = exitTime.diff(officialExitTime);
            if (officialDiff < tolerances.entry) {
                exitTime = officialExitTime.add('ms', tolerances.entry + 60000);
            } else {
                exitTime = exitTime.add('m', 1);
            }
        } else {
            officialDiff = officialExitTime.diff(exitTime);
            if (officialDiff > tolerances.entry) {
                exitTime = exitTime.add('m', 1);
            } else {
                exitTime = officialExitTime.subtract('ms', tolerances.entry);
            }
        }

        return exitTime.format(dateTimeFormats.time);
    };

    var hasHole = function(record) {
        var keys = ['entry1', 'exit1', 'entry2', 'exit2'];
        var hasLast = true;
        for (var i = 0; i < keys.length; i++) {
            var isValid = record[keys[i]] !== undefined && record[keys[i]] !== '';
            if (!hasLast && isValid) {
                return true;
            }
            hasLast = isValid;
        }
        return false;
    };

    // Verifies if the first entry is valid (if it exists)
    var isEntry1Valid = function(record) {
        if (record && record.entry1) {
            if (moment(record.entry1, dateTimeFormats.time).isAfter(moment(officialTimes.exit1, dateTimeFormats.time))) {
                return false;
            }
        }
        return true;
    };

    this.setConfig = function() {
        dateTimeFormats = config.dateTimeFormats;
        officialTimes = config.officialTimes;
        tolerances = config.tolerances;
    };

    // Receives a value and its unit and creates a balance object which is useful for display
    this.getBalanceObject = function(value, unit) {
        var minutes;
        if (unit.toLowerCase() == 'ms') {
            minutes = Math.floor(value / 60000);
        } else if (unit.toLowerCase() == 's') {
            minutes = Math.floor(value / 60);
        } else { // minutes
            minutes = value;
        }
        return {
            display: utils.getFormattedTime(minutes, false),
            value: minutes
        };
    };

    // Returns the balance of a record with or without rounds
    this.getBalance = function(record, round) {
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
            entry1 = getRoundedTime(record.entry1, officialTimes.entry1, tolerances.entry);
            entry2 = getRoundedTime(record.entry2, officialTimes.entry2, tolerances.entry);
            exit1 = getRoundedTime(record.exit1, officialTimes.exit1, tolerances.entry);
            exit2 = getRoundedTime(record.exit2, officialTimes.exit2, tolerances.entry);
        }

        var interval = moment(entry2, dateTimeFormats.time).diff(moment(exit1, dateTimeFormats.time));
        var total = moment(exit2, dateTimeFormats.time).diff(moment(entry1, dateTimeFormats.time));
        var balanceValue = total - interval - officialTimes.journeyDuration;

        if (!round) {
            return this.getBalanceObject(balanceValue, 'ms');
        }

        var balanceValueRounded;
        if (balanceValue > 0) {
            balanceValueRounded = balanceValue - tolerances.total < 0 ? 0 : balanceValue;
        } else {
            balanceValueRounded = balanceValue + tolerances.total > 0 ? 0 : balanceValue;
        }
        return this.getBalanceObject(balanceValueRounded, 'ms');
    };

    this.getRow = function(record, optimal, round) {
        var row;
        if (record && record.adjust !== undefined) {
            row = {};
        } else {
            row = {
                entry1: {},
                entry2: {},
                exit1: {},
                exit2: {}
            };

            var optimize = optimal && !hasHole(record) && isEntry1Valid(record);
            if (record && record.entry1 !== undefined && record.entry1 !== '') {
                row.entry1.display = record.entry1;
                row.entry1.optimal = false;
            } else {
                if (optimize) {
                    if (round) {
                        row.entry1.display = moment(officialTimes.entry1, dateTimeFormats.time).add('ms', tolerances.entry).format(dateTimeFormats.time);
                    } else {
                        row.entry1.display = officialTimes.entry1;
                    }
                    row.entry1.optimal = true;
                }
            }
            if (record && record.entry2 !== undefined && record.entry2 !== '') {
                row.entry2.display = record.entry2;
                row.entry2.optimal = false;
            } else {
                if (optimize) {
                    var optimizedEntry2;
                    if (record && record.exit1) {
                        var officialLunchDuration = moment(officialTimes.entry2, dateTimeFormats.time).diff(moment(officialTimes.exit1, dateTimeFormats.time));
                        optimizedEntry2 = moment(record.exit1, dateTimeFormats.time).add(officialLunchDuration).format(dateTimeFormats.time);
                    } else {
                        optimizedEntry2 = officialTimes.entry2;
                    }

                    if (round) {
                        row.entry2.display = moment(optimizedEntry2, dateTimeFormats.time).add('ms', tolerances.entry).format(dateTimeFormats.time);
                    } else {
                        row.entry2.display = optimizedEntry2;
                    }
                    row.entry2.optimal = true;
                }
            }
            if (record && record.exit1 !== undefined && record.exit1 !== '') {
                row.exit1.display = record.exit1;
                row.exit1.optimal = false;
            } else {
                if (optimize) {
                    if (round) {
                        row.exit1.display = moment(officialTimes.exit1, dateTimeFormats.time).subtract('ms', tolerances.entry).format(dateTimeFormats.time);
                    } else {
                        row.exit1.display = officialTimes.exit1;
                    }
                    row.exit1.optimal = true;
                }
            }
            if (record && record.exit2 !== undefined && record.exit2 !== '') {
                row.exit2.display = record.exit2;
                row.exit2.optimal = false;
            } else {
                if (optimize) {
                    var partialRecord = {
                        entry1: row.entry1.display,
                        entry2: row.entry2.display,
                        exit1: row.exit1.display
                    };
                    row.exit2.display = getExitTime(partialRecord, round);
                    row.exit2.optimal = true;
                }
            }
        }

        row.note = record.note;
        return row;
    };

    // Constructor
    this.setConfig(config);
}
