describe('MeuPonto filters:', function() {
    beforeEach(module('meupontoFilters'));

    describe('monthName', function() {
        var monthNameFilter;

        beforeEach(inject(function($filter) {
            monthNameFilter = $filter('monthName');
        }));

        it('returns the correct month name', function() {
            expect(monthNameFilter('01')).toEqual('Janeiro');
            expect(monthNameFilter('02')).toEqual('Fevereiro');
            expect(monthNameFilter('03')).toEqual('Março');
            expect(monthNameFilter('04')).toEqual('Abril');
            expect(monthNameFilter('05')).toEqual('Maio');
            expect(monthNameFilter('06')).toEqual('Junho');
            expect(monthNameFilter('07')).toEqual('Julho');
            expect(monthNameFilter('08')).toEqual('Agosto');
            expect(monthNameFilter('09')).toEqual('Setembro');
            expect(monthNameFilter('10')).toEqual('Outubro');
            expect(monthNameFilter('11')).toEqual('Novembro');
            expect(monthNameFilter('12')).toEqual('Dezembro');
        });
    });

    describe('dayOfWeek', function() {
        var dayOfWeekFilter;

        beforeEach(inject(function($filter) {
            dayOfWeekFilter = $filter('dayOfWeek');
        }));

        it('returns the correct day of week', function() {
            expect(dayOfWeekFilter('20141201')).toEqual('Segunda-feira');
            expect(dayOfWeekFilter('20141202')).toEqual('Terça-feira');
            expect(dayOfWeekFilter('20141203')).toEqual('Quarta-feira');
            expect(dayOfWeekFilter('20141204')).toEqual('Quinta-feira');
            expect(dayOfWeekFilter('20141205')).toEqual('Sexta-feira');
            expect(dayOfWeekFilter('20141206')).toEqual('Sábado');
            expect(dayOfWeekFilter('20141207')).toEqual('Domingo');
            expect(dayOfWeekFilter('20150501')).toEqual('Sexta-feira');
            expect(dayOfWeekFilter('20160501')).toEqual('Domingo');
            expect(dayOfWeekFilter('20170501')).toEqual('Segunda-feira');
        });
    });

    describe('dayWithoutMark', function() {
        var dayWithoutMarkFilter;

        beforeEach(inject(function($filter) {
            dayWithoutMarkFilter = $filter('dayWithoutMark');
        }));

        it('takes away the mark for adjust', function() {
            expect(dayWithoutMarkFilter('01')).toEqual('01');
            expect(dayWithoutMarkFilter('01_')).toEqual('01');
        });
    });
});
