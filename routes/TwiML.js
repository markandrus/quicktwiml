module.exports = function (app, TwiML) {

var twilio = require('twilio'),
    validate = require('../validate/TwiML.js');

// Try to create or update TwiML (returning its key).
function update(req, res, found) {
  var twiml = found || new TwiML;
  twiml.title = req.params.title;
  twiml.content = req.params.content;
  twiml.save(function(err) {
    if (err)
      res.send(500);
    else {
      res.set('Content-Type', 'text/plain');
      res.send(200, twiml.key);
    }
    res.end();
  });
}

app.post('/TwiML/:key?', function(req, res) {
  // Send 400 if client attempts to POST invalid TwiML.
  if (!validate(req.params.content)) {
    res.send(400);
    return res.end();
  }
  // Try to create or update TwiML (returning its key).
  var key = req.params.key;
  if (key)
    TwiML.findOne({ where: { key: key } }, function(err, twiml) {
      if (!err)
        return update(req, res, twiml);
      res.send(500);
      res.end();
    });
  // Try to create TwiML (returning its key).
  else
    update(req, res);
});

app.get('/TwiML/:key?', function(req, res) {
  var key = req.params.key;
  if (key)
    return TwiML.findOne({ where: { key: key } }, function(err, twiml) {
      // Server error.
      if (err)
        res.send(500);
      // TwiML not found.
      else if (!twiml)
        res.send(404);
      // Serve TwiML for Twilio.
      else if
          (twilio.validateExpressRequest(req, process.env.TWILIO_AUTH_TOKEN)) {
        res.set('Content-Type', 'application/xml');
        res.send(200, twiml.content);
      // Serve TwiML for user.
      } else {
        res.set('Content-Type', 'text/html');
        return res.render('TwiML', twiml);
      }
      res.end();
    });
  // Serve TwiML index for user.
  res.render('TwiML-new');
});

};
