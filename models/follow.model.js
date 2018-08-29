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
  try {
    connection = await db.getConnection()
    output = await db.query(connection, addFollowerQuery, values)
    return output.results
  } catch (err) {
    console.log('throwing err from add followers db query')
    throw err
  }
}

module.exports.removeFollower = async function(userId, removeFollowerId, callback) {
  removeFollowerQuery = `DELETE FROM FOLLOWERS
                      WHERE followingUserId = ? AND followedUserId = ?`
  values = [removeFollowerId, userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, removeFollowerQuery, values)
    return output.results
  } catch (err) {
    console.log('throwing err from add followers db query')
    throw err
  }
}
