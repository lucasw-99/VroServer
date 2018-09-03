const db = require('./db')
const sqlerrors = require('../errors/sql-errors')


// TODO (Lucas Wotton): Convert these results to return success instead of throwing exceptions
module.exports.getUserLikes = async function(userId) {
  getUserLikesQuery = `SELECT eventId FROM LIKES
                       WHERE likingUserId = ?`
  values = [userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, getUserLikesQuery, values)
    results = output.results
    err = output.err
    console.log('if err is non-null review this code in likes. err:', err)
    return results
  } catch (err) {
    throw err
  }
}

module.exports.likePost = async function(userId, eventId, getStreamTime) {
  incrementLikesQuery = `UPDATE EVENTS
                         SET likeCount = likeCount + 1
                         WHERE id = ?`
  readNumLikesQuery = `SELECT likeCount FROM EVENTS
                       WHERE id = ?`
  addLikeQuery = `INSERT INTO LIKES 
                  VALUES (?, ?)`
  eventIdValues = [eventId]
  addLikeValues = [userId, eventId]
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    await db.query(transaction, incrementLikesQuery, eventIdValues, keepConnection)
    result = await db.query(transaction, readNumLikesQuery, eventIdValues, keepConnection)
    likeCount = result.results[0].likeCount
    await db.query(transaction, addLikeQuery, addLikeValues)
    console.log(getStreamTime)
    await global.streamClient.activityPartialUpdate({
      foreignID: 'Event:' + eventId.toString(),
      time: getStreamTime,
      set: {
        likeCount: likeCount
      }
    })
    await db.commitTransaction(transaction)
    return output.results
  } catch (err) {
    console.log(err.message)
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}

module.exports.unlikePost = async function(userId, eventId, getStreamTime) {
  decrementLikesQuery = `UPDATE EVENTS
                         SET likeCount = likeCount - 1
                         WHERE id = ?`
  readNumLikesQuery = `SELECT likeCount FROM EVENTS
                       WHERE id = ?`
  removeLikeQuery = `DELETE FROM LIKES
                     WHERE likingUserId = ? AND eventId = ?`
  eventIdValues = [eventId]
  addLikeValues = [userId, eventId]
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    removeLikeResult = await db.query(transaction, removeLikeQuery, addLikeValues, keepConnection)
    if (removeLikeResult.results.affectedRows == 0) {
      throw new Error("Can't unlike post because user didn't originally have it liked")
    }
    deleteResult = await db.query(transaction, decrementLikesQuery, eventIdValues, keepConnection)
    result = await db.query(transaction, readNumLikesQuery, eventIdValues, keepConnection)
    likeCount = result.results[0].likeCount
    await global.streamClient.activityPartialUpdate({
      foreignID: 'Event:' + eventId.toString(),
      time: getStreamTime,
      set: {
        likeCount: likeCount
      }
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
