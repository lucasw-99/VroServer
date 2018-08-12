let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let EventSchema = new Schema({
    eventPostId: { type: String, required: [true, 'Each event must have an id'] },
    caption: { type: String, default: null },
    eventPhotoUrl: { type: String, default: null }
}, {
    timestamps: true,  // adds createdAt and updatedAt fields
    minimize: false
});
