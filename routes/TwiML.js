module.exports = function (app, TwiML) {

var validate = require('../validate/TwiML.js');

app.post('/TwiML/:key?', function(req, res) {
  if (!validate(req.params.content)) {
    res.send(400);
    return res.end();
  }
  function newTwiML() {
    var twiml = new TwiML;
    twiml.title = req.params.title;
    twiml.content = req.params.content;
    twiml.save(function(err) {
      if (err) {
        res.send(500);
        return res.end();
      }
    });
  }
  var key = req.params.key;
  if (key) {
    TwiML.findOne({ where: { key: key } }, function(err, twiml) {
      if (err) {
        res.send(500);
      } else if (!twiml) {
        twiml = new Twiml;
        twiml.title = req.params.title;
        twiml.content = req.params.content;
        twiml.save();
      }
    });
  } else {
  }
});

app.get('/TwiML/:key?', function(req, res) {
  var key = req.params.key;
  if (key)
    return TwiML.findOne({ where: { key: key } }, function(err, twiml) {
      // Server error.
      if (err) {
        res.send(500);
      // TwiML not found.
      } else if (!twiml) {
        res.send(404);
      // Serve TwiML for Twilio.
      } else if
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
