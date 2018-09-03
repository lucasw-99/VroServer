const Event = require('../models/event.model');
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')


/* POST request, posts a new event */
exports.postEvent = async function(req, res) {
  host = req.user
  description = req.body.description
  address = req.body.address
  geoloc = { lat: req.body.lat, lng: req.body.lng }
  eventImageUrl = req.body.eventImageUrl
  eventTime = req.body.eventTime
  const newEvent = new Event.Event(host, description, address, geoloc, eventImageUrl, eventTime, new Date().toISOString())
  try {
    result = await Event.postEvent(newEvent)
    res.json({ success: true, eventId: result.eventId })
  } catch (err) {
    console.log('err with posting event')
    console.log(err)
    res.json({ success: false })
  }
}

exports.deleteEvent = async function(req, res) {
  host = req.user
  eventId = req.params.eventId
  try {
    await Event.deleteEvent(host.id, eventId)
    res.json({ success: true })
  } catch (err) {
    console.log('err with deleting event')
    console.log(err)
    res.json({ success: false })
  }
}
