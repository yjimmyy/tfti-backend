var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
   name: String,
   fbUID: String,
});

module.exports = mongoose.model('User', UserSchema)