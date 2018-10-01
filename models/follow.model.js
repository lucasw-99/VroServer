const db = require('./db')
const sqlerrors = require('../errors/sql-errors')


module.exports.getUserFollowerIds = async function(userId) {
  getUserFollowersQuery = `SELECT followingUserId FROM FOLLOWERS
                           WHERE followedUserId = ?`
  values = [userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, getUserFollowersQuery, values)
    results = output.results.map(function (val) {
                                  return val.followingUserId
                                 })
    console.log('results:', results)
    return results
  } catch (err) {
    throw err
  }
}

module.exports.getUserFollowingIds = async function(userId) {
  getUserFollowingQuery = `SELECT followedUserId FROM FOLLOWERS
                           WHERE followingUserId = ?`
  values = [userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, getUserFollowingQuery, values)
    results = output.results.map(function (val) {
                                  return val.followedUserId
                                 })
    console.log('following results:', results)
    return results
  } catch (err) {
    throw err
  }
}

module.exports.addFollower = async function(userId, newFollowerId) {
  addFollowerQuery = `INSERT INTO FOLLOWERS
                      VALUES (?, ?)`
  values = [newFollowerId, userId]
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    output = await db.query(transaction, addFollowerQuery, values, keepConnection)
    var newFollower = global.streamClient.feed('timeline', newFollowerId.toString());
    await newFollower.follow('user', userId.toString())
    await db.commitTransaction(transaction)
    return output.results
  } catch (err) {
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}

module.exports.removeFollower = async function(userId, removeFollowerId) {
  removeFollowerQuery = `DELETE FROM FOLLOWERS
                         WHERE followingUserId = ? AND followedUserId = ?`
  values = [removeFollowerId, userId]
  calledGetStream = false
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    output = await db.query(transaction, removeFollowerQuery, values, keepConnection)
    var follower = global.streamClient.feed('timeline', removeFollowerId.toString());
    calledGetStream = true
    await follower.unfollow('user', userId.toString())
    await db.commitTransaction(transaction)
    return output.results
  } catch (err) {
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}
