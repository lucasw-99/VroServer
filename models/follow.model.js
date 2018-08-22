const db = require('./db')
const sqlerrors = require('../errors/sql-errors')


module.exports.getUserFollowers = function(userId, callback) {
  const query = { userId: userId }
  Follow.findOne(query, callback)
}

module.exports.addFollower = function(userId, newFollowerId, callback) {
  Follow.update(
    { _id: userId },
    { $push: { followerIds: newFollowerId } },
    callback)
}

module.exports.removeFollower = function(userId, removeFollowerId, callback) {
  Follow.update(
    { _id: userId },
    { $pull: { followerIds: newFollowerId } },
    callback)
}
