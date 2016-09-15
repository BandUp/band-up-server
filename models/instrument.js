const mongoose = require('mongoose');

// schema definition
let instrument = mongoose.Schema({
  order: String,
  name: String
});

module.exports = mongoose.model('Instrument', instrument);