module.exports = function(app, basicAuth) {

var twilio = require('twilio'),
    capability = new twilio.Capability();

capability.allowClientOutgoing(process.env.TWILIO_APP_SID);

// POST
// ----

// Response Codes

//   * 200
//   * 201

app.get('/json/token.json', function(req, res) {
  res.set('Content-Type', 'application/javascript');
  if (process.env.APP_ENABLE_CALLS === 'true')
    res.send(201, '{"token":"' + capability.generate() + '"}');
  else
    res.send(200, '{}');
  res.end();
});

};
