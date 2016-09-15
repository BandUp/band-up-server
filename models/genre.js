const mongoose = require('mongoose');

// schema definition
let genre = mongoose.Schema({
  id: Integer,
  name: String
});

module.exports = mongoose.model('Genre', genre);