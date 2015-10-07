var mongoose = require('mongoose');

var SpotSchema = new mongoose.Schema({
   shortId: String,
   name: {type: String, default: "My Spot"},
   lat: Number,
   lng: Number,
   radius: {type: Number, default: 20},
   members: [{
      user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      lastPing: {type: Date, default: function() {return +new Date() - 1000 * 60 * 10}}
      //atSpot: {type: Boolean, default: false}
   }]
});

module.exports = mongoose.model('Spot', SpotSchema)