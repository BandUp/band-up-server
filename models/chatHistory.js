const mongoose = require('mongoose');

// schema definition
let chatSchema = mongoose.Schema({
  users: [String],
  chatHistory: {
  	message: String,
  	timestamp: {type:Date, default:Date.now, required:true}
  }
},{ collection: 'chat' });

module.exports = mongoose.model('Chat', chatSchema);