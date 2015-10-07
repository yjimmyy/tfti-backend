var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Spot = require('../models/spotSchema'); // spotSchema
var User = require('../models/userSchema');
var shortId = require('short-mongo-id'); // to generate shorter id

router.use(function(req, res, next) {
   console.log('spot req received');
   next();
});

// Check if user exists and use user's objectid to limit access to spots
router.use(function(req, res, next) {
   console.log(req.body.userFbId);
   var condition = {
      fbUID: req.body.userFbId
   }
   User.findOne(condition, function(err, obj) {
      if (err) {
         res.send(err);
      } else if (!obj) {
         res.status(400).send("user not found");
      } else {
         req.body.userObjectId = obj._id; // used to limit access
         next();
      }
   });
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
      spot.members = [{
         user_id: mongoose.Types.ObjectId(req.body.userObjectId)
      }];

      spot.save(function(err, product, numberAffected) {
         if (err) {
            res.send(err);
         } else {
            console.log(product);
            var conditions = {
               _id: product._id
            };
            var update = {
               shortId: shortId(product._id)
            };
            Spot.update(conditions, update, function(err, spot) {
               console.log(shortId(product._id));
               res.json({
                  "success": true,
                  "objectId": shortId(product._id)
               });
            });
         }
      });

   })

   // Gets spots the user is member of
   .get(function(req, res) {
      // Allows user to only see spots they are members of
      var condition = {
         'members.user_id': {$eq: req.body.userObjectId}
      }
      Spot.find(condition, function(err, spots) {
         if (err) {
            res.send(err);
         }
         res.json(spots);
      }).populate('members.user_id');
   });


// Access specific Spot
router.route('/:spotId')

   .get(function(req, res) {
      var condition = {
         shortId: req.params.spotId
      }
      Spot.findOne(condition, function(err, spot) {
         if (err) {
            res.status(400).send(err);
         }
         res.json(spot);
      });
   })

   .put(function(req, res) {
      var condition = {
         shortId: req.params.spotId
      }
      Spot.findOne(condition, function(err, spot) {
         if (err) {
            res.send(err);
         }
         spot.name = req.body.name;
         spot.save(function(err) {
            if (err) {
               res.send(err);
            }
            res.send('updated');
         });
      });
   })

   .delete(function(req, res) {
      Spot.remove({
         shortId: req.params.spotId
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
      User.find({_id: req.body.user_id}, function(err, spot) {
         console.log(req.body.userObjectId);
         if (err) {
            res.send("error");
            return;
         } else if (!spot.length) {
            res.sendStatus(404);
            return;
         }
         var condition = {
            //_id: req.params.spotId,
            'shortId': req.params.shortId,
            'members.user_id': {$ne: req.body.userObjectId}
         };
         var update = {
            $push: {
               'members': {
                  // Reference the User objectId
                  'user_id': mongoose.Types.ObjectId(req.body.userObjectId)
               }
            }
         };
         Spot.findOneAndUpdate(condition, update, {safe: true}, function(err, spot) {
            if (err) {
               console.log('a');
               res.status(400).send(err);
            } else if (!spot) {
               console.log('b');
               res.sendStatus(404); // error if spot not found or user is already a member
            } else {
               console.log('c');
               res.status(200).json({
                  "success": true
               });
            }
         });
      }).limit(1);
   })

   // Gets all members of the group
   .get(function(req, res) {
      console.log('aaaa');
      var condition = {
         shortId: req.params.spotId
      };
      Spot.findOne(condition, function(err, spot) {
         if (err) {
            res.status(400).send(err);
         } else if (!spot) {
            res.sendStatus(404);
         } else {
            res.json(spot.members);
         }
      }).populate('members.user_id');
   })

   .delete(function(req, res) {
      var condition = {
         'shortId': req.params.spotId
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


router.route('/:spotId/member/:userId')
   // Ping from user indicating they are at Spot
   .get(function(req, res) {
      var condition = {
         _id: req.params.spotId,
         'members.user_id': {$eq: req.params.userId}
      };
      var update = {
         $set: {
            'members.$.lastPing': Date.now()
         }
      };
      Spot.update(condition, update, function(err, spot) {
         if (err) {
            res.send(err);
         } else if (!spot.nModified) {
            res.sendStatus(404);
         } else {
            console.log(spot.nModified);
            res.status(200).json({
               "success": true,
               "message": "User checked in"
            });
         }
      });
   });


// Return router
module.exports = router;