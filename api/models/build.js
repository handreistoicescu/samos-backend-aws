const mongoose = require('mongoose');

const buildSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: { type: Date, required: true },
  name: { type: String, required: true },
  published: { type: Boolean, required: true }
});

module.exports = mongoose.model('Build', buildSchema);
