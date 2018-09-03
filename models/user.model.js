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

module.exports.getUserById = async function(userId, callback) {
  findUserQuery = "SELECT * FROM USERS WHERE id = ?"
  values = [userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, findUserQuery, values)
    results = output.results
    err = output.err
    if (err) {
      // TODO (Lucas Wotton): Should I throw an err here?
      console.log('throwing err from db query')
      throw err
    } else if (results.length === 0) {
      // no user with userId was found
      return { success: false }
    } else {
      // TODO (Lucas Wotton): Find out why new User doesn't work. For now results[0] works LOL
      return { success: true, user: results[0] }
    }
  } catch (err) {
    throw err
  }
}

module.exports.getUserByUsername = async function(username) {
  findUserQuery = "SELECT * FROM USERS WHERE username = ?"
  values = [username]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, findUserQuery, values)
  } catch (err) {
    throw err
  }
  results = output.results
  err = output.err
  if (err) {
    throw err 
  } else if (results.length === 0) {
    return { success: false, msg: "No user with username " + username + " was found." }
  } else {
    user = results[0]
    // TODO (Lucas Wotton): Find out why new User doesn't work. For now user works LOL
    return { success: true, user: user }
  }
}

module.exports.addUser = function(newUser, callback) {
  return new Promise( (resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, async function(err, hash) {
        if (err) {
          throw err
        }
        newUser.password = hash
        insertUserQuery = "INSERT INTO USERS(username, email, password, photoUrl) VALUES (?)"
        values = [[newUser.username, newUser.email, newUser.password, newUser.photoUrl]]
        try {
          // TODO (Lucas Wotton): Make this a transaction
          connection = await db.getConnection()
          result = await db.query(connection, insertUserQuery, values)
          resolve({ success: true, userId: result.results.insertId })
        } catch (err) {
          reject(err)
        }
      })
    })
  })
}

module.exports.comparePassword = function(candidatePassword, hash) {
  return new Promise( (resolve, reject) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
      if (err) {
        reject(err)
      } else {
        resolve(isMatch)
      }
    })
  })
}
