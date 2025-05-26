const mongoose = require('mongoose');

const imgObjectSchema = new mongoose.Schema({
  imgName: {
    type: String,
    required: true
  },
  pHash: {
    type: String,
    required: true
  },
  id_object: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Object',
    required: true
  }
});

module.exports = mongoose.model('ImgObject', imgObjectSchema);

