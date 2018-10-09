const Like = require('../models/like.model')
const Event = require('../models/event.model')

/* GET get all likes for user */
exports.getUserLikes = async function(req, res) {
  let userId = req.user.id
  try {
    eventIds = await Like.getUserLikes(userId)
    res.json({ success: true, eventIds: eventIds })
  } catch (err) {
    console.log('err with getting user likes:', err)
    res.json({ success: false, msg: err })
  }
}

/* PUT like post for userId */
exports.likePost = async function(req, res) {
  let userId = req.user.id
  let eventId = req.params.eventId
  try {
    result = await Event.getEvent(eventId)
    if (!result.success) {
      throw new Error("Event does not exist")
    }
    postedEvent = result.event
    removeTimezoneStreamTime = postedEvent.getStreamTime.replace('Z', '000')
    result = await Like.likePost(userId, eventId, removeTimezoneStreamTime, postedEvent.hostId)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, msg: err.message })
  }
}

/* DELETE remove follower from users following list */
exports.unlikePost = async function(req, res) {
  let userId = req.user.id
  let eventId = req.params.eventId
  try {
    result = await Event.getEvent(eventId)
    if (!result.success) {
      throw new Error("Event does not exist")
    }
    postedEvent = result.event
    removeTimezoneStreamTime = postedEvent.getStreamTime.replace('Z', '000')
    result = await Like.unlikePost(userId, eventId, removeTimezoneStreamTime, postedEvent.hostId)
    res.json({ success: true })
  } catch (err) {
    console.log('in unlike post catch block')
    console.log(err)
    res.json({ success: false, msg: err.message })
  }
}
