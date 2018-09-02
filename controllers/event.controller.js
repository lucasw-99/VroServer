const Event = require('../models/event.model');
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')


/* POST request, posts a new event */
exports.post_event = async function(req, res) {
  host = req.user
  description = req.body.description
  address = req.body.address
  geoloc = { lat: req.body.lat, lng: req.body.lng }
  eventImageUrl = req.body.eventImageUrl
  eventTime = req.body.eventTime
  const newEvent = new Event.Event(host, description, address, geoloc, eventImageUrl, eventTime)
  result = await Event.postEvent(newEvent)
  if (result.success) {
    res.json({ success: true })
  } else {
    // TODO (Lucas Wotton): Give user error message?
    res.json({ success: false })
  }
}
