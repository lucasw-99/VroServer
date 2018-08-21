const Follow = require('../models/user.model')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../config/jwt')

/* GET get all followers for user */
exports.userFollowersGet = function(req, res) {
  userId = req.params.userId
  Follow.getUserFollowers(userId, (err, followers) => {
    console.log('userId: ' + userId + ' followers: ' + followers)
    if (err) {
      res.json({success: false, msg: 'Failed to retrieve followers for user ' + userId})
    } else {
      res.json({success: true, followers: followers})
    }
  })
}

/* POST add follower to users following list */
exports.addFollower = function(req, res) {
  userId = req.params.userId
  newFollowerId = req.params.newFollowerId
  Follow.addFollower(userId, newFollowerId, (err) => {
    if (err) {
      res.json({success: false, msg: 'Failed to retrieve followers for user ' + userId})
    } else {
      res.json({success: true, msg: 'Added ' + newFollowerId + ' to ' + userId + ' followers'})
    }
  })
}

/* DELETE remove follower from users following list */
exports.removeFollower = function(req, res) {
  userId = req.params.userId
  newFollowerId = req.params.newFollowerId
  Follow.removeFollower(userId, newFollowerId, (err, result) => {
    console.log('removeResult:', result)
    if (err) {
      res.json({success: false, msg: 'Failed to retrieve followers for user ' + userId})
    } else if (result['nModified'] === 0) {
      res.json({ success: false, msg: newFollowerId + ' is not following ' + userId })
    } else {
      res.json({success: true, msg: 'Added ' + newFollowerId + ' to ' + userId + ' followers'})
    }
  })
}
