const Attending = require('../models/attending.model')
const Event = require('../models/event.model')

/* GET get all events a user is attending */
exports.getUserEventsAttending = async function(req, res) {
  let userId = req.user.id
  try {
    eventIds = await Attending.getUserEventsAttending(userId)
    res.json({ success: true, eventIds: eventIds })
  } catch (err) {
    console.log('err with getting events user is attending:', err)
    res.json({ success: false, msg: err })
  }
}

/* PUT add attendee to events attending list */
exports.attendEvent = async function(req, res) {
  let userId = req.user.id
  let eventId = req.params.eventId
  try {
    result = await Event.getEvent(eventId)
    if (!result.success) {
      throw new Error("Event does not exist")
    }
    postedEvent = result.event
    removeTimezoneStreamTime = postedEvent.getStreamTime.replace('Z', '000')
    await Attending.attendEvent(userId, eventId, removeTimezoneStreamTime, postedEvent.hostId)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, msg: err.message })
  }
}

/* DELETE remove attendee from events attending list */
exports.unattendEvent = async function(req, res) {
  let userId = req.user.id
  let eventId = req.params.eventId
  try {
    result = await Event.getEvent(eventId)
    if (!result.success) {
      throw new Error("Event does not exist")
    }
    postedEvent = result.event
    removeTimezoneStreamTime = postedEvent.getStreamTime.replace('Z', '000')
    await Attending.unattendEvent(userId, eventId, removeTimezoneStreamTime, postedEvent.hostId)
    res.json({ success: true })
  } catch (err) {
    console.log('in unnattend event catch block')
    console.log(err)
    res.json({ success: false, msg: err.message })
  }
}
