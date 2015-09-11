var express = require('express');
var router = express.Router();
var User = require('../models/userSchema'); // userSchema

router.use(function(req, res, next) {
   console.log('user req received');
   next();
});

router.route('/')

   // Register a new User or look up a user's _id using their Facebook ID
   .post(function(req, res) {
      console.log(req.body.name);
      // Search for matching Facebook user id
      var condition = {
         fbUID: req.body.fbUID
      };
      // Create if not already exist
      var update = {
         $set: {
            name: req.body.name
         },
         $setOnInsert: {
            fbUID: req.body.fbUID
         }
      };
      User.findOneAndUpdate(condition, update, {new: true, upsert: true, select: '_id'}, function(err, user) {
         if (err) {
            res.setStatus(400).send(err);
         } else if (!user) {
            res.setStatus(400).send('Something went wrong');
         } else { // Send back object id
            res.send(user);
         }
      });
   })

   // TODO: probably remove
   .get(function(req, res) {
      User.find(function(err, users) {
         if (err) {
            res.send(err);
         }
         res.json(users);
      });
   });


router.route('/:userId')
   .get(function(req, res) {
      User.findById(req.params.userId, function(err, user) {
         if (err) {
            res.send(err);
         }
         res.json(user);
      });
   })
   .put(function(req, res) {
      User.findById(req.params.userId, function(err, user) {
         if (err) {
            res.send(err);
         }
         user.name = req.body.name;
         user.save(function(err) {
            if (err) {
               res.send(err);
            }
            res.send('added');
         });
      });
   })
   .delete(function(req, res) {
      User.remove({
         _id: req.params.userId
      }, function(err, bear) {
         if (err) {
            res.send(err);
         }
         res.send('deleted');
      });
   });

// Return router
module.exports = router;