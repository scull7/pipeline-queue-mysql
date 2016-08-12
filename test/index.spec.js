/*eslint-env mocha, node*/
const { expect } = require('chai');
const pqm        = require('../index');


describe('pipeline-queue-mysql', function() {

  it('should be an object with express, QueuedPool properties', () => {

    expect(pqm.express).to.be.a('function');
    expect(pqm.QueuedPool).to.be.a('function');

  });

});
