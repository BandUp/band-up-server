// load things we need
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Instrument = require('./instrument');
const Genres = require('./genre');

// schema definition
let userSchema = mongoose.Schema({
	username: {
		type: String,
		default: ""
	},
	email: {
		type: String,
		default: ""
	},
	age: {
		type: Number,
		default: 0
	},
	local: {
		password: String,
		age: Number
	},
	facebook: {
		id: String,
		token: String
	},
	google: {
		id: String
	},
	soundcloud: {
		id: String,
		token: String
	},
	aboutme: {
		type: String,
		default: ""
	},
	searchradius: {
		type: Number,
		default: 5
	},
	instruments: [String],
	genres: [String],
	hasFinishedSetup: {
		type: Boolean,
		default: false
	},
	location: {
		lat: Number,
		lon: Number,
		valid: Boolean
	},
	liked: {
		type: [String],
		default: []
	},
	matched: {
		type: [String],
		default: []
	},
	image: {
		url: String,
		public_id: String
	},
	gcmToken: {
		type: String,
		default: ""
	}
}, {
	toObject: {
		transform: function(doc, ret) {
			delete ret.facebook;
			delete ret.google;
			delete ret.soundcloud;
			delete ret.local;
		}
	},
	toJSON: {
		transform: function(doc, ret) {
			delete ret.facebook;
			delete ret.google;
			delete ret.soundcloud;
			delete ret.local;
			// fetch instr list
			Instrument.find({'_id': { $in: ret.instruments }}, (err, doc) => {
				ret.instruments = doc;
			});

			Genres.find({'_id': { $in: ret.genres}}, (err, doc) => {
				ret.genres = doc;
			});
		}
	}
});

// methoods
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
