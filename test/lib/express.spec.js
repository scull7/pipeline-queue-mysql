/*eslint-env node, mocha*/
const Bluebird   = require('bluebird');
const { expect } = require('chai');
const sinon      = require('sinon');
const MW         = require('../../lib/express');


const testDriver = {
  createPool: sinon.stub().returns(42)
}


const testConfig = {
  driver: testDriver
};


let conn       = null;
let pool       = null;
let driver     = null;


describe('expressjs Middleware', function() {

  beforeEach(() => {

    conn = { 
      release: sinon.stub()
    };
    pool = {
      getConnection : sinon.stub().yields(null, conn)
    };

    driver = {
      createPool: sinon.stub().returns(pool)
    };

  });

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


  it('should create a connection pool and attach it to the ' +
  ' request object', () => {

    const mw = MW({ driver });

    const req = {};
    const res = {};

    mw(req, res, () => {

      expect(req.mysql).to.eql(conn);
      expect(pool.getConnection.calledOnce).to.be.true;
      expect(driver.createPool.calledOnce).to.be.true;

    });

  });


  it('should pass any connection error to the `next` function', (done) => {

    pool.getConnection = sinon.stub().yields(new Error('boom!'));

    const mw = MW({ driver });

    mw({}, {}, (err) => {

      expect(err.message).to.eql('boom!');
      done();

    });


  });


  it('should throw an error if you attempt to attach to an already ' +
  'attached namespace',(done) => {
    
    const mw = MW({ driver });
    const mw2 = MW({ driver });

    const req = {};
    const res = {};

    mw(req, res, () => {

      const test = () => mw2(req, res, done);

      expect(test).to.throw(
        Error,
        /Namespace Collision: mysql/
      );

      done();

    });


  });


  it('should cache multiple calls to the query method', (done) => {

    const mw = MW({ driver });

    const req = {};
    const res = {};

    const test_query  = 'foo, bar';
    const test_params = [ 'foo', 'bar' ]

    let calls = 0;
    const queryStub   = (sql, params, cb) => {
      expect(sql).to.eql(test_query);
      expect(params).to.eql(test_params);
      calls++;

      setTimeout(cb, 10, null, 'foo');

    };
    conn.query        = queryStub;

    const run = (req) => new Bluebird((resolve, reject) =>
      req.mysql.query(test_query, test_params, (err, result) =>
        err ? reject(err) : resolve(result)
      )
    );

    mw(req, res, () => {

      const x = run(req);
      const y = run(req);

      return Bluebird.all([ x, y ])

      .then((results) => {

        expect(results).to.deep.eql([ 'foo', 'foo' ]);
        expect(calls).to.eql(1);

        done();

      })
    
      .catch(done);

    });

  });

});
