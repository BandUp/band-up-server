const mongoose = require('mongoose');

// schema definition
let instrument = mongoose.Schema({
  id: Integer,
  name: String
});

module.exports = mongoose.model('Instrument', instrument);