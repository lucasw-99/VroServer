let mongoose = require('mongoose');
var bcrypt = require('bcryptjs')
let Schema = mongoose.Schema;
let UserSchema = new Schema({
    email: { type: String, index: {unique: true}, required: [true, 'Each user must have an email'] },
    username: { type: String, index: {unique: true}, required: [true, 'Each user must have a username'] },
    password: {type: String, required: [true, 'Each user needs a password'] },
    photoUrl: {type: String},
    followerIds: { type: Array, "default": [], index: { unique: true }},
    followingIds: { type: Array, "default": [], index: { unique: true }}
}, {
    timestamps: true,  // adds createdAt and updatedAt fields
    minimize: false
});

// TODO (Lucas Wotton): Unused?
// Virtual for author's URL
UserSchema
.virtual('url')
.get(function () {
  return '/users/' + this._id;
});

const User = module.exports = mongoose.model('User', UserSchema)

module.exports.getUserById = function(userId, callback) {
  User.findById(userId, callback)
}

module.exports.getUserByUsername = function(username, callback) {
  const query = { username: username }
  User.findOne(query, callback)
}

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        throw err
      }
      newUser.password = hash
      newUser.save(callback)
    })
  })
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) {
      throw err
    }

    callback(null, isMatch)
  })
}

module.exports.getUserFollowers = function(userId, callback) {
  User.findById(userId, callback)
}

module.exports.addFollower = async function(userId, newFollowerId, callback) {
  const session = await mongoose.startSession()
  session.startTransaction()
  console.log('session transaction started')
  try {
    const opts = { session, new: true }
    let firstUpdate = await User.update(
      { _id: userId },
      { $push: { followerIds: newFollowerId }},
      { session })
    console.log(firstUpdate)

    if (firstUpdate.ok) {
      console.log('first update ok')
      try {
        let secondUpdate = await User.update(
          { _id: newFollowerId },
          { $push: { followingIds: userId }},
          { session })
        if (!secondUpdate.ok) {
          throw new Error("Could not follow user due to error")
        }
        console.log('second update ok')

        await session.commitTransaction()
        session.endSession()
        callback(null)
      } catch (error) {
        await session.abortTransaction()
        session.endSession()
        callback(error)
      }
      return
    }
  } catch (error) {
      console.log(error)
      console.log('First transaction failed :(')
      await session.abortTransaction()
      session.endSession()
      callback(error)
  }
}

module.exports.removeFollower = function(userId, removeFollowerId, callback) {
  // TODO (Lucas Wotton): Make this atomic
  User.update(
    { _id: userId },
    { $pull: { followerIds: removeFollowerId }})
  User.update(
    { _id: removeFollowerId},
    { $pull: { followingIds: userId }},
    callback)
}
