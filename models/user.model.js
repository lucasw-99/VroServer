const bcrypt = require('bcryptjs')
const db = require('./db')
const sqlerrors = require('../errors/sql-errors')

module.exports.User = function User(username, password, email, photoUrl, id=null) {
  this.username = username
  this.password = password
  this.email = email
  this.photoUrl = photoUrl
  this.id = id
}

module.exports.getUserById = function(userId, callback) {
  findUserQuery = "SELECT * FROM USERS WHERE id = ?"
  console.log('userId:', userId)
  values = [userId]
  db.getConnection(global.SQLpool, (err, connection) => {
    if (err) {
      callback(err)
    } else {
      connection.query(findUserQuery, values, function(err, results, fields) {
        if (err) {
          callback(err)
        } else if (results.length === 0) {
          callback({ message: "No user with id " + id + " was found. User might have been deleted, and this is an old JWT." })
        } else {
          console.log(results)
          user = results[0]
          // TODO (Lucas Wotton): Find out why new User doesn't work. For now user works LOL
          callback(null, user)
        }
        connection.release()
      })
    }
  })
}

module.exports.getUserByUsername = function(username, callback) {
  findUserQuery = "SELECT * FROM USERS WHERE username = ?"
  values = [username]
  db.getConnection(global.SQLpool, (err, connection) => {
    if (err) {
      callback(err)
    } else {
      connection.query(findUserQuery, values, function(err, results, fields) {
        if (err) {
          callback(err)
        } else if (results.length === 0) {
          callback({ message: "No user with username " + username + " was found." })
        } else {
          user = results[0]
          // TODO (Lucas Wotton): Find out why new User doesn't work. For now user works LOL
          callback(null, user)
        }
        connection.release()
      })
    }
  })
}

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        throw err
      }
      newUser.password = hash
      insertUserQuery = "INSERT INTO USERS(username, email, password, photoUrl) VALUES (?)"
      values = [[newUser.username, newUser.email, newUser.password, newUser.photoUrl]]
      db.getConnection(global.SQLpool, (err, connection) => {
        if (err) {
          callback(err)
        } else {
          connection.query(insertUserQuery, values, function(err, results, fields) {
            if (err) {
              if (err.message.includes(sqlerrors.DUPLICATE_ENTRY)) {
                callback("User with username " + newUser.username + " already exists.")
              }
              callback(err)
            } else {
              callback(null, newUser)
            }
            connection.release()
          })
        }
      })
    })
  })
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) {
      throw err
    }

    callback(null, isMatch)
  })
}
