var mongoose = require('mongoose');

var SpotSchema = new mongoose.Schema({
   name: {type: String, default: "My Spot"},
   lat: Number,
   lng: Number,
   radius: {type: Number, default: 20},
   members: [{
      user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      atSpot: {type: Boolean, default: false}
   }]
});

module.exports = mongoose.model('Spot', SpotSchema)