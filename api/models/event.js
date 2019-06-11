const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: { type: Date, required: true },
  link: { type: String, required: true },
  name: { type: String, required: true },
  published: { type: Boolean, required: true },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventType',
    required: true
  },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true }
});

module.exports = mongoose.model('Event', eventSchema);
