
/**
 * A middleware plugin for express.
 */

const QueuedPool = require('./queued-pool');
const onFinished = require('on-finished');

const DEFAULT_NAMESPACE = 'mysql';


const validateConfig = (config) => {

  if (!config.driver) {
    throw new TypeError('You must provide a driver');
  }
  if (typeof config.driver.createPool !== 'function') {
    throw new TypeError('Your driver must support connection pooling');
  }

  return config;
};


const Middleware = ( config = {}) => {

  const {
    namespace    = DEFAULT_NAMESPACE
  , driver
  , queue_config = {}
  }              = validateConfig(config);

  const pool     = QueuedPool(driver, queue_config);
  
  return (req, res, next) => {

    if (req.hasOwnProperty(namespace) ) {
      throw new Error('Namespace Collision: ' + namespace);
    }

    pool.getConnection((err, conn) => {

      if (err) return next(err);

      req[namespace] = conn;

      onFinished(res, () => conn.release());

      return next();

    });

  };
}


module.exports = Middleware;
