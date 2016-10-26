const mongoose = require('mongoose');

// schema definition
let instrument = mongoose.Schema({
	order: Number,
	name: String
});

module.exports = mongoose.model('Instrument', instrument);