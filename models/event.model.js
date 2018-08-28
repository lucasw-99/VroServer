const db = require('./db')
const sqlerrors = require('../errors/sql-errors')

module.exports.Event = function Event(host, description, address, geoloc, eventImageUrl, eventTime, attendeeCount=0, likeCount=0, timestamp=new Date().getTime(), id=null) {
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

module.exports.postEvent = function(newEvent) {
  console.log('called postEvent with ')
  console.log(newEvent)
}
