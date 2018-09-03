const db = require('./db')
const sqlerrors = require('../errors/sql-errors')


// TODO (Lucas Wotton): Convert these results to return success instead of throwing exceptions
module.exports.getUserFollowerIds = async function(userId) {
  getUserFollowersQuery = `SELECT followingUserId FROM FOLLOWERS
                           WHERE followedUserId = ?`
  values = [userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, getUserFollowersQuery, values)
    results = output.results
    err = output.err
    return 
    if (err) {
      // TODO (Lucas Wotton): Should I throw an err here?
      console.log('throwing err from get followers db query')
      throw err
    } else {
      return results
    }
  } catch (err) {
    throw err
  }
}

module.exports.addFollower = async function(userId, newFollowerId) {
  addFollowerQuery = `INSERT INTO FOLLOWERS
                      VALUES (?, ?)`
  values = [newFollowerId, userId]
  calledGetStream = false
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    output = await db.query(transaction, addFollowerQuery, values)
    calledGetStream = true
    var newFollower = global.streamClient.feed('timeline', newFollowerId.toString());
    await newFollower.follow('user', userId.toString())
    await db.commitTransaction(transaction)
    return output.results
  } catch (err) {
    console.log(err)
    console.log('throwing err from add followers db query')
    if (transaction) {
      try {
        transaction.rollbackTransaction(function () {
          throw err
        })
      } catch (err2) {
        throw err
      }
    } else {
      throw err
    }
  }
}

module.exports.removeFollower = async function(userId, removeFollowerId, callback) {
  removeFollowerQuery = `DELETE FROM FOLLOWERS
                         WHERE followingUserId = ? AND followedUserId = ?`
  values = [removeFollowerId, userId]
  calledGetStream = false
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    output = await db.query(transaction, removeFollowerQuery, values)
    var follower = global.streamClient.feed('timeline', removeFollowerId.toString());
    calledGetStream = true
    await follower.unfollow('user', userId.toString())
    await db.commitTransaction(transaction)
    return output.results
  } catch (err) {
    if (transaction) {
      try {
        transaction.rollbackTransaction(function () {
          throw err
        })
      } catch (err2) {
        throw err
      }
    } else {
      throw err
    }
  }
}
