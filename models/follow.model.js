let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let FollowSchema = new Schema({
    followerIds: { type: Array, "default": [], index: {unique: true}}
}, {
    timestamps: true,  // adds createdAt and updatedAt fields
    minimize: false
});

const Follow = module.exports = mongoose.model('Follow', FollowSchema)

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
