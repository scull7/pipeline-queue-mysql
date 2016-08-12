
const crypto      = require('crypto');
const Queue       = require('pipeline-queue');
const Pool        = require('./pool');
const Cache       = require('./default-cache');

const noop        = function() {};

const HASH_TYPE   = 'sha1';
const HASH_OUTPUT = 'base64';


const makeKey = (query, params) => {
  const hash = crypto.createHash(HASH_TYPE);

  hash.update( typeof query === 'string' ? query : JSON.stringify(query) );
  hash.update( JSON.stringify(params) );

  return hash.digest(HASH_OUTPUT);
}


const query = (queue, conn, runner) => (query, params, handler) => {
  if (typeof params === 'function') {
    handler = params;
    params  = [];
  } else if (!params) {
    params  = [];
  }

  if (!handler) handler = noop;

  const key = makeKey(query, params);
  const task = runner.bind(conn, query, params);

  return queue.run(key, task, handler);
};


const patch = (queue, db) => {

  if (db.patched) return db;

  const runnable = db.query;
  
  db.patched     = true;
  db.query = query(queue, db, runnable);

  return db;
};


const ConnectionHandler = function(queue, cache, done) {

  return function(err, connection) {
    if (err) return done(err);

    const queued_conn = patch(queue, connection);

    // Give the user access to the queue and cache
    // to allow management.
    queued_conn.cache = cache;
    queued_conn.queue = queue;

    return done(null, queued_conn);
  };
};


const QueuedPool = (driver, config) => {

  const pool         = Pool(driver, config);
  const cache_config = { ttl: config.ttl };
  const cache        = config.cache = config.cache || Cache(cache_config);
  const queue        = config.queue || Queue(config);

  const conn_handler = ConnectionHandler.bind(null, queue, cache);

  return {
    getConnection: (done) => pool.getConnection(conn_handler(done))
  };

};


module.exports = QueuedPool;
