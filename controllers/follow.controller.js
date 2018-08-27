const Follow = require('../models/follow.model')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')

/* GET get all followerIds for user */
exports.userFollowersGet = async function(req, res) {
  let userId = req.user.id
  try {
    followerIds = await Follow.getUserFollowerIds(userId)
    res.json({ success: true, followerIds: followerIds })
  } catch (err) {
    console.log('do something with this err:', err)
    res.json({ success: false, msg: err })
  }
}

/* PUT add follower to users following list */
exports.addFollower = async function(req, res) {
  let userId = req.user.id
  newFollowerId = req.params.newFollowerId
  try {
    result = await Follow.addFollower(userId, newFollowerId)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, msg: err })
  }
}

/* DELETE remove follower from users following list */
exports.removeFollower = async function(req, res) {
  let userId = req.user.id
  removeFollowerId = req.params.removeFollowerId
  try {
    result = await Follow.removeFollower(userId, removeFollowerId)
    res.json({ success: true })
  } catch (err) {
    console.log('err:', err)
    res.json({ success: false, msg: err })
  }
}
