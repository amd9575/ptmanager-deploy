const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  object_type: String,
  description: String,
  address: String,
  city: String,
  zipCode: String,
  country: String,
  dateObject: String,
  timeObject: String,
  createDate: {
    type: Date,
    default: Date.now
  },
  isActif: Boolean,
  isLost: Boolean,
  isFound: Boolean,
  latitude: Number,
  longitude: Number
});

module.exports = mongoose.model('Object', objectSchema);

