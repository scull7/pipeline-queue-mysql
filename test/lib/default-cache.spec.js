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


  it('should return the "same" object that is put into the cache',
  (done) => {

    const key = 'test';
    const test = { foo: 'bar' };

    cache.set(key, test, (err) => {
      if (err) return done(err);

      cache.get(key, (err, response) => {

        if (err) return done(err);

        expect(response).to.eql(test);
        done();

      });

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


  it('should allow the user to clear the cache.', () => {

    const k1 = 't1';
    const k2 = 't2';

    const set = (k, v) => new Promise((res, rej) =>
      cache.set(k, v, (err, val) => err ? rej(err) : res(val))
    );

    const get = (k) => new Promise((res, rej) =>
        cache.get(k, (err, val) => err ? rej(err) : res(val))
    );

    const flush = () => new Promise((res) => cache.clear(res));


    return Promise.all([ set(k1, 'foo'), set(k2, 'bar') ])

    .then(flush)

    .then(() => Promise.all([ get(k1), get(k2) ]))

    .then(([ v1, v2 ]) => {
      expect(v1).to.be.undefined;
      expect(v2).to.be.undefined;
    })

  });


  it('should run synchronously when not provided a callback', () => {

    cache.set('test', 'sync');
    const actual = cache.get('test');

    expect(actual).to.eql('sync');

  });

});
