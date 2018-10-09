const db = require('./db')
const sqlerrors = require('../errors/sql-errors')


module.exports.getUserEventsAttending = async function(userId) {
  getUserEventsAttendingQuery = `SELECT eventId FROM ATTENDING
                                 WHERE attendingId = ?`
  values = [userId]
  try {
    connection = await db.getConnection()
    output = await db.query(connection, getUserEventsAttendingQuery, values)
    results = output.results
    err = output.err
    return results
  } catch (err) {
    throw err
  }
}

module.exports.attendEvent = async function(userId, eventId, getStreamTime, hostId) {
  incrementAttendingQuery = `UPDATE EVENTS
                             SET attendingCount = attendingCount + 1
                             WHERE id = ?`
  readNumAttendingQuery = `SELECT attendingCount FROM EVENTS
                           WHERE id = ?`
  addAttendeeQuery = `INSERT INTO ATTENDING
                      VALUES (?, ?)`
  eventIdValues = [eventId]
  addAttendeeValues = [userId, eventId]
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    keepConnection = true
    await db.query(transaction, incrementAttendingQuery, eventIdValues, keepConnection)
    result = await db.query(transaction, readNumAttendingQuery, eventIdValues, keepConnection)
    attendingCount = result.results[0].attendingCount
    await db.query(transaction, addAttendeeQuery, addAttendeeValues)
    await global.streamClient.activityPartialUpdate({
      foreignID: 'Event:' + eventId.toString(),
      time: getStreamTime,
      set: {
        attendingCount: attendingCount
      }
    })
    var notificationFeed = global.streamClient.feed('notification', hostId.toString())
    // TODO (Lucas Wotton): How to rollback?
    await notificationFeed.addActivity({ 
      actor: userId.toString(),
      verb: 'attending',
      object: eventId.toString(),
      foreign_id: 'attending:' + userId.toString() + ':' + eventId.toString(),
      time: getStreamTime
    })
    await db.commitTransaction(transaction)
  } catch (err) {
    console.log(err.message)
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}

module.exports.unattendEvent = async function(userId, eventId, getStreamTime, hostId) {
  decrementAttendingQuery = `UPDATE EVENTS
                             SET attendingCount = attendingCount - 1
                             WHERE id = ?`
  readNumAttendingQuery = `SELECT attendingCount FROM EVENTS
                           WHERE id = ?`
  removeAttendeeQuery = `DELETE FROM ATTENDING
                         WHERE attendingId = ? AND eventId = ?`
  eventIdValues = [eventId]
  removeAttendeeValues = [userId, eventId]
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    // TODO (Lucas Wotton): Ensure that the user is already attending the event
    keepConnection = true
    await db.query(transaction, decrementAttendingQuery, eventIdValues, keepConnection)
    result = await db.query(transaction, readNumAttendingQuery, eventIdValues, keepConnection)
    attendingCount = result.results[0].attendingCount
    console.log('attendingCount:', attendingCount)
    await db.query(transaction, removeAttendeeQuery, removeAttendeeValues)
    await global.streamClient.activityPartialUpdate({
      foreignID: 'Event:' + eventId.toString(),
      time: getStreamTime,
      set: {
        attendingCount: attendingCount
      }
    })
    var notificationFeed = global.streamClient.feed('notification', hostId.toString())
    await notificationFeed.removeActivity({
      foreignId: 'attending:' + userId.toString() + ':' + eventId.toString()
    })
    await db.commitTransaction(transaction)
  } catch (err) {
    console.log(err.message)
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}
