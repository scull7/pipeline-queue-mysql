/*eslint-env node, mocha*/
const { expect } = require('chai');
const sinon      = require('sinon');
const MW         = require('../../lib/express');


const testDriver = {
  createPool: sinon.stub().returns(42)
}


const testConfig = {
  driver: testDriver
};


describe('expressjs Middleware', function() {

  it('should be a function that returns a middleware function', () => {

    const mw = MW(testConfig);

    expect(mw).to.be.a('function');
    expect(mw.length).to.eql(3);

  });


  it('should throw a TypeError if a driver is not provided', () => {

    const test = () => MW(testDriver);

    expect(test).to.throw(TypeError, /You must provide a driver/);

  });


  it('should throw a TypeError if the driver does not have a ' +
  'createPool method', () => {

    const test = () => MW({ driver: {} });

    expect(test).to.throw(
      TypeError
    , /Your driver must support connection pooling/
    )

  });

});
