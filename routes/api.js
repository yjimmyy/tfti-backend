// Dependencies
var express = require('express');
var router = express.Router();

router.use('/user', require('./user'));
router.use('/spot', require('./spot'));

router.use(function(req, res, next) {
   console.log('api req received');
   next();
});

router.route('/')
   .get(function(req, res) {
   console.log('hello1');
   res.send('hello1');
});

// Return router
module.exports = router;