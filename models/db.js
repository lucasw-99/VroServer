const mysql =  require('mysql')
const util = require('util')

/**
 * Defines database operations.
 * @class
 */
var DB = function(){};
DB.prototype.createPool = function() {
  return mysql.createPool({
      host     : 'localhost',  // Hostname 'localhost' If locally connected
      user     : 'root',       // Username
      password : 'qwerty',     // Password
      database: 'vro_server',  // Database name
      connectionLimit : 10
  });
}

/**
 * Establishes mysql connection and returns the connection object.
 * @function
 * @param {object} pool - Mysql pool object.
 * @param {function} callback - Callback.
 */
DB.prototype.getConnection = function getConnection() {
  return new Promise( (resolve, reject) => {
    pool = global.SQLpool
    pool.getConnection(function(err, connection) {
      if (err) {
        //logging here
        console.log(err)
        return reject(err)
      }
      connection.on('error', function(err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          connection.destroy()
        } else {
          connection.release()
        }
        console.log('err from error thing, fuk', err)
        return reject(err)
      })
      return resolve(connection)
    })
  })
}

DB.prototype.query = async function(connection, sqlQuery, args) {
  return new Promise( (resolve, reject) => {
    if (!args) {
      connection.query(sqlQuery, function(err, results, fields) {
        connection.release()
        if (err) {
          console.log(err.message);
          return reject(err)        
        } else {
          return resolve({ err: err, results: results, fields: fields })
        }
      });
    } else {
      connection.query(sqlQuery, args, function(err, results, fields) {
        connection.release()
        if (err) {
          console.log(err.message);
          return reject(err)
        } else {
          return resolve({ err: err, results: results, fields: fields })
        }
      });
    }  
  })
}

/**
 * Establishes mysql connection, begins transaction and returns the transactio connection object.
 * @function
 * @param {object} pool - Mysql pool object.
 * @param {function} callback - Callback.
 */
DB.prototype.createTransaction = function(pool,callback) {
  var self = this;
  self.getConnection(pool,function(err,connection) {
    if (err) {
      //logging here
      console.log(err);
      callback(true);
      return;
    }
    connection.beginTransaction(function(err) {
      if (err){
        console.log(err);
        callback(true);
        return;
      }
      callback(null,connection)
    });
  });
}
module.exports = new DB();
