const mongoose = require('mongoose');

const bannerModel = new mongoose.Schema({

  image: {
    type: Array,
    required: true
  },
  bannerHead: {
    type: String,
    required: true,
  },
  bannerText: {
    type: String,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Banner', bannerModel);