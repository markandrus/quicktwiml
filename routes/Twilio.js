module.exports = function(app) {

var twilio = require('twilio'),
    validate = require('../validate/TwiML.js');

// Twilio's Entry Point
// --------------------

// Twilio will make a POST request to `/' with either the parameter `key` or
// `twiml`. In the former case, we redirect Twilio to the TwiML via a 302
// response (Twilio will then make a GET request to that URL). In the latter
// case, we simply echo the TwiML contained in the `twiml` parameter.

// Response Codes:

//   * 200
//   * 302
//   * 400
//   * 401

function handle(req, res) {
  if (twilio.validateExpressRequest(req, process.env.TWILIO_AUTH_TOKEN)) {
    var key = req.body.key, twiml = req.body.twiml;
    /* Redirect to TwiML. */
    if (key && !twiml)
      return res.redirect(302, '/TwiML/' + key);
    /* Echo TwiML. */
    else if (!key && twiml &&
        validate(decodeURIComponent(twiml))) {
      res.set('Content-Type', 'application/xml');
      res.send(200, twiml);
    /* Bad Request */
    } else
      res.send(400);
  /* Unauthorized. */
  } else
    res.send(401);
  res.end();
}

app.post('/', handle);

};
