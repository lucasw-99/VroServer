let mongoose = require('mongoose');
const bcrypt = require('bcrypt')
let Schema = mongoose.Schema;
let UserSchema = new Schema({
    name: { type: String, required: [true, 'Each user must have a name'] },
    email: { type: String, required: [true, 'Each user must have an email'] },
    username: { type: String, required: [true, 'Each user must have a username'] },
    password: {type: String, required: [true, 'Each user needs a password']}
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

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback)
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
