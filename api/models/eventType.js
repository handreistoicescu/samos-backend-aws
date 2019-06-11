const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true }
});

module.exports = mongoose.model('EventType', eventTypeSchema);
