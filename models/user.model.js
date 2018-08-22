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

module.exports.getUserFollowers = function(userId, callback) {
  User.findById(userId, callback)
}

module.exports.addFollower = async function(userId, newFollowerId, callback) {
  const session = await mongoose.startSession()
  session.startTransaction()
  console.log('session transaction started')
  try {
    const opts = { session, new: true }
    let firstUpdate = await User.update(
      { _id: userId },
      { $push: { followerIds: newFollowerId }},
      { session })
    console.log(firstUpdate)

    if (firstUpdate.ok) {
      console.log('first update ok')
      try {
        let secondUpdate = await User.update(
          { _id: newFollowerId },
          { $push: { followingIds: userId }},
          { session })
        if (!secondUpdate.ok) {
          throw new Error("Could not follow user due to error")
        }
        console.log('second update ok')

        await session.commitTransaction()
        session.endSession()
        callback(null)
      } catch (error) {
        await session.abortTransaction()
        session.endSession()
        callback(error)
      }
      return
    }
  } catch (error) {
      console.log(error)
      console.log('First transaction failed :(')
      await session.abortTransaction()
      session.endSession()
      callback(error)
  }
}

module.exports.removeFollower = function(userId, removeFollowerId, callback) {
  // TODO (Lucas Wotton): Make this atomic
  User.update(
    { _id: userId },
    { $pull: { followerIds: removeFollowerId }})
  User.update(
    { _id: removeFollowerId},
    { $pull: { followingIds: userId }},
    callback)
}
