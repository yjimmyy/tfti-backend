var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Spot = require('../models/spotSchema'); // spotSchema

router.use(function(req, res, next) {
   console.log('spot req received');
   next();
});


// Access all Spots
// TODO: probably remove
router.route('/')

   .post(function(req, res) {
      var spot = new Spot();
      spot.name = req.body.name;
      spot.lat = req.body.lat;
      spot.lng = req.body.lng;
      spot.radius = req.body.radius;
      spot.members = req.body.members;

      spot.save(function(err) {
         if (err) {
            res.send(err);
         }
         res.send('spot added');
      });

   })

   .get(function(req, res) {
      Spot.find(function(err, spots) {
         if (err) {
            res.send(err);
         }
         res.json(spots);
      }).populate('members.user_id');
   });


// Access specific Spot
router.route('/:spotId')
   .get(function(req, res) {
      Spot.findById(req.params.spotId, function(err, spot) {
         if (err) {
            res.send(err);
         }
         res.json(spot);
      });
   })

   .put(function(req, res) {
      Spot.findById(req.params.spotId, function(err, spot) {
         if (err) {
            res.send(err);
         }
         spot.name = req.body.name;
         spot.save(function(err) {
            if (err) {
               res.send(err);
            }
            res.send('added');
         });
      });
   })

   .delete(function(req, res) {
      Spot.remove({
         _id: req.params.spotId
      }, function(err, bear) {
         if (err) {
            res.send(err);
         }
         res.send('deleted');
      });
   });


// Access a Spot's member array
router.route('/:spotId/member')

   // Adds a user as a member of the group if not already a member
   .post(function(req, res) {
      var condition = {
         _id: req.params.spotId,
         'members.user_id': {$ne: req.body.user_id}
      };
      var update = {
         $push: {
            'members': {
               // Reference the User objectId
               'user_id': mongoose.Types.ObjectId(req.body.user_id),
               'atSpot': req.body.atSpot
            }
         }
      };
      Spot.findOneAndUpdate(condition, update, {safe: true}, function(err, spot) {
         if (err) {
            res.send(err);
         } else if (!spot) {
            res.sendStatus(404); // error if spot not found or user is already a member
         } else {
            res.status(200).send('member added');
         }
      });
   })

   // Gets all members of the group
   .get(function(req, res) {
      Spot.findById(req.params.spotId, function(err, spot) {
         if (err) {
            res.send(err);
         } else if (!spot) {
            res.sendStatus(404);
         } else {
            res.json(spot.members);
         }
      }).populate('members.user_id');
   })

   // Update if a member is at location
   .put(function(req, res) {
      var condition = {
         _id: req.params.spotId,
         'members.user_id': {$eq: req.body.user_id}
      };
      var update = {
         $set: {
            'members.$.atSpot': req.body.atSpot
         }
      };
      Spot.update(condition, update, function(err, spot) {
         if (err) {
            res.send(err);
         } else if (!spot.nModified) {
            res.sendStatus(404);
         } else {
            console.log(spot.nModified);
            res.status(200).send('member updated');
         }
      });
   })

   .delete(function(req, res) {
      var condition = {
         _id: req.params.spotId
      };
      var update = {
         $pull: {
            'members': {
               'user_id': mongoose.Types.ObjectId(req.body.user_id)
            }
         }
      };
      Spot.findOneAndUpdate(condition, update, function(err, spot) {
         if (err) {
            res.send(err);
         } else if (!spot) {
            res.sendStatus(404);
         } else {
            console.log(spot);
            res.status(200).send('member deleted');
         }
      });
   });


// Return router
module.exports = router;