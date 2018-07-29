let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let UserProfileSchema = new Schema({
    uid: { type: String, required: [true, 'Each user must have a uid'] },
    username: { type: String, required: [true, 'Each user must have a username'] },
    photoUrl: { type: String, default: null }
}, {
    timestamps: true,  // adds createdAt and updatedAt fields
    minimize: false
});
UserProfileSchema.index({ user: 1, type: 1});
module.exports = mongoose.model('UserProfile', UserProfileSchema);
