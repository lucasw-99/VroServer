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
                      VALUES (?, ?, ?)`
  getStreamTime = new Date().toISOString()
  values = [newFollowerId, userId, getStreamTime]
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    output = await db.query(transaction, addFollowerQuery, values, keepConnection)
    var newFollower = global.streamClient.feed('timeline', newFollowerId.toString());
    await newFollower.follow('user', userId.toString())
    var notificationFeed = global.streamClient.feed('notification', userId.toString())
    // TODO (Lucas Wotton): How to rollback?
    await notificationFeed.addActivity({ 
      actor: newFollowerId.toString(),
      verb: 'follow',
      object: userId.toString(),
      foreign_id: 'follow:' + userId.toString() + ':' + newFollowerId.toString(),
      time: getStreamTime
    })
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
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    output = await db.query(transaction, removeFollowerQuery, values, keepConnection)
    var follower = global.streamClient.feed('timeline', removeFollowerId.toString());
    await follower.unfollow('user', userId.toString())
    var notificationFeed = global.streamClient.feed('notification', userId.toString())
    await notificationFeed.removeActivity({
      foreign_id: 'follow:' + userId.toString() + ':' + removeFollowerId.toString()
    })
    await db.commitTransaction(transaction)
    return output.results
  } catch (err) {
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}
