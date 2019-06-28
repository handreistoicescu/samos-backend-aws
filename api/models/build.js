const mongoose = require('mongoose');

const buildSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  netlifyBuildId: { type: String, required: true },
  createdAt: { type: Date, required: true },
  payload: { type: String, required: true },
  status: { type: String, required: true }
});

module.exports = mongoose.model('Build', buildSchema);
