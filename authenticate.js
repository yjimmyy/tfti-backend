var crypto = require('crypto');
var https = require('https');

// Calls Facebook Graph api using user token to check if provided user id matches
function fbUserTokenAuthenticate(appsecret) {
   // Facebook app secret required for hash
   if (!appsecret) {
      throw new Error('app secret required');
   }

   return function(req, res, next) {
      // Get token and id from authorization header
      var header = req.headers['authorization'] || '';
      // Check if authorization header was found
      if (!header) {
         res.status(400).send('Authentication header required');
         return;
      }
      var parts = header.split(/:/);
      var token = parts[0]; // Get user access token
      var providedUserId = parts[1]; // Get user id

      // Generate appsecret_proof using app secret and user token
      var hash = crypto.createHmac('sha256', appsecret);
      hash.setEncoding('hex');
      hash.write(token);
      hash.end();
      var appsecret_proof = hash.read();

      // Call Facebook Graph api and check if userid matches
      var options = {
         hostname: 'graph.facebook.com',
         port: 443,
         path: '/v2.4/me?access_token=' + token + '&appsecret_proof=' + appsecret_proof,
         method: 'GET'
      };

      var fbreq = https.request(options, function(fbres) {
         var str = '';

         // Build result from chunks
         fbres.on('data', function(d) {
            str += d;
         });

         // Check if user id matches
         fbres.on('end', function() {
            // Parse as JSON
            var returnedUserId = JSON.parse(str).id;

            // If user id matches then user is authenticated
            if (fbres.statusCode === 200 && providedUserId === returnedUserId) {
               console.log('Authentication success');
               next();
            } else { // TODO make responses more consistent
               console.log('user facebook id does not match');
               res.status(400).send('Authentication failed');
            }
         });
      });
      fbreq.end();

      fbreq.on('error', function(e) {
         console.error(e);
         console.log('Error with Facebook request');
         res.sendStatus(400);
      });
   }
}

module.exports.fbUserTokenAuthenticate = fbUserTokenAuthenticate;