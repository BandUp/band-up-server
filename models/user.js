// load things we need
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// schema definition
let userSchema = mongoose.Schema({
  local: {
    username: String,
    email: String,
    password: String,
    age: Number
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    email: String
  },
  instruments: {
    id: String,
    instrument: String
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
