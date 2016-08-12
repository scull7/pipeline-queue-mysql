
/**
 * This is a lightweight wrapper around the node-cache module
 * to make it comply with the pipeline-queue cache interface.
 */

const NodeCache   = require('node-cache');
const DEFAULT_TTL = 250; // in milliseconds


const Wrapper   = (config) => {
  config.stdTTL = (config.ttl || DEFAULT_TTL) / 1000;
  delete config.ttl;

  const cache = new NodeCache(config);

  return {

    del: cache.del.bind(cache)

  , status: cache.getStats.bind(cache)

  , on: cache.on.bind(cache)

  , set: (key, value, done) =>
      cache.set(key, value, (err) => done(err, value))

  , get: (key, done) =>
      cache.get(key, (err, value) =>
        err ? done(err) : done(null, value[key])
      )

  , clear: (done) => {
      cache.flushAll();
      return done(null);
    }
  };
};


module.exports = Wrapper;
