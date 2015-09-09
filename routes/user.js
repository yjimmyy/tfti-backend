var express = require('express');
var router = express.Router();
var User = require('../models/userSchema'); // userSchema

router.use(function(req, res, next) {
   console.log('user req received');
   next();
});

router.route('/')
   .post(function(req, res) {
      var user = new User();
      user.name = req.body.name;

      user.save(function(err) {
         if (err) {
            res.send(err);
         }
         res.send('user added');
      });

   })
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