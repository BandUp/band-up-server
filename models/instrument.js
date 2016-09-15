const mongoose = require('mongoose');

// schema definition
let instrument = mongoose.Schema({
  id: int,
  name: String
});

module.exports = mongoose.model('Instrument', instrument);