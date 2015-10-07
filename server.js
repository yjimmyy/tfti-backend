// dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var https = require('https');
var authenticate = require('./authenticate');

// TODO use https

// MongoDB
//mongoose.connect('mongodb://localhost/tfti');
mongoose.connect('cant make public');

var app = express();

// express
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//TODO: reset app secret
app.use(authenticate.fbUserTokenAuthenticate('cant make public'));

// routes
app.use('/api', require('./routes/api'));

// start server
var port = 8080;
app.listen(port);
console.log('working on ' + port);