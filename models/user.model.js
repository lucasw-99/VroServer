const bcrypt = require('bcryptjs')
const db = require('./db')
const sqlerrors = require('../errors/sql-errors')

newUserPhotoUrl = "https://www.google.com/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F9%2F9f%2FNew_user_icon-01.svg%2F2000px-New_user_icon-01.svg.png&imgrefurl=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3ANew_user_icon-01.svg&docid=uyawawvKmYeYAM&tbnid=cGR4SJaiS0LUzM%3A&vet=10ahUKEwjZ8I7__uPdAhXzKX0KHXwVBfIQMwhHKAEwAQ..i&w=2000&h=1926&bih=637&biw=1264&q=new%20user&ved=0ahUKEwjZ8I7__uPdAhXzKX0KHXwVBfIQMwhHKAEwAQ&iact=mrc&uact=8"

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
        if (newUser.photoUrl === null) {
          newUser.photoUrl = newUserPhotoUrl  
        }
        insertUserQuery = "INSERT INTO USERS(username, email, password, photoUrl) VALUES (?)"
        values = [[newUser.username, newUser.email, newUser.password, newUser.photoUrl]]
        transaction = null
        try {
          connection = await db.getConnection()
          transaction = await db.createTransaction(connection)
          result = await db.query(transaction, insertUserQuery, values)
          var object = {
            "id": result.results.insertId,
            "username": newUser.username,
            "email": newUser.email,
            "photoUrl": newUser.photoUrl
          }
          await global.algoliaUsernameIndex.addObject(object)
          await db.commitTransaction(transaction)
          resolve({ success: true, userId: result.results.insertId })
        } catch (err) {
          console.log(err)
          if (transaction) {
            await db.rollbackTransaction(transaction)
          }
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
