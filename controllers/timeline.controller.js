const jwt = require('jsonwebtoken')
const config = require('../config/jwt')
const Event = require('../models/event.model')
const User = require('../models/user.model')


/* GET gets a users timeline */
exports.getTimeline = async function(req, res) {
  userId = req.user.id
  let userTimeline = global.streamClient.feed('timeline', userId.toString())
  try {
    timelineData = await userTimeline.get({ limit: 10 })
    // TODO (Lucas Wotton): Make these calls happen together asynchronously
    var parsedTimelineData = await Promise.all(timelineData.results.map(parseEventData))
    console.log('done!')
    console.log(parsedTimelineData)
    res.json({ success: true, timeline: parsedTimelineData, next: timelineData.next })
  } catch (err) {
    console.log('err:', err)
    res.json({ success: false, err: err.message })
  }
}

async function parseEventData(getStreamEvent) {
  // TODO (Lucas Wotton): Use cache so you don't perform query for every one of these
  let hostId = parseInt(getStreamEvent.actor.split(':')[1])
  var hostData = null
  try {
    result = await User.getUserById(hostId)
    hostData = {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      photoUrl: result.user.photoUrl
    }
  } catch (err) {
    throw err
  }
  return {
    host: hostData,
    eventId: parseInt(getStreamEvent.foreign_id.split(':')[1]),
    address: getStreamEvent.address,
    description: getStreamEvent.description,
    time: getStreamEvent.time,
    eventImageUrl: getStreamEvent.eventImageUrl,
    geoloc: getStreamEvent.geoloc,
    likeCount: getStreamEvent.likeCount,
    attendingCount: getStreamEvent.attendingCount
  }
}
