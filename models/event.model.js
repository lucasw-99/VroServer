const db = require('./db')
const sqlerrors = require('../errors/sql-errors')

module.exports.Event = function Event(host, description, address, geoloc, eventImageUrl, eventTime, attendeeCount=0, likeCount=0, timestamp=null, id=null) {
  this.host = host
  this.description = description
  this.address = address
  this.geoloc = geoloc
  this.eventImageUrl = eventImageUrl
  this.eventTime = eventTime
  this.attendeeCount = attendeeCount
  this.likeCount = likeCount
  this.timestamp = timestamp  
  this.id = id
}

module.exports.postEvent = async function(newEvent) {
  insertEventQuery = `INSERT INTO EVENTS(hostId, description, address, latitude, longitude, eventImageUrl)
                      VALUES (?)`
  values = [[newEvent.host.id, newEvent.description, newEvent.address, 
             newEvent.geoloc.lat, newEvent.geoloc.lng, newEvent.eventImageUrl]]
  
  try {
    connection = await db.getConnection()
    result = await db.query(connection, insertEventQuery, values)
    return { success: true, eventId: result.results.insertId }
  } catch (err) {
    return { success: false, err: err }
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
