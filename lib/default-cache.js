
/**
 * This is a lightweight wrapper around the node-cache module
 * to make it comply with the pipeline-queue cache interface.
 */

const DEBUG_NAME = 'pipeline-queue-mysql:DefaultCache';

const { inspect } = require('util');
const debug       = require('debug')(DEBUG_NAME);
const NodeCache   = require('node-cache');
const DEFAULT_TTL = 250; // in milliseconds


const isFunction  = (fn) => typeof fn === 'function' ? true : false;


const Wrapper   = (config = {}) => {
  config.stdTTL = (config.ttl || DEFAULT_TTL) / 1000;
  delete config.ttl;

  const cache = new NodeCache(config);

  return {

    del: cache.del.bind(cache)

  , status: cache.getStats.bind(cache)

  , on: cache.on.bind(cache)

  , keys: cache.keys.bind(cache)

  , set: (key, value, done) => {

      debug(`::set - Key: ${key} -- ${inspect(value)}`);

      const handler = isFunction(done) ?
        (err) => {

          debug(`::set - complete -- ${inspect(value)}`);
          return done(err, value);

        } : undefined;

      return cache.set(key, value, handler);
    }

  , get: (key, done) => {

      debug(`::get - Key: ${key}`);

      const handler = isFunction(done) ?
        (err, value) => {
          
          debug(`::get - complete -- ${inspect(value)}`);
          return err ? done(err) : done(null, value);

        } : undefined;

      return cache.get(key, handler);
    }

  , clear: (done) => {
      cache.flushAll();
      return done(null);
    }
  };
};


module.exports = Wrapper;
