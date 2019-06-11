const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  link: { type: String, required: true }
});

module.exports = mongoose.model('Venue', venueSchema);
