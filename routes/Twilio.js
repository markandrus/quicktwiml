module.exports = function(app) {

var twilio = require('twilio');

app.post('/', function(req, res) {
  if (twilio.validateExpressRequest(req, process.env.TWILIO_AUTH_TOKEN)) {
    var key = req.body.key;
    if (typeof key !== 'string')
      res.send(400);
    else
      res.redirect(302, '/TwiML/' + key);
  } else
    res.send(400);
  res.end();
});

};
