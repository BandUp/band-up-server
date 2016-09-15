const mongoose = require('mongoose');

// schema definition
let genre = mongoose.Schema({
  id: int,
  name: String
});

module.exports = mongoose.model('Genre', genre);