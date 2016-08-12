
/**
 * A middleware plugin for express.
 */

const QueuedPool = require('./queued-pool');
const onFinished = require('on-finished');


const Middleware = ({ namespace = 'mysql', queue_config = {} }) => {

  const pool = QueuedPool(queue_config);
  
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
