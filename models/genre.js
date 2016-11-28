const mongoose = require('mongoose');

// schema definition
let genre = mongoose.Schema({
	order: Number,
	name: String
});

module.exports = mongoose.model('Genre', genre);
