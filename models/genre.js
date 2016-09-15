const mongoose = require('mongoose');

// schema definition
let genre = mongoose.Schema({
  order: String,
  name: String
});

module.exports = mongoose.model('Genre', genre);