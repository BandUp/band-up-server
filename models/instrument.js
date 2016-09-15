const mongoose = require('mongoose');

// schema definition
let instrument = mongoose.Schema({
  id: String,
  name: String
});

module.exports = mongoose.model('Instrument', instrument);