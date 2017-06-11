// load things we need
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const instrument = require('./instrument');
const genres = require('./genre');

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
    dateOfBirth: {
        type: Date
    },
    local: {
        password: String
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
    favoriteinstrument: {
        type: String,
        default: ""
    },
    searchradius: {
        type: Number,
        default: 20
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
    },
    soundCloudId: {
        type: Number,
        default: 0
    },
    soundcloudURL: {
        type: String,
        default: ""
    },
    soundCloudSongName: {
    	type: String,
    	default: ""
    },
	resetToken: {
		type: String,
		default: ""
	},
    validToken: {
        type: String,
        default: ""
    }
}, {
	toObject: {
		transform: function(doc, ret) {
			delete ret.facebook;
			delete ret.google;
			delete ret.soundcloud;
		}
	},
	toJSON: {
		transform: function(doc, ret) {
			delete ret.facebook;
			delete ret.google;
			delete ret.soundcloud;
			delete ret.local;
		}
	}
});

// methoods
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    if (!this.local) {
        return false;
    }
    
    if (!this.local.password) {
        return false;
    }
    
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
