const db = require('./db')
const sqlerrors = require('../errors/sql-errors')

module.exports.Event = function Event(host, description, address, geoloc, eventImageUrl, eventTime, getStreamTime, attendingCount=0, likeCount=0, timestamp=null, id=null) {
  this.host = host
  this.description = description
  this.address = address
  this.geoloc = geoloc
  this.eventImageUrl = eventImageUrl
  this.eventTime = eventTime
  this.getStreamTime = getStreamTime
  this.attendingCount = attendingCount
  this.likeCount = likeCount
  this.timestamp = timestamp  
  this.id = id
}

module.exports.getEvent = async function(eventId) {
  findEventQuery = `SELECT * FROM EVENTS
                    WHERE id = ?`
  values = [eventId]
  try {
    connection = await db.getConnection()
    result = await db.query(connection, findEventQuery, values)
    foundEvent = result.results[0]
    if (foundEvent) {
      return { success: true, event: foundEvent }
    } else {
      throw new Error("Event not found")
    }
  } catch (err) {
    throw err
  }
}

module.exports.postEvent = async function(newEvent) {
  insertEventQuery = `INSERT INTO EVENTS(hostId, description, address, latitude, longitude, eventImageUrl, getStreamTime)
                      VALUES (?)`
  // TODO (Lucas Wotton): Put in eventTime here
  values = [[newEvent.host.id, newEvent.description, newEvent.address, 
             newEvent.geoloc.lat, newEvent.geoloc.lng, newEvent.eventImageUrl, newEvent.getStreamTime]]
  
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    result = await db.query(transaction, insertEventQuery, values)
    var postAuthor = global.streamClient.feed('user', newEvent.host.id.toString())
    streamResult = await postAuthor.addActivity({
      actor: 'User:' + newEvent.host.id.toString(),
      verb: 'Event',
      object: 'Event:' + result.results.insertId,
      description: newEvent.description,
      address: newEvent.address,
      geoloc: newEvent.geoloc,
      eventImageUrl: newEvent.eventImageUrl,
      foreign_id: 'Event:' + result.results.insertId,
      time: newEvent.getStreamTime,
      likeCount: newEvent.likeCount,
      attendingCount: newEvent.attendingCount
    })
    await db.commitTransaction(transaction)
    return { success: true, eventId: result.results.insertId }
  } catch (err) {
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}

module.exports.deleteEvent = async function(authorId, eventId) {
  deleteEventQuery = `DELETE FROM EVENTS
                      WHERE EVENTS.id = ?`
  values = [eventId]
  calledGetStream = false
  transaction = null
  try {
    connection = await db.getConnection()
    transaction = await db.createTransaction(connection)
    result = await db.query(transaction, deleteEventQuery, values)
    var postAuthor = global.streamClient.feed('user', authorId.toString())
    await postAuthor.removeActivity({
      foreignId: 'Event:' + eventId.toString()
    })
    await db.commitTransaction(transaction)
    return { success: true, eventId: result.results.insertId }
  } catch (err) {
    // TODO (Lucas Wotton): Better error checking. Just because error is called from get stream
    // doesn't mean event won't exist on getstream.
    if (transaction) {
      await db.rollbackTransaction(transaction)
    }
    throw err
  }
}

module.exports.getUserEvents = async function(host) {
  getUserEventsQuery = `SELECT * FROM EVENTS AS e
                        WHERE e.hostId = ?`  
  values = [host.id]
  try {
    connection = await db.getConnection()
    result = await db.query(connection, getUserEventsQuery, values)
    return { success: true, events: result.results }
  } catch (err) {
    return { success: false, err: err }
  }
}
