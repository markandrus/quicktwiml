module.exports = function(app) {

var twilio = require('twilio');

function handle(req, res) {
  if ((key = req.body.key) &&
      twilio.validateExpressRequest(req, process.env.TWILIO_AUTH_TOKEN))
    res.redirect(302, '/TwiML/' + key);
  else
    res.send(400);
  res.end();
}

app.post('/', handle);

};
