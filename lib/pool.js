
const R      = require('ramda');
const moment = require('moment');


const CONFIG_PROPS = [
  'host'
, 'port'
, 'user'
, 'password'
, 'database'
];


const CONFIG_STATIC = {
  charset: 'UTF8MB4_UNICODE_CI'
, supportBigNumbers: true
, bigNumberStrings: true
, typeCase: (field, next) => {
    
    if (field.type === 'LONG') {

      return field.string();

    } else if (field.type === 'TIMESTAMP') {

      const value = field.string();

      if (R.isNil(value)) return null;

      return moment(value).unix();

    } else {
      return next();
    }

  }
}


const DEFAULT_DATABASE = {
  host     : 'localhost'
, port     : 3306
, user     : 'root'
, password : ''
, database : ''
};


const parseConfig = R.compose(
  R.merge(CONFIG_STATIC)
, R.props(CONFIG_PROPS)
, R.merge(DEFAULT_DATABASE)
);


module.exports = (driver, config) => driver.createPool( parseConfig(config) );
