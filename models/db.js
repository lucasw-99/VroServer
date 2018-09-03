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

DB.prototype.query = function(connection, sqlQuery, args=false, keepConnection=false) {
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
        if (!keepConnection) {
          connection.release()
        }
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
 * Establishes mysql connection, begins transaction and returns the transaction connection object.
 * @function
 * @param {object} pool - Mysql pool object.
 * @param {function} callback - Callback.
 */
DB.prototype.createTransaction = function(connection) {
  return new Promise( (resolve, reject) => {
    connection.beginTransaction(function(err) {
      if (err){
        reject(err)
      } else {
        resolve(connection)
      }
    })
  })
}

DB.prototype.commitTransaction = function(connection) {
  return new Promise( (resolve, reject) => {
    connection.commit(function(err) {
      if (err) {
        connection.rollback(function() {
          return reject(err)
        })
      } else {
        return resolve()  
      }
    })
  })
}

DB.prototype.rollbackTransaction = function(connection) {
  return new Promise( (resolve, reject) => {
    connection.rollback(function() {
      resolve()
    })
  })
}

module.exports = new DB();
