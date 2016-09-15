const mongoose = require('mongoose');

// schema definition
let instrument = mongoose.Schema({
  id: int,
  instrument: String
});

module.exports = mongoose.model('Instrument', instrument);