/*eslint-env node, mocha*/
const { expect } = require('chai');
const Cache = require('../../lib/default-cache');


describe('default-cache', function() {

  let cache = null;

  beforeEach(() => cache = Cache());

  it('should be a function', () => {
    expect(Cache).to.be.a('function');
  });


  it('should allow me to list all of the keys in the cache', () => {

    cache.set('foo', 'bar');
    cache.set('bar', 'baz');
    cache.set('baz', 'buzz');
    cache.set('buzz', 'boo');

    const actual   = cache.keys();
    const expected = [ 'foo', 'bar', 'baz', 'buzz' ];

    expect(actual).to.eql(expected);

  });


  it('should return the value when set successfully', (done) => {

    const test = 'foobar';

    cache.set('test', test, (err, response) => {

      expect(response).to.eql(test);
      done();

    });

  });


  it('should allow the user to set and retrieve a value', (done) => {

    const key  = 'test';
    const test = 'foobar';

    cache.set(key, test, (err) => {
      if (err) return done(err);

      cache.get(key, (err, response) => {

        if (err) return done(err);

        expect(response).to.eql(test);
        done();

      });

    });

  });

});
