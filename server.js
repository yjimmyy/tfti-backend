// dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var https = require('https');
var authenticate = require('./authenticate');

// MongoDB
mongoose.connect('mongodb://localhost/tfti');

var app = express();

// express
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//TODO: reset app secret
app.use(authenticate.fbUserTokenAuthenticate('77b0f84cb6d64bda2c1428e546eaf615'));

// routes
app.use('/api', require('./routes/api'));

// start server
app.listen(3000);
console.log('working on 3000');