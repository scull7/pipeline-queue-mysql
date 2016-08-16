/*eslint-env node, mocha*/
const { expect } = require('chai');
const pool       = require('../../lib/pool.js');


const testDriver = {
  createPool: (config) => config
};




describe('lib/pool.js', function() {

  let testConfig = null;


  beforeEach(function() {
    testConfig = pool(testDriver);
  });


  describe('Config::typeCase', function() {

    it('should return field.string() if the field.type is "LONG"', (done) => {

      const field  = { type: 'LONG', string: () => 'long string' };
      const next   = () => done('unexpected next call');
      const actual = testConfig.typeCase(field, next);

      expect(actual).to.eql('long string');
      done();

    });


    it('should return null if the field type is "TIMESTAMP" and ' +
    'the value is null/undefined', (done) => {

      const nullField  = { type: 'TIMESTAMP', string: () => null };
      const undefField = { type: 'TIMESTAMP', string: () => undefined };
      const next       = () => done('unexpected next call');

      const nullActual = testConfig.typeCase(nullField, next);
      expect(nullActual).to.be.null;

      const undefActual = testConfig.typeCase(undefField, next);
      expect(undefActual).to.be.null;

      done();

    });


    it('should return the unix timestamp of the given MySQL timestamp ',
    (done) => {

      const mysql_time = '2016-08-16 07:53:49Z';
      const expected = 1471334029;

      const field  = { type: 'TIMESTAMP', string: () => mysql_time };
      const next   = () => done('unexpected next call');
      const actual = testConfig.typeCase(field, next);

      expect(actual).to.eql(expected);
      done();

    });


    it('should call next when none of the type cases match', (done) => {

      let called  = false;
      const field = { type: 'WHATEVER', string: () => 'doesn\'t matter' };

      const next = (...args) => {
        expect(called).to.be.false;
        expect(args.length).to.eql(0);
        done();
      };

      testConfig.typeCase(field, next);
      

    });


  });


});
