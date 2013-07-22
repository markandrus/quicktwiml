module.exports = function(app) {

var validate = require('../validate/TwiML.js');

// POST
// ----

// Clients can post TwiML to `/validate'. Valid TwiML is answered with a 200
// response, and invalid TwiML is answered with a 204 response.

app.post('/validate', function(req, res) {
  res.send(validate(req.body.content) ? 200 : 204);
  res.end();
});

};
